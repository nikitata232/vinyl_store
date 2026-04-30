from rest_framework import serializers


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(min_length=3, max_length=150)
    password = serializers.CharField(min_length=6)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


class OrderItemInputSerializer(serializers.Serializer):
    vinyl_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class CreateOrderSerializer(serializers.Serializer):
    items = OrderItemInputSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError('Корзина не может быть пустой')
        return value


class RecommendSerializer(serializers.Serializer):
    genre = serializers.CharField(required=False, allow_null=True, default=None)
    max_price = serializers.FloatField(required=False, allow_null=True, default=None)
    artist = serializers.CharField(required=False, allow_null=True, default=None)


class VinylWriteSerializer(serializers.Serializer):
    title        = serializers.CharField(max_length=255)
    artist       = serializers.CharField(max_length=255)
    genre        = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    price        = serializers.DecimalField(max_digits=8, decimal_places=2)
    stock        = serializers.IntegerField(min_value=0)
    release_year = serializers.IntegerField(min_value=1900, max_value=2100)
    cover_image  = serializers.URLField(max_length=500, required=False, allow_blank=True, default='')
