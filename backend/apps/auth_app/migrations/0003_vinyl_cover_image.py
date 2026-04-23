from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auth_app', '0002_order_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='vinyl',
            name='cover_image',
            field=models.URLField(blank=True, max_length=500, null=True),
        ),
    ]
