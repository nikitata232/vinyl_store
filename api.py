from fastapi import FastAPI, HTTPException
import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vinyl_store.settings')
django.setup()

from store.schemas import VinylSchema, CreateOrder
from store.services import get_all_vinyls, get_vinyl_by_id, create_order_with_items

app = FastAPI()

@app.get("/vinyls", response_model=list[VinylSchema])
def get_vinyls():
    vinyls = get_all_vinyls()
    return [
        {
            "id": v.id,
            "title": v.title,
            "artist": v.artist.name,
            "genre": v.genre.name if v.genre else None,
            "price": float(v.price),
            "stock": v.stock
        }
        for v in vinyls
    ]

@app.get("/vinyls/{vinyl_id}")
def get_vinyl(vinyl_id: int):
    try:
        v = get_vinyl_by_id(vinyl_id)
        return {
            "id": v.id,
            "title": v.title,
            "artist": v.artist.name,
            "genre": v.genre.name if v.genre else None,
            "price": float(v.price),
            "stock": v.stock
        }
    except Exception:
        raise HTTPException(status_code=404, detail="Vinyl not found")

@app.post("/orders")
def create_order(order_data: CreateOrder):
    try:
        order = create_order_with_items(order_data.items)
        return {"message": "Order created", "total_price": float(order.total_price)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Server error")