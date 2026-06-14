from sqlalchemy.orm import Session
from datetime import datetime
from app.repositories.income import IncomeRepository
from app.repositories.expense import ExpenseRepository
from app.repositories.crop import CropRepository
from app.schemas.dashboard import (
    DashboardResponse, DashboardSummary,
    MonthlyTrendItem, CategoryExpense, IncomeVsExpenseItem,
)

MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


class DashboardService:
    def __init__(self, db: Session):
        self.income_repo = IncomeRepository(db)
        self.expense_repo = ExpenseRepository(db)
        self.crop_repo = CropRepository(db)

    def get_dashboard(self, user_id: int) -> DashboardResponse:
        total_income   = self.income_repo.total_by_user(user_id)
        total_expenses = self.expense_repo.total_by_user(user_id)
        crop_stats     = self.crop_repo.dashboard_summary(user_id)
        total_crop_inv = crop_stats["total_crop_investment"]

        # Crop expenses come out of income just like regular expenses
        total_outflow   = total_expenses + total_crop_inv
        total_savings   = total_income - total_outflow
        current_balance = total_savings

        year = datetime.now().year
        income_monthly  = {r["month"]: r["total"] for r in self.income_repo.monthly_totals(user_id, year)}
        expense_monthly = {r["month"]: r["total"] for r in self.expense_repo.monthly_totals(user_id, year)}

        monthly_trend = []
        income_vs_expense = []
        for m in range(1, 13):
            inc = income_monthly.get(m, 0.0)
            exp = expense_monthly.get(m, 0.0)
            monthly_trend.append(MonthlyTrendItem(month=MONTHS[m - 1], income=inc, expense=exp, savings=inc - exp))
            income_vs_expense.append(IncomeVsExpenseItem(month=MONTHS[m - 1], income=inc, expense=exp))

        category_totals = self.expense_repo.totals_by_category(user_id)
        total_cat = sum(c["total"] for c in category_totals) or 1.0
        expense_by_category = [
            CategoryExpense(
                category=c["category"],
                amount=round(c["total"], 2),
                percentage=round(c["total"] / total_cat * 100, 2),
            )
            for c in category_totals
        ]

        return DashboardResponse(
            summary=DashboardSummary(
                total_income=round(total_income, 2),
                total_expenses=round(total_expenses, 2),
                total_savings=round(total_savings, 2),
                current_balance=round(current_balance, 2),
                active_crops=crop_stats["active_crops"],
                total_crop_investment=round(total_crop_inv, 2),
                crop_profit=crop_stats["crop_profit"],
            ),
            monthly_trend=monthly_trend,
            expense_by_category=expense_by_category,
            income_vs_expense=income_vs_expense,
        )
