import os
import pandas as pd
import psycopg2
from sklearn.preprocessing import LabelEncoder
from sklearn.neighbors import NearestNeighbors
import joblib

# Подключение к БД
conn = psycopg2.connect(
    dbname=os.getenv("DB_NAME", "vinyl_store"),
    user=os.getenv("DB_USER", "postgres"),
    password=os.getenv("DB_PASSWORD", "postgres"),
    host=os.getenv("DB_HOST", "localhost"),
    port=os.getenv("DB_PORT", "5432")
)

#  Загружаем данные 
query = """
    SELECT 
        v.id,
        v.title,
        a.name as artist,
        g.name as genre,
        v.price,
        v.release_year
    FROM auth_app_vinyl v
    JOIN auth_app_artist a ON v.artist_id = a.id
    LEFT JOIN auth_app_genre g ON v.genre_id = g.id
"""
df = pd.read_sql(query, conn)
conn.close()

print(f"Загружено {len(df)} пластинок")

# Кодируем категории
le_genre = LabelEncoder()
le_artist = LabelEncoder()

df['genre_enc'] = le_genre.fit_transform(df['genre'].fillna('Unknown'))
df['artist_enc'] = le_artist.fit_transform(df['artist'])

#  Признаки для модели
features = df[['genre_enc', 'artist_enc', 'price', 'release_year']].fillna(0)

# Обучаем модель
model = NearestNeighbors(n_neighbors=5, metric='euclidean')
model.fit(features)

# Сохраняем всё
os.makedirs('/app/model', exist_ok=True)
joblib.dump(model, '/app/model/recommender.pkl')
joblib.dump(le_genre, '/app/model/le_genre.pkl')
joblib.dump(le_artist, '/app/model/le_artist.pkl')
joblib.dump(df.to_dict('records'), '/app/model/catalog.pkl')

print("Модель сохранена в /app/model/")
print(f"Жанры: {list(le_genre.classes_)}")