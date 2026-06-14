from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, List
from app.schemas.expense import VALID_CATEGORIES


class BudgetCreate(BaseModel):
    year: int
    month: int
    category: str
    allocated_amount: float

    @field_validator("month")
    @classmethod
    def month_valid(cls, v: int) -> int:
        if v < 1 or v > 12:
            raise ValueError("Month must be between 1 and 12")
        return v

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        if v not in VALID_CATEGORIES:
            raise ValueError(f"Category must be one of: {', '.join(VALID_CATEGORIES)}")
        return v

    @field_validator("allocated_amount")
    @classmethod
    def amount_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Allocated amount must be positive")
        return v


class BudgetUpdate(BaseModel):
    allocated_amount: Optional[float] = None


class BudgetOut(BaseModel):
    id: int
    user_id: int
    year: int
    month: int
    category: str
    allocated_amount: float
    spent_amount: float = 0.0
    utilization_pct: float = 0.0
    is_over_budget: bool = False
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


class BudgetListResponse(BaseModel):
    items: List[BudgetOut]
    total: int
