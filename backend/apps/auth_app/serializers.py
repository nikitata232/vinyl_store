from rest_framework import serializers


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    is_admin = serializers.BooleanField(default=False)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


class OrderItemInputSerializer(serializers.Serializer):
    vinyl_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class CreateOrderSerializer(serializers.Serializer):
    items = OrderItemInputSerializer(many=True)


class RecommendSerializer(serializers.Serializer):
    genre = serializers.CharField(required=False, allow_null=True, default=None)
    max_price = serializers.FloatField(required=False, allow_null=True, default=None)
    artist = serializers.CharField(required=False, allow_null=True, default=None)
