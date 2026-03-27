from django.db import models

class Artist(models.Model):
    name = models.CharField(max_length=255)
    country = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.name

class Genre(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Vinyl(models.Model):
    title = models.CharField(max_length=255)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE)
    genre = models.ForeignKey(Genre, on_delete=models.SET_NULL, null=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    stock = models.IntegerField(default=0)
    release_year = models.IntegerField()

    def __str__(self):
        return f"{self.title} - {self.artist.name}"

class Order(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    vinyl = models.ForeignKey(Vinyl, on_delete=models.CASCADE)
    quantity = models.IntegerField()