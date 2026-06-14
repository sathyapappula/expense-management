from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetOut, BudgetListResponse
from app.services.budget import BudgetService
from app.models.user import User

router = APIRouter()


@router.post("", response_model=BudgetOut, status_code=201)
def create_budget(data: BudgetCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return BudgetService(db).create(current_user.id, data)


@router.get("", response_model=BudgetListResponse)
def list_budgets(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return BudgetService(db).list(current_user.id, page, page_size)


@router.get("/month/{year}/{month}", response_model=List[BudgetOut])
def get_budget_by_month(
    year: int,
    month: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all budget allocations for a specific month with utilization."""
    return BudgetService(db).list_by_month(current_user.id, year, month)


@router.get("/{budget_id}", response_model=BudgetOut)
def get_budget(budget_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return BudgetService(db).get(current_user.id, budget_id)


@router.put("/{budget_id}", response_model=BudgetOut)
def update_budget(budget_id: int, data: BudgetUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return BudgetService(db).update(current_user.id, budget_id, data)


@router.delete("/{budget_id}", status_code=204)
def delete_budget(budget_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    BudgetService(db).delete(current_user.id, budget_id)
