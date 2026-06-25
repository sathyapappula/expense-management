from __future__ import annotations
from pydantic import BaseModel, field_validator
import datetime
from typing import Optional, List

LOAN_TYPES = ["Home Loan", "Car Loan", "Personal Loan", "Education Loan", "Gold Loan", "Business Loan", "Other"]


# ── Loans ─────────────────────────────────────────────────────────

class LoanCreate(BaseModel):
    loan_type: str
    lender: str
    principal_amount: float
    outstanding_amount: float
    interest_rate: Optional[float] = None
    emi_amount: Optional[float] = None
    tenure_months: Optional[int] = None
    start_date: Optional[datetime.date] = None
    end_date: Optional[datetime.date] = None
    notes: Optional[str] = None
    status: str = "active"

    @field_validator("loan_type")
    @classmethod
    def validate_loan_type(cls, v: str) -> str:
        if v not in LOAN_TYPES:
            raise ValueError(f"Loan type must be one of: {', '.join(LOAN_TYPES)}")
        return v


class LoanUpdate(BaseModel):
    loan_type: Optional[str] = None
    lender: Optional[str] = None
    outstanding_amount: Optional[float] = None
    interest_rate: Optional[float] = None
    emi_amount: Optional[float] = None
    tenure_months: Optional[int] = None
    end_date: Optional[datetime.date] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class LoanOut(BaseModel):
    id: int
    user_id: int
    loan_type: str
    lender: str
    principal_amount: float
    outstanding_amount: float
    interest_rate: Optional[float]
    emi_amount: Optional[float]
    tenure_months: Optional[int]
    start_date: Optional[datetime.date]
    end_date: Optional[datetime.date]
    notes: Optional[str]
    status: str
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime]
    model_config = {"from_attributes": True}


class LoanListResponse(BaseModel):
    items: List[LoanOut]
    total: int


# ── Investments (Shares + Mutual Funds) ───────────────────────────

class InvestmentCreate(BaseModel):
    investment_type: str   # shares / mutual_fund
    name: str
    ticker: Optional[str] = None
    quantity: Optional[float] = None
    buy_price: Optional[float] = None
    current_price: Optional[float] = None
    total_invested: float
    fund_house: Optional[str] = None
    buy_date: Optional[datetime.date] = None
    notes: Optional[str] = None

    @field_validator("investment_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in ("shares", "mutual_fund"):
            raise ValueError("investment_type must be 'shares' or 'mutual_fund'")
        return v


class InvestmentUpdate(BaseModel):
    name: Optional[str] = None
    ticker: Optional[str] = None
    quantity: Optional[float] = None
    buy_price: Optional[float] = None
    current_price: Optional[float] = None
    total_invested: Optional[float] = None
    fund_house: Optional[str] = None
    notes: Optional[str] = None


class InvestmentOut(BaseModel):
    id: int
    user_id: int
    investment_type: str
    name: str
    ticker: Optional[str]
    quantity: Optional[float]
    buy_price: Optional[float]
    current_price: Optional[float]
    total_invested: float
    fund_house: Optional[str]
    buy_date: Optional[datetime.date]
    notes: Optional[str]
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime]
    model_config = {"from_attributes": True}


class InvestmentListResponse(BaseModel):
    items: List[InvestmentOut]
    total: int

