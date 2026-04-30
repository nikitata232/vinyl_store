from django.contrib import admin
from .models import Artist, Genre, Vinyl, Order, OrderItem

admin.site.site_header = 'VinylStore Admin'
admin.site.site_title  = 'VinylStore'
admin.site.index_title = 'Управление магазином'


class OrderItemInline(admin.TabularInline):
    model         = OrderItem
    extra         = 0
    readonly_fields = ('vinyl', 'quantity')
    can_delete    = False


@admin.register(Artist)
class ArtistAdmin(admin.ModelAdmin):
    list_display  = ('id', 'name', 'country', 'vinyl_count')
    search_fields = ('name', 'country')
    ordering      = ('name',)

    @admin.display(description='Пластинок')
    def vinyl_count(self, obj):
        return obj.vinyl_set.count()


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display  = ('id', 'name', 'vinyl_count')
    search_fields = ('name',)
    ordering      = ('name',)

    @admin.display(description='Пластинок')
    def vinyl_count(self, obj):
        return obj.vinyl_set.count()


@admin.register(Vinyl)
class VinylAdmin(admin.ModelAdmin):
    list_display   = ('id', 'title', 'artist', 'genre', 'price', 'stock', 'release_year')
    list_filter    = ('genre', 'release_year')
    search_fields  = ('title', 'artist__name')
    list_editable  = ('price', 'stock')
    ordering       = ('title',)
    list_per_page  = 30
    autocomplete_fields = ('artist',)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display    = ('id', 'user', 'created_at', 'total_price', 'items_count')
    list_filter     = ('created_at',)
    search_fields   = ('user__username',)
    readonly_fields = ('user', 'created_at', 'total_price')
    inlines         = [OrderItemInline]
    ordering        = ('-created_at',)

    @admin.display(description='Позиций')
    def items_count(self, obj):
        return obj.items.count()
