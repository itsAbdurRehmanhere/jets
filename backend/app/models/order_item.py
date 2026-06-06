from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    
    # Product information at time of order (snapshot)
    product_name = Column(String(200), nullable=False)
    product_price = Column(Float, nullable=False)
    product_image = Column(String(500), nullable=True)
    
    # Order item details
    quantity = Column(Integer, nullable=False, default=1)
    subtotal = Column(Float, nullable=False)  # product_price * quantity
    
    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", backref="order_items")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<OrderItem(id={self.id}, product={self.product_name}, quantity={self.quantity})>"