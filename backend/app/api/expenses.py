from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseOut, ExpenseListResponse
from app.services.expense import ExpenseService
from app.models.user import User

router = APIRouter()


@router.post("", response_model=ExpenseOut, status_code=201)
def create_expense(
    data: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a new expense record."""
    return ExpenseService(db).create(current_user.id, data)


@router.get("", response_model=ExpenseListResponse)
def list_expenses(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List expenses with pagination, search, and category filters."""
    return ExpenseService(db).list(current_user.id, page, page_size, search, category, date_from, date_to)


@router.get("/{expense_id}", response_model=ExpenseOut)
def get_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single expense record."""
    return ExpenseService(db).get(current_user.id, expense_id)


@router.put("/{expense_id}", response_model=ExpenseOut)
def update_expense(
    expense_id: int,
    data: ExpenseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update an expense record."""
    return ExpenseService(db).update(current_user.id, expense_id, data)


@router.delete("/{expense_id}", status_code=204)
def delete_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete an expense record."""
    ExpenseService(db).delete(current_user.id, expense_id)
