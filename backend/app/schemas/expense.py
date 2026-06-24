from __future__ import annotations
from pydantic import BaseModel, field_validator
import datetime
from typing import Optional, List

VALID_CATEGORIES = [
    "Food & Dining", "Transport", "Housing", "Healthcare",
    "Shopping", "Education", "Entertainment", "Personal Care",
    "Travel", "Utilities", "Family", "Others",
]

SUBCATEGORIES = {
    "Food & Dining":  ["Groceries", "Restaurant", "Snacks", "Home Cooking", "Coffee", "Other"],
    "Transport":      ["Fuel", "Auto/Taxi", "Bus/Train", "Vehicle Service", "Parking", "Other"],
    "Housing":        ["Rent", "Electricity", "Water", "Maintenance", "Internet", "Other"],
    "Healthcare":     ["Doctor", "Medicine", "Hospital", "Tests/Lab", "Insurance", "Other"],
    "Shopping":       ["Clothing", "Electronics", "Household", "Furniture", "Appliances", "Other"],
    "Education":      ["School Fees", "Books", "Courses", "Stationery", "Tuition", "Other"],
    "Entertainment":  ["Movies", "Streaming", "Events", "Games", "Hobbies", "Other"],
    "Personal Care":  ["Salon", "Gym", "Cosmetics", "Spa", "Other"],
    "Travel":         ["Hotel", "Flights", "Local Travel", "Sightseeing", "Holiday Package", "Other"],
    "Utilities":      ["Phone Bill", "DTH", "Gas", "Subscriptions", "Other"],
    "Family":         ["Gifts", "Events", "Children", "Parents Support", "Celebrations", "Other"],
    "Others":         ["Miscellaneous", "Other"],
}


class ExpenseCreate(BaseModel):
    date: datetime.date
    category: str
    subcategory: Optional[str] = None
    amount: float
    notes: Optional[str] = None

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        if v not in VALID_CATEGORIES:
            raise ValueError(f"Category must be one of: {', '.join(VALID_CATEGORIES)}")
        return v

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Amount must be positive")
        return v


class ExpenseUpdate(BaseModel):
    date: Optional[datetime.date] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    amount: Optional[float] = None
    notes: Optional[str] = None


class ExpenseOut(BaseModel):
    id: int
    user_id: int
    date: datetime.date
    category: str
    subcategory: Optional[str]
    amount: float
    notes: Optional[str]
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime]

    model_config = {"from_attributes": True}


class ExpenseListResponse(BaseModel):
    items: List[ExpenseOut]
    total: int
    page: int
    page_size: int
    total_pages: int
