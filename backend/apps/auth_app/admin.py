from django.contrib import admin
from .models import Artist, Genre, Vinyl, Order, OrderItem

admin.site.register(Artist)
admin.site.register(Genre)
admin.site.register(Vinyl)
admin.site.register(Order)
admin.site.register(OrderItem)