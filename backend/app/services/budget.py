from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.budget import BudgetRepository
from app.repositories.expense import ExpenseRepository
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetOut, BudgetListResponse
from app.models.budget import Budget
from typing import List
import math


class BudgetService:
    def __init__(self, db: Session):
        self.repo = BudgetRepository(db)
        self.expense_repo = ExpenseRepository(db)

    def _enrich(self, budget: Budget) -> BudgetOut:
        spent = self.expense_repo.total_by_user_month(budget.user_id, budget.year, budget.month)
        category_expenses = self.expense_repo.totals_by_category_month(budget.user_id, budget.year, budget.month)
        category_spent = next((e["total"] for e in category_expenses if e["category"] == budget.category), 0.0)
        utilization = (category_spent / budget.allocated_amount * 100) if budget.allocated_amount > 0 else 0.0
        return BudgetOut(
            id=budget.id,
            user_id=budget.user_id,
            year=budget.year,
            month=budget.month,
            category=budget.category,
            allocated_amount=budget.allocated_amount,
            spent_amount=round(category_spent, 2),
            utilization_pct=round(utilization, 2),
            is_over_budget=category_spent > budget.allocated_amount,
            created_at=budget.created_at,
            updated_at=budget.updated_at,
        )

    def create(self, user_id: int, data: BudgetCreate) -> BudgetOut:
        existing = self.repo.get_by_category_month(user_id, data.year, data.month, data.category)
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Budget already set for this category and month")
        budget = Budget(user_id=user_id, **data.model_dump())
        return self._enrich(self.repo.create(budget))

    def list_by_month(self, user_id: int, year: int, month: int) -> List[BudgetOut]:
        budgets = self.repo.get_by_user_month(user_id, year, month)
        return [self._enrich(b) for b in budgets]

    def list(self, user_id: int, page: int = 1, page_size: int = 50) -> BudgetListResponse:
        skip = (page - 1) * page_size
        items, total = self.repo.get_by_user(user_id, skip, page_size)
        return BudgetListResponse(
            items=[self._enrich(b) for b in items],
            total=total,
        )

    def get(self, user_id: int, budget_id: int) -> BudgetOut:
        budget = self.repo.get_user_budget(user_id, budget_id)
        if not budget:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
        return self._enrich(budget)

    def update(self, user_id: int, budget_id: int, data: BudgetUpdate) -> BudgetOut:
        budget = self.repo.get_user_budget(user_id, budget_id)
        if not budget:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(budget, field, value)
        return self._enrich(self.repo.update(budget))

    def delete(self, user_id: int, budget_id: int) -> None:
        budget = self.repo.get_user_budget(user_id, budget_id)
        if not budget:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
        self.repo.delete(budget)
