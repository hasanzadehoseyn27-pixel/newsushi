from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.order import OrderStatus


class OrderItemIn(BaseModel):
    slug: str
    name: str
    price: int
    qty: int = Field(gt=0)


class OrderCreate(BaseModel):
    customer_name: str
    phone: str
    address: str = ""
    notes: str = ""
    items: list[OrderItemIn]


class OrderUpdate(BaseModel):
    status: OrderStatus


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    customer_name: str
    phone: str
    address: str
    notes: str
    items: list[dict]
    total_toman: int
    status: OrderStatus
    created_at: datetime
