from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.models.admin_user import AdminUser
from app.models.order import Order
from app.schemas.order import OrderCreate, OrderOut, OrderUpdate

router = APIRouter(prefix="/api/orders", tags=["orders"])

MAX_ITEMS_PER_ORDER = 100


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def create_order(payload: OrderCreate, db: AsyncSession = Depends(get_db)):
    if not payload.items:
        raise HTTPException(status_code=400, detail="سبد خرید خالی است")
    if len(payload.items) > MAX_ITEMS_PER_ORDER:
        raise HTTPException(status_code=400, detail="تعداد اقلام سفارش بیش از حد مجاز است")

    total = sum(item.price * item.qty for item in payload.items)

    order = Order(
        customer_name=payload.customer_name,
        phone=payload.phone,
        address=payload.address,
        notes=payload.notes,
        items=[item.model_dump() for item in payload.items],
        total_toman=total,
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)
    return order


@router.get("", response_model=list[OrderOut])
async def list_orders(
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(Order).order_by(Order.created_at.desc()))
    return result.scalars().all()


@router.patch("/{order_id}", response_model=OrderOut)
async def update_order(
    order_id: int,
    payload: OrderUpdate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    order = await db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="سفارش پیدا نشد")
    order.status = payload.status
    await db.commit()
    await db.refresh(order)
    return order
