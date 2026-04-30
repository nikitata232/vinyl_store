import os
import numpy as np
import joblib

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Vinyl, Order, OrderItem, Artist, Genre
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    CreateOrderSerializer,
    RecommendSerializer,
    VinylWriteSerializer,
)

User = get_user_model()

# ── ML MODEL ────────────────────────────────────────
_model_dir = settings.MODEL_DIR
try:
    recommender = joblib.load(os.path.join(_model_dir, 'recommender.pkl'))
    le_genre    = joblib.load(os.path.join(_model_dir, 'le_genre.pkl'))
    le_artist   = joblib.load(os.path.join(_model_dir, 'le_artist.pkl'))
    catalog     = joblib.load(os.path.join(_model_dir, 'catalog.pkl'))
    print("Модель рекомендаций загружена!")
except Exception as e:
    print(f"Модель не загружена: {e}")
    recommender = le_genre = le_artist = catalog = None


# ── AUTH ────────────────────────────────────────────
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ser = RegisterSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        if User.objects.filter(username=data['username']).exists():
            return Response({'detail': 'Пользователь уже существует'}, status=400)

        User.objects.create_user(
            username=data['username'],
            password=data['password'],
        )
        return Response({'message': 'User created'})


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ser = LoginSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        try:
            user = User.objects.get(username=data['username'])
        except User.DoesNotExist:
            return Response({'detail': 'Invalid credentials'}, status=401)

        if not user.check_password(data['password']):
            return Response({'detail': 'Invalid credentials'}, status=401)

        refresh = RefreshToken.for_user(user)
        return Response({
            'access_token': str(refresh.access_token),
            'token_type':   'bearer',
        })


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id':       user.id,
            'username': user.username,
            'is_admin': user.is_staff,
        })


# ── VINYLS ──────────────────────────────────────────
class VinylListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        vinyls = Vinyl.objects.select_related('artist', 'genre').all()
        return Response([
            {
                'id':           v.id,
                'title':        v.title,
                'artist':       v.artist.name,
                'genre':        v.genre.name if v.genre else None,
                'price':        float(v.price),
                'stock':        v.stock,
                'release_year': v.release_year,
                'cover_image':  v.cover_image or None,
            }
            for v in vinyls
        ])


class VinylDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, vinyl_id):
        try:
            v = Vinyl.objects.select_related('artist', 'genre').get(id=vinyl_id)
        except Vinyl.DoesNotExist:
            return Response({'detail': 'Vinyl not found'}, status=404)

        return Response({
            'id':           v.id,
            'title':        v.title,
            'artist':       v.artist.name,
            'genre':        v.genre.name if v.genre else None,
            'price':        float(v.price),
            'stock':        v.stock,
            'release_year': v.release_year,
            'cover_image':  v.cover_image or None,
        })


# ── ORDERS ──────────────────────────────────────────
class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ser = CreateOrderSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        items = ser.validated_data['items']

        try:
            with transaction.atomic():
                order       = Order.objects.create(user=request.user, total_price=0)
                total_price = 0

                for item in items:
                    vinyl = Vinyl.objects.select_for_update().get(id=item['vinyl_id'])

                    if vinyl.stock < item['quantity']:
                        raise ValueError(f'Недостаточно товара: {vinyl.title}')

                    vinyl.stock -= item['quantity']
                    vinyl.save()

                    OrderItem.objects.create(
                        order=order,
                        vinyl=vinyl,
                        quantity=item['quantity'],
                    )
                    total_price += float(vinyl.price) * item['quantity']

                order.total_price = total_price
                order.save()

        except Vinyl.DoesNotExist:
            return Response({'detail': 'Пластинка не найдена'}, status=404)
        except ValueError as e:
            return Response({'detail': str(e)}, status=400)

        return Response({
            'message':     'Order created',
            'total_price': total_price,
            'user':        request.user.username,
        })


class MyOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = (
            Order.objects
            .filter(user=request.user)
            .prefetch_related('items__vinyl__artist')
            .order_by('-created_at')
        )
        return Response([
            {
                'id':          o.id,
                'created_at':  o.created_at.strftime('%d.%m.%Y %H:%M'),
                'total_price': float(o.total_price),
                'items': [
                    {
                        'vinyl_id': oi.vinyl.id,
                        'title':    oi.vinyl.title,
                        'artist':   oi.vinyl.artist.name,
                        'quantity': oi.quantity,
                        'price':    float(oi.vinyl.price),
                    }
                    for oi in o.items.all()
                ],
            }
            for o in orders
        ])


# ── RECOMMENDER ─────────────────────────────────────
class RecommendView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        if not recommender:
            return Response({'detail': 'Модель не загружена'}, status=500)

        ser = RecommendSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        genre     = data['genre']
        max_price = data['max_price']
        artist    = data['artist']

        genre_enc = 0
        if genre and genre in le_genre.classes_:
            genre_enc = int(le_genre.transform([genre])[0])

        artist_enc = 0
        if artist and artist in le_artist.classes_:
            artist_enc = int(le_artist.transform([artist])[0])

        price = float(max_price) if max_price else 5000.0
        query = np.array([[genre_enc, artist_enc, price, 2010]])
        distances, indices = recommender.kneighbors(query)

        results = []
        for idx in indices[0]:
            item = catalog[idx]
            if max_price and item['price'] > float(max_price):
                continue
            try:
                v = Vinyl.objects.get(id=item['id'])
                results.append({
                    'id':           item['id'],
                    'title':        item['title'],
                    'artist':       item['artist'],
                    'genre':        item['genre'],
                    'price':        float(item['price']),
                    'stock':        v.stock,
                    'release_year': v.release_year,
                })
            except Vinyl.DoesNotExist:
                pass

        return Response({'recommendations': results})


class RecommendGenresView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if not le_genre:
            return Response({'detail': 'Модель не загружена'}, status=500)
        return Response({'genres': list(le_genre.classes_)})


class RecommendArtistsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if not le_artist:
            return Response({'detail': 'Модель не загружена'}, status=500)
        return Response({'artists': list(le_artist.classes_)})


# ── ADMIN ────────────────────────────────────────────
def _vinyl_data(v):
    return {
        'id':           v.id,
        'title':        v.title,
        'artist':       v.artist.name,
        'artist_id':    v.artist.id,
        'genre':        v.genre.name if v.genre else None,
        'genre_id':     v.genre.id if v.genre else None,
        'price':        float(v.price),
        'stock':        v.stock,
        'release_year': v.release_year,
        'cover_image':  v.cover_image or None,
    }


class AdminOrdersView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        orders = (
            Order.objects
            .select_related('user')
            .prefetch_related('items__vinyl__artist')
            .order_by('-created_at')
        )
        return Response([
            {
                'id':          o.id,
                'user':        o.user.username if o.user else '—',
                'created_at':  o.created_at.strftime('%d.%m.%Y %H:%M'),
                'total_price': float(o.total_price),
                'items': [
                    {
                        'vinyl_id': oi.vinyl.id,
                        'title':    oi.vinyl.title,
                        'artist':   oi.vinyl.artist.name,
                        'quantity': oi.quantity,
                        'price':    float(oi.vinyl.price),
                    }
                    for oi in o.items.all()
                ],
            }
            for o in orders
        ])


class AdminUsersView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.all().order_by('id')
        return Response([
            {
                'id':         u.id,
                'username':   u.username,
                'is_admin':   u.is_staff,
                'orders':     u.order_set.count(),
                'joined':     u.date_joined.strftime('%d.%m.%Y'),
            }
            for u in users
        ])


class AdminVinylView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        ser = VinylWriteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        d = ser.validated_data

        artist, _ = Artist.objects.get_or_create(name=d['artist'])
        genre,  _ = Genre.objects.get_or_create(name=d['genre']) if d.get('genre') else (None, False)

        v = Vinyl.objects.create(
            title=d['title'],
            artist=artist,
            genre=genre,
            price=d['price'],
            stock=d['stock'],
            release_year=d['release_year'],
            cover_image=d.get('cover_image') or None,
        )
        return Response(_vinyl_data(v), status=201)


class AdminVinylDetailView(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, vinyl_id):
        try:
            v = Vinyl.objects.select_related('artist', 'genre').get(id=vinyl_id)
        except Vinyl.DoesNotExist:
            return Response({'detail': 'Не найдено'}, status=404)

        ser = VinylWriteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        d = ser.validated_data

        artist, _ = Artist.objects.get_or_create(name=d['artist'])
        genre,  _ = Genre.objects.get_or_create(name=d['genre']) if d.get('genre') else (None, False)

        v.title        = d['title']
        v.artist       = artist
        v.genre        = genre
        v.price        = d['price']
        v.stock        = d['stock']
        v.release_year = d['release_year']
        v.cover_image  = d.get('cover_image') or None
        v.save()
        return Response(_vinyl_data(v))

    def delete(self, request, vinyl_id):
        try:
            Vinyl.objects.get(id=vinyl_id).delete()
        except Vinyl.DoesNotExist:
            return Response({'detail': 'Не найдено'}, status=404)
        return Response(status=204)


class AdminArtistsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response([
            {'id': a.id, 'name': a.name}
            for a in Artist.objects.order_by('name')
        ])


class AdminGenresView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response([
            {'id': g.id, 'name': g.name}
            for g in Genre.objects.order_by('name')
        ])
