from pydantic import BaseModel
from typing import List


class DashboardSummary(BaseModel):
    total_income: float
    total_expenses: float
    total_savings: float
    current_balance: float
    active_crops: int = 0
    total_crop_investment: float = 0.0
    crop_profit: float = 0.0


class MonthlyTrendItem(BaseModel):
    month: str
    income: float
    expense: float
    savings: float


class CategoryExpense(BaseModel):
    category: str
    amount: float
    percentage: float


class IncomeVsExpenseItem(BaseModel):
    month: str
    income: float
    expense: float


class DashboardResponse(BaseModel):
    summary: DashboardSummary
    monthly_trend: List[MonthlyTrendItem]
    expense_by_category: List[CategoryExpense]
    income_vs_expense: List[IncomeVsExpenseItem]
