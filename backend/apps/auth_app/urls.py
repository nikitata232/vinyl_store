from django.urls import path
from . import views

urlpatterns = [
    path('auth/register', views.RegisterView.as_view()),
    path('auth/login', views.LoginView.as_view()),
    path('me', views.MeView.as_view()),
    path('vinyls', views.VinylListView.as_view()),
    path('vinyls/<int:vinyl_id>', views.VinylDetailView.as_view()),
    path('orders', views.CreateOrderView.as_view()),
    path('my-orders', views.MyOrdersView.as_view()),
    path('recommend', views.RecommendView.as_view()),
    path('recommend/genres', views.RecommendGenresView.as_view()),
    path('recommend/artists', views.RecommendArtistsView.as_view()),
]
