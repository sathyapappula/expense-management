from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.assets import (
    LoanCreate, LoanUpdate, LoanOut, LoanListResponse,
    InvestmentCreate, InvestmentUpdate, InvestmentOut, InvestmentListResponse,
)
from app.services.assets import LoanService, InvestmentService

router = APIRouter()


# ── Loans ─────────────────────────────────────────────────────────

@router.post("/loans", response_model=LoanOut, status_code=201)
def create_loan(data: LoanCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return LoanService(db).create(current_user.id, data)

@router.get("/loans", response_model=LoanListResponse)
def list_loans(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return LoanService(db).list(current_user.id)

@router.put("/loans/{loan_id}", response_model=LoanOut)
def update_loan(loan_id: int, data: LoanUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return LoanService(db).update(current_user.id, loan_id, data)

@router.delete("/loans/{loan_id}", status_code=204)
def delete_loan(loan_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    LoanService(db).delete(current_user.id, loan_id)


# ── Investments ───────────────────────────────────────────────────

@router.post("/investments", response_model=InvestmentOut, status_code=201)
def create_investment(data: InvestmentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return InvestmentService(db).create(current_user.id, data)

@router.get("/investments", response_model=InvestmentListResponse)
def list_investments(investment_type: Optional[str] = Query(None), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return InvestmentService(db).list(current_user.id, investment_type)

@router.put("/investments/{inv_id}", response_model=InvestmentOut)
def update_investment(inv_id: int, data: InvestmentUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return InvestmentService(db).update(current_user.id, inv_id, data)

@router.delete("/investments/{inv_id}", status_code=204)
def delete_investment(inv_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    InvestmentService(db).delete(current_user.id, inv_id)

