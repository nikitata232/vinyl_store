from pydantic import BaseModel
from typing import List, Optional

class VinylSchema(BaseModel):
    id: int
    title: str
    artist: str
    genre: Optional[str]
    price: float
    stock: int

    class Config:
        from_attributes = True

class CreateOrderItem(BaseModel):
    vinyl_id: int
    quantity: int

class CreateOrder(BaseModel):
    items: List[CreateOrderItem]
