import sys
import os
sys.path.insert(0, '/app/backend')

import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@vinylstore.local', 'admin')
    print('Суперпользователь создан: admin / admin')
else:
    print('Суперпользователь уже существует')
