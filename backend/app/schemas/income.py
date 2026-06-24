from __future__ import annotations
from pydantic import BaseModel, field_validator
import datetime
from typing import Optional, List


class IncomeCreate(BaseModel):
    date: datetime.date
    source: str
    amount: float
    notes: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Amount must be positive")
        return v

    @field_validator("source")
    @classmethod
    def source_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Source cannot be empty")
        return v.strip()


class IncomeUpdate(BaseModel):
    date: Optional[datetime.date] = None
    source: Optional[str] = None
    amount: Optional[float] = None
    notes: Optional[str] = None


class IncomeOut(BaseModel):
    id: int
    user_id: int
    date: datetime.date
    source: str
    amount: float
    notes: Optional[str]
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime]

    model_config = {"from_attributes": True}


class IncomeListResponse(BaseModel):
    items: List[IncomeOut]
    total: int
    page: int
    page_size: int
    total_pages: int
