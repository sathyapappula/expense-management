from __future__ import annotations
from pydantic import BaseModel
import datetime
from typing import Optional, List

MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]


# ── Credit Card ───────────────────────────────────────────────────

class CreditCardCreate(BaseModel):
    bank_name: str
    card_name: str
    last_four: Optional[str] = None
    credit_limit: Optional[float] = None
    billing_cycle_day: Optional[int] = None
    due_date_day: Optional[int] = None
    interest_rate: Optional[float] = None
    notes: Optional[str] = None


class CreditCardUpdate(BaseModel):
    bank_name: Optional[str] = None
    card_name: Optional[str] = None
    last_four: Optional[str] = None
    credit_limit: Optional[float] = None
    billing_cycle_day: Optional[int] = None
    due_date_day: Optional[int] = None
    interest_rate: Optional[float] = None
    notes: Optional[str] = None


class CreditCardOut(BaseModel):
    id: int
    user_id: int
    bank_name: str
    card_name: str
    last_four: Optional[str]
    credit_limit: Optional[float]
    billing_cycle_day: Optional[int]
    due_date_day: Optional[int]
    interest_rate: Optional[float]
    notes: Optional[str]
    created_at: datetime.datetime
    model_config = {"from_attributes": True}


class CreditCardListResponse(BaseModel):
    items: List[CreditCardOut]
    total: int


# ── Credit Card Bill ──────────────────────────────────────────────

class CreditCardBillCreate(BaseModel):
    card_id: int
    billing_month: int
    billing_year: int
    bill_amount: float
    minimum_due: Optional[float] = None
    due_date: Optional[datetime.date] = None
    notes: Optional[str] = None


class CreditCardBillUpdate(BaseModel):
    bill_amount: Optional[float] = None
    minimum_due: Optional[float] = None
    due_date: Optional[datetime.date] = None
    notes: Optional[str] = None


class BillPaymentCreate(BaseModel):
    paid_amount: Optional[float] = None   # defaults to full bill_amount
    paid_date: Optional[datetime.date] = None
    notes: Optional[str] = None


class CreditCardBillOut(BaseModel):
    id: int
    user_id: int
    card_id: int
    billing_month: int
    billing_year: int
    bill_amount: float
    minimum_due: Optional[float]
    due_date: Optional[datetime.date]
    paid_amount: Optional[float]
    status: str
    paid_date: Optional[datetime.date]
    expense_id: Optional[int]
    notes: Optional[str]
    created_at: datetime.datetime
    model_config = {"from_attributes": True}


class CreditCardBillListResponse(BaseModel):
    items: List[CreditCardBillOut]
    total: int
