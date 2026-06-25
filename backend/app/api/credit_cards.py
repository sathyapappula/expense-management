from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.credit_cards import (
    CreditCardCreate, CreditCardUpdate, CreditCardOut, CreditCardListResponse,
    CreditCardBillCreate, CreditCardBillUpdate, BillPaymentCreate,
    CreditCardBillOut, CreditCardBillListResponse,
)
from app.services.credit_cards import CreditCardService

router = APIRouter()

# ── Cards ─────────────────────────────────────────────────────────

@router.post("", response_model=CreditCardOut, status_code=201)
def create_card(data: CreditCardCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return CreditCardService(db).create_card(current_user.id, data)

@router.get("", response_model=CreditCardListResponse)
def list_cards(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return CreditCardService(db).list_cards(current_user.id)

@router.put("/{card_id}", response_model=CreditCardOut)
def update_card(card_id: int, data: CreditCardUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return CreditCardService(db).update_card(current_user.id, card_id, data)

@router.delete("/{card_id}", status_code=204)
def delete_card(card_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    CreditCardService(db).delete_card(current_user.id, card_id)

# ── Bills ─────────────────────────────────────────────────────────

@router.post("/bills", response_model=CreditCardBillOut, status_code=201)
def add_bill(data: CreditCardBillCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return CreditCardService(db).add_bill(current_user.id, data)

@router.get("/bills", response_model=CreditCardBillListResponse)
def list_bills(card_id: Optional[int] = Query(None), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return CreditCardService(db).list_bills(current_user.id, card_id)

@router.put("/bills/{bill_id}", response_model=CreditCardBillOut)
def update_bill(bill_id: int, data: CreditCardBillUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return CreditCardService(db).update_bill(current_user.id, bill_id, data)

@router.delete("/bills/{bill_id}", status_code=204)
def delete_bill(bill_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    CreditCardService(db).delete_bill(current_user.id, bill_id)

@router.post("/bills/{bill_id}/pay", response_model=CreditCardBillOut)
def pay_bill(bill_id: int, data: BillPaymentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return CreditCardService(db).pay_bill(current_user.id, bill_id, data)
