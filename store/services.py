from .models import Vinyl, Order, OrderItem


def get_all_vinyls():
    return Vinyl.objects.all()


def get_vinyl_by_id(vinyl_id: int):
    return Vinyl.objects.get(id=vinyl_id)


def create_order_with_items(items):
    total_price = 0
    order = Order.objects.create(total_price=0)

    for item in items:
        vinyl = Vinyl.objects.get(id=item.vinyl_id)

        if vinyl.stock < item.quantity:
            raise ValueError("Not enough stock")

        vinyl.stock -= item.quantity
        vinyl.save()

        OrderItem.objects.create(
            order=order,
            vinyl=vinyl,
            quantity=item.quantity
        )

        total_price += float(vinyl.price) * item.quantity

    order.total_price = total_price
    order.save()

    return order
