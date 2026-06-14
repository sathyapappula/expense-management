from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.income import IncomeRepository
from app.schemas.income import IncomeCreate, IncomeUpdate, IncomeOut, IncomeListResponse
from app.models.income import Income
from typing import Optional
from datetime import date
import math


class IncomeService:
    def __init__(self, db: Session):
        self.repo = IncomeRepository(db)

    def create(self, user_id: int, data: IncomeCreate) -> IncomeOut:
        income = Income(user_id=user_id, **data.model_dump())
        return IncomeOut.model_validate(self.repo.create(income))

    def list(
        self,
        user_id: int,
        page: int = 1,
        page_size: int = 20,
        search: Optional[str] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
    ) -> IncomeListResponse:
        skip = (page - 1) * page_size
        items, total = self.repo.get_by_user(user_id, skip, page_size, search, date_from, date_to)
        return IncomeListResponse(
            items=[IncomeOut.model_validate(i) for i in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=math.ceil(total / page_size) if total else 1,
        )

    def get(self, user_id: int, income_id: int) -> IncomeOut:
        income = self.repo.get_user_income(user_id, income_id)
        if not income:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income record not found")
        return IncomeOut.model_validate(income)

    def update(self, user_id: int, income_id: int, data: IncomeUpdate) -> IncomeOut:
        income = self.repo.get_user_income(user_id, income_id)
        if not income:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income record not found")
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(income, field, value)
        return IncomeOut.model_validate(self.repo.update(income))

    def delete(self, user_id: int, income_id: int) -> None:
        income = self.repo.get_user_income(user_id, income_id)
        if not income:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income record not found")
        self.repo.delete(income)
