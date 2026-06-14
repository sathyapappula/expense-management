import pytest
from datetime import date


def test_create_expense(client, auth_headers):
    response = client.post("/api/v1/expenses", json={
        "date": str(date.today()),
        "category": "Personal",
        "subcategory": "Food",
        "amount": 1500.0,
        "notes": "Groceries",
    }, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["category"] == "Personal"
    assert data["amount"] == 1500.0


def test_list_expenses(client, auth_headers):
    client.post("/api/v1/expenses", json={"date": str(date.today()), "category": "Home", "amount": 5000.0}, headers=auth_headers)
    response = client.get("/api/v1/expenses", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["total"] >= 1


def test_expense_invalid_category(client, auth_headers):
    response = client.post("/api/v1/expenses", json={
        "date": str(date.today()),
        "category": "InvalidCategory",
        "amount": 100.0,
    }, headers=auth_headers)
    assert response.status_code == 422


def test_filter_expenses_by_category(client, auth_headers):
    client.post("/api/v1/expenses", json={"date": str(date.today()), "category": "Medical", "amount": 2000.0}, headers=auth_headers)
    client.post("/api/v1/expenses", json={"date": str(date.today()), "category": "Travel", "amount": 3000.0}, headers=auth_headers)
    response = client.get("/api/v1/expenses?category=Medical", headers=auth_headers)
    assert response.status_code == 200
    for item in response.json()["items"]:
        assert item["category"] == "Medical"


def test_update_expense(client, auth_headers):
    r = client.post("/api/v1/expenses", json={"date": str(date.today()), "category": "Shopping", "amount": 500.0}, headers=auth_headers)
    expense_id = r.json()["id"]
    response = client.put(f"/api/v1/expenses/{expense_id}", json={"amount": 750.0}, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["amount"] == 750.0


def test_delete_expense(client, auth_headers):
    r = client.post("/api/v1/expenses", json={"date": str(date.today()), "category": "Personal", "amount": 100.0}, headers=auth_headers)
    expense_id = r.json()["id"]
    assert client.delete(f"/api/v1/expenses/{expense_id}", headers=auth_headers).status_code == 204
    assert client.get(f"/api/v1/expenses/{expense_id}", headers=auth_headers).status_code == 404
