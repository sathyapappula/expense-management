from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.income import IncomeCreate, IncomeUpdate, IncomeOut, IncomeListResponse
from app.services.income import IncomeService
from app.models.user import User

router = APIRouter()


@router.post("", response_model=IncomeOut, status_code=201)
def create_income(
    data: IncomeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a new income record."""
    return IncomeService(db).create(current_user.id, data)


@router.get("", response_model=IncomeListResponse)
def list_income(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List income records with pagination, search, and date filters."""
    return IncomeService(db).list(current_user.id, page, page_size, search, date_from, date_to)


@router.get("/{income_id}", response_model=IncomeOut)
def get_income(
    income_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single income record."""
    return IncomeService(db).get(current_user.id, income_id)


@router.put("/{income_id}", response_model=IncomeOut)
def update_income(
    income_id: int,
    data: IncomeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update an income record."""
    return IncomeService(db).update(current_user.id, income_id, data)


@router.delete("/{income_id}", status_code=204)
def delete_income(
    income_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete an income record."""
    IncomeService(db).delete(current_user.id, income_id)
