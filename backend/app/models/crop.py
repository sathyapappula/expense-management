from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

CROP_TYPES = [
    "Paddy", "Wheat", "Cotton", "Sugarcane", "Maize",
    "Groundnut", "Sunflower", "Soybean", "Vegetables", "Fruits", "Other",
]

CROP_EXPENSE_TYPES = [
    "Seeds", "Fertilizer", "Pesticide", "Irrigation",
    "Labor", "Equipment", "Transport", "Other",
]


class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    crop_type = Column(String(100), nullable=False)
    area_acres = Column(Float, nullable=True)
    start_date = Column(Date, nullable=False)
    expected_harvest_date = Column(Date, nullable=True)
    actual_harvest_date = Column(Date, nullable=True)
    status = Column(String(20), default="active", nullable=False)  # active | harvested | failed
    sale_amount = Column(Float, default=0.0, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class CropExpense(Base):
    __tablename__ = "crop_expenses"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    expense_type = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
