from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

admin.site.site_url = settings.FRONTEND_URL


def health(request):
    return JsonResponse({'status': 'ok', 'service': 'vinyl-store-api'})


urlpatterns = [
    path('', health),
    path('admin/', admin.site.urls),
    path('', include('apps.auth_app.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
] + static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
