from __future__ import annotations
from pydantic import BaseModel, field_validator
import datetime
from typing import Optional, List
from app.models.crop import CROP_TYPES, CROP_EXPENSE_TYPES


class CropExpenseCreate(BaseModel):
    date: datetime.date
    expense_type: str
    amount: float
    notes: Optional[str] = None

    @field_validator("expense_type")
    @classmethod
    def validate_type(cls, v):
        if v not in CROP_EXPENSE_TYPES:
            raise ValueError(f"Must be one of: {', '.join(CROP_EXPENSE_TYPES)}")
        return v

    @field_validator("amount")
    @classmethod
    def positive(cls, v):
        if v <= 0:
            raise ValueError("Amount must be positive")
        return v


class CropExpenseOut(BaseModel):
    id: int
    crop_id: int
    date: datetime.date
    expense_type: str
    amount: float
    notes: Optional[str]
    created_at: datetime.datetime
    model_config = {"from_attributes": True}


class CropCreate(BaseModel):
    name: str
    crop_type: str
    area_acres: Optional[float] = None
    start_date: datetime.date
    expected_harvest_date: Optional[datetime.date] = None
    notes: Optional[str] = None

    @field_validator("crop_type")
    @classmethod
    def validate_crop_type(cls, v):
        if v not in CROP_TYPES:
            raise ValueError(f"Must be one of: {', '.join(CROP_TYPES)}")
        return v


class CropUpdate(BaseModel):
    name: Optional[str] = None
    area_acres: Optional[float] = None
    expected_harvest_date: Optional[datetime.date] = None
    actual_harvest_date: Optional[datetime.date] = None
    status: Optional[str] = None
    sale_amount: Optional[float] = None
    notes: Optional[str] = None


class CropOut(BaseModel):
    id: int
    user_id: int
    name: str
    crop_type: str
    area_acres: Optional[float]
    start_date: datetime.date
    expected_harvest_date: Optional[datetime.date]
    actual_harvest_date: Optional[datetime.date]
    status: str
    sale_amount: float
    notes: Optional[str]
    created_at: datetime.datetime
    total_expenses: float = 0.0
    net_profit: float = 0.0
    roi_pct: float = 0.0
    expenses: List[CropExpenseOut] = []
    model_config = {"from_attributes": True}


class CropListResponse(BaseModel):
    items: List[CropOut]
    total: int
