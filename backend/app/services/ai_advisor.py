from __future__ import annotations
import datetime
from sqlalchemy.orm import Session
from app.models.income import Income
from app.models.expense import Expense
from app.models.assets import Loan, Investment
from app.models.credit_cards import CreditCard, CreditCardBill


def _fmt(v: float) -> str:
    if v >= 1_00_000:
        return f"Rs.{v / 1_00_000:.2f}L"
    if v >= 1_000:
        return f"Rs.{v / 1_000:.1f}K"
    return f"Rs.{v:,.0f}"


def build_financial_snapshot(db: Session, user_id: int) -> str:
    today = datetime.date.today()
    ninety_days_ago = today - datetime.timedelta(days=90)
    thirty_days_ago = today - datetime.timedelta(days=30)

    # ── Income ────────────────────────────────────────────────────
    incomes_90 = db.query(Income).filter(Income.user_id == user_id, Income.date >= ninety_days_ago).all()
    total_income_90 = sum(i.amount for i in incomes_90)
    avg_monthly_income = total_income_90 / 3 if incomes_90 else 0

    income_30 = db.query(Income).filter(Income.user_id == user_id, Income.date >= thirty_days_ago).all()
    income_this_month = sum(i.amount for i in income_30)

    # ── Expenses ──────────────────────────────────────────────────
    expenses_90 = db.query(Expense).filter(
        Expense.user_id == user_id,
        Expense.date >= ninety_days_ago,
        Expense.category != "Credit Card",   # exclude CC payments (already counted separately)
    ).all()
    total_expenses_90 = sum(e.amount for e in expenses_90)
    avg_monthly_expenses = total_expenses_90 / 3 if expenses_90 else 0

    # Category breakdown
    cat_totals: dict[str, float] = {}
    for e in expenses_90:
        cat_totals[e.category] = cat_totals.get(e.category, 0) + e.amount
    top_cats = sorted(cat_totals.items(), key=lambda x: -x[1])[:5]

    # ── Loans ─────────────────────────────────────────────────────
    loans = db.query(Loan).filter(Loan.user_id == user_id).all()
    total_emi = sum(l.emi_amount or 0 for l in loans)
    total_loan_outstanding = sum(l.outstanding_amount for l in loans)

    # ── Investments ───────────────────────────────────────────────
    investments = db.query(Investment).filter(Investment.user_id == user_id).all()
    shares = [i for i in investments if i.investment_type == "shares"]
    mfs    = [i for i in investments if i.investment_type == "mutual_fund"]
    total_invested = sum(i.total_invested for i in investments)
    total_current  = 0
    for inv in investments:
        if inv.current_price and inv.quantity:
            total_current += inv.current_price * inv.quantity
        elif inv.current_price:
            total_current += inv.current_price
        else:
            total_current += inv.total_invested

    # ── Credit Cards ──────────────────────────────────────────────
    cards = db.query(CreditCard).filter(CreditCard.user_id == user_id).all()
    pending_bills = db.query(CreditCardBill).filter(
        CreditCardBill.user_id == user_id,
        CreditCardBill.status != "paid",
    ).all()
    total_cc_pending = sum(b.bill_amount - (b.paid_amount or 0) for b in pending_bills)
    total_cc_limit   = sum(c.credit_limit or 0 for c in cards)

    # ── Key ratios ────────────────────────────────────────────────
    monthly_fixed_outflow = avg_monthly_expenses + total_emi + (total_cc_pending / 3)
    monthly_net = avg_monthly_income - monthly_fixed_outflow
    savings_rate = (monthly_net / avg_monthly_income * 100) if avg_monthly_income > 0 else 0
    dti = (total_emi / avg_monthly_income * 100) if avg_monthly_income > 0 else 0

    # ── Build snapshot string ─────────────────────────────────────
    lines = [
        f"=== USER FINANCIAL SNAPSHOT ({today.strftime('%B %Y')}) ===",
        "",
        "INCOME:",
        f"  • Average monthly income (3-month avg): {_fmt(avg_monthly_income)}",
        f"  • This month income: {_fmt(income_this_month)}",
        "",
        "EXPENSES (excluding credit card payments):",
        f"  • Average monthly expenses (3-month avg): {_fmt(avg_monthly_expenses)}",
        "  • Top spending categories (monthly avg):",
    ]
    for cat, amt in top_cats:
        lines.append(f"      - {cat}: {_fmt(amt / 3)}/month")

    lines += ["", f"LOANS ({len(loans)}):"]
    if loans:
        for l in loans:
            emi_str = f", EMI {_fmt(l.emi_amount)}/month" if l.emi_amount else ""
            rate_str = f", {l.interest_rate}% p.a." if l.interest_rate else ""
            lines.append(f"  • {l.loan_type} ({l.lender}): {_fmt(l.outstanding_amount)} outstanding{emi_str}{rate_str}")
        lines.append(f"  • Total EMIs per month: {_fmt(total_emi)}")
        lines.append(f"  • Total loan outstanding: {_fmt(total_loan_outstanding)}")
    else:
        lines.append("  • No active loans")

    lines += ["", f"INVESTMENTS ({len(investments)}):"]
    if shares:
        total_s_invested = sum(s.total_invested for s in shares)
        total_s_current  = sum((s.current_price * s.quantity if s.current_price and s.quantity else s.total_invested) for s in shares)
        gain = total_s_current - total_s_invested
        ret  = (gain / total_s_invested * 100) if total_s_invested > 0 else 0
        lines.append(f"  • Shares ({len(shares)} stocks): Invested {_fmt(total_s_invested)}, Current {_fmt(total_s_current)} ({'+'if gain>=0 else ''}{ret:.1f}%)")
    if mfs:
        total_m = sum(m.total_invested for m in mfs)
        lines.append(f"  • Mutual Funds ({len(mfs)} funds): Invested {_fmt(total_m)}")
    if not investments:
        lines.append("  • No investments yet")
    if investments:
        portfolio_gain = total_current - total_invested
        lines.append(f"  • Total portfolio: Invested {_fmt(total_invested)}, Current {_fmt(total_current)} ({'+'if portfolio_gain>=0 else ''}{_fmt(abs(portfolio_gain))})")

    lines += ["", f"CREDIT CARDS ({len(cards)} cards):"]
    if cards:
        for card in cards:
            lines.append(f"  • {card.bank_name} {card.card_name}: Limit {_fmt(card.credit_limit or 0)}, Due day {card.due_date_day or 'N/A'}")
        lines.append(f"  • Total pending bills: {_fmt(total_cc_pending)}")
        lines.append(f"  • Total credit limit: {_fmt(total_cc_limit)}")
    else:
        lines.append("  • No credit cards")

    lines += [
        "",
        "KEY FINANCIAL RATIOS:",
        f"  • Monthly take-home: {_fmt(avg_monthly_income)}",
        f"  • Monthly outflow (expenses + EMIs): {_fmt(monthly_fixed_outflow)}",
        f"  • Monthly net savings: {_fmt(monthly_net)}",
        f"  • Savings rate: {savings_rate:.1f}%",
        f"  • EMI-to-income ratio: {dti:.1f}%",
        f"  • Net worth (investments - loans): {_fmt(total_current - total_loan_outstanding)}",
        "=== END OF SNAPSHOT ===",
    ]

    return "\n".join(lines)


SYSTEM_PROMPT = """You are a smart, friendly personal financial advisor AI for an Indian user. You have their complete financial data below.

Your job:
- Answer their financial questions with SPECIFIC numbers from their data
- Calculate eligibility, affordability, timelines based on their actual income/expenses/loans
- Give practical, actionable advice suited to the Indian financial context (EMIs, SIP, FD, etc.)
- Be honest but encouraging — highlight strengths and flag real risks
- Use Rs. prefix for Indian Rupee amounts in your response
- Keep answers concise (under 300 words) but thorough
- If they ask about buying something (car, house, etc.), calculate: EMI affordability, down payment readiness, impact on savings rate
- For eligibility questions, use Indian banking norms: total EMIs should not exceed 40-50% of monthly income

Important: Always base your answer on the ACTUAL numbers from the user's data, not generic advice."""


def ask_groq(snapshot: str, question: str, api_key: str) -> str:
    from groq import Groq

    client = Groq(api_key=api_key)

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": f"{SYSTEM_PROMPT}\n\n{snapshot}"},
            {"role": "user",   "content": question},
        ],
        max_tokens=1024,
        temperature=0.7,
    )

    return response.choices[0].message.content
