from sqlalchemy import Boolean, Column, Integer, String

from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    phone = Column(String(20), nullable=True)
    address = Column(String(300), nullable=True)
    city = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)