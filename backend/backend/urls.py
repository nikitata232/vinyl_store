from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

admin.site.site_url = settings.FRONTEND_URL


def health(request):
    return JsonResponse({'status': 'ok', 'service': 'vinyl-store-api'})


urlpatterns = [
    path('', health),
    path('admin/', admin.site.urls),
    path('', include('apps.auth_app.urls')),
] + static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
