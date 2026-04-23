import os
import sys
import django
import psycopg

# ── Django setup ────────────────────────────────────
sys.path.insert(0, "/app/backend")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from apps.auth_app.models import Artist, Genre, Vinyl

# ── Подключение к БД (та же, что и у Django) ────────
# Данные берём из тех же env-переменных, что и Django-сервис.
# backup.sql уже загружен в эту БД при старте postgres-контейнера.
conn = psycopg.connect(
    host=os.getenv("DB_HOST", "localhost"),
    port=int(os.getenv("DB_PORT", 5432)),
    dbname=os.getenv("DB_NAME", "vinyl_store"),
    user=os.getenv("DB_USER", "postgres"),
    password=os.getenv("DB_PASSWORD", "postgres"),
)
cur = conn.cursor()

# Пропускаем если данные уже перенесены
if Vinyl.objects.exists():
    print("Данные уже есть в БД, пропускаем перенос.")
    cur.close()
    conn.close()
    sys.exit(0)

# ── Перенос жанров ───────────────────────────────────
print("Переносим жанры...")
cur.execute("SELECT genre_id, genre_name FROM genres")
genre_map = {}
for genre_id, genre_name in cur.fetchall():
    genre, _ = Genre.objects.get_or_create(name=genre_name)
    genre_map[genre_id] = genre
print(f"  Перенесено жанров: {len(genre_map)}")

# ── Перенос артистов ─────────────────────────────────
print("Переносим артистов...")
cur.execute("SELECT artist_id, artist_name, artist_country FROM artists")
artist_map = {}
for artist_id, artist_name, artist_country in cur.fetchall():
    artist, _ = Artist.objects.get_or_create(
        name=artist_name,
        defaults={"country": artist_country or ""}
    )
    artist_map[artist_id] = artist
print(f"  Перенесено артистов: {len(artist_map)}")

# ── Перенос пластинок ────────────────────────────────
print("Переносим пластинки...")
cur.execute("SELECT album_name, artist_id, genre_id, release_year, price FROM albums")
count = 0
for album_name, artist_id, genre_id, release_year, price in cur.fetchall():
    artist = artist_map.get(artist_id)
    genre  = genre_map.get(genre_id)
    if not artist:
        continue
    Vinyl.objects.get_or_create(
        title=album_name,
        artist=artist,
        defaults={
            "genre":        genre,
            "release_year": release_year or 2000,
            "price":        price or 0,
            "stock":        10,
        }
    )
    count += 1
print(f"  Перенесено пластинок: {count}")

cur.close()
conn.close()
print("Перенос завершён!")
