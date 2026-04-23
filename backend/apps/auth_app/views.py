import os
import numpy as np
import joblib

from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Vinyl, Order, OrderItem
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    CreateOrderSerializer,
    RecommendSerializer,
)

User = get_user_model()

# ── ML MODEL ────────────────────────────────────────
_model_dir = settings.MODEL_DIR
try:
    recommender = joblib.load(os.path.join(_model_dir, 'recommender.pkl'))
    le_genre = joblib.load(os.path.join(_model_dir, 'le_genre.pkl'))
    le_artist = joblib.load(os.path.join(_model_dir, 'le_artist.pkl'))
    catalog = joblib.load(os.path.join(_model_dir, 'catalog.pkl'))
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
            return Response({'detail': 'User already exists'}, status=400)

        user = User.objects.create_user(
            username=data['username'],
            password=data['password'],
        )
        if data['is_admin']:
            user.is_staff = True
            user.is_superuser = True
            user.save()

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
            'token_type': 'bearer',
        })


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
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
                'id': v.id,
                'title': v.title,
                'artist': v.artist.name,
                'genre': v.genre.name if v.genre else None,
                'price': float(v.price),
                'stock': v.stock,
                'cover_image': v.cover_image or None,
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
            'id': v.id,
            'title': v.title,
            'artist': v.artist.name,
            'genre': v.genre.name if v.genre else None,
            'price': float(v.price),
            'stock': v.stock,
            'cover_image': v.cover_image or None,
        })


# ── ORDERS ──────────────────────────────────────────
class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ser = CreateOrderSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        items = ser.validated_data['items']

        order = Order.objects.create(user=request.user, total_price=0)
        total_price = 0

        try:
            for item in items:
                vinyl = Vinyl.objects.get(id=item['vinyl_id'])

                if vinyl.stock < item['quantity']:
                    order.delete()
                    return Response({'detail': 'Not enough stock'}, status=400)

                vinyl.stock -= item['quantity']
                vinyl.save()

                OrderItem.objects.create(
                    order=order,
                    vinyl=vinyl,
                    quantity=item['quantity'],
                )
                total_price += float(vinyl.price) * item['quantity']

        except Vinyl.DoesNotExist:
            order.delete()
            return Response({'detail': 'Vinyl not found'}, status=404)

        order.total_price = total_price
        order.save()

        return Response({
            'message': 'Order created',
            'total_price': total_price,
            'user': request.user.username,
        })


class MyOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user)
        return Response([
            {'id': o.id, 'total_price': float(o.total_price)}
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

        genre = data['genre']
        max_price = data['max_price']
        artist = data['artist']

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
            results.append({
                'id': item['id'],
                'title': item['title'],
                'artist': item['artist'],
                'genre': item['genre'],
                'price': float(item['price']),
            })

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
