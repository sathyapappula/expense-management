import pytest
from datetime import date


def test_create_income(client, auth_headers):
    response = client.post("/api/v1/income", json={
        "date": str(date.today()),
        "source": "Salary",
        "amount": 50000.0,
        "notes": "Monthly salary",
    }, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["source"] == "Salary"
    assert data["amount"] == 50000.0


def test_list_income(client, auth_headers):
    client.post("/api/v1/income", json={"date": str(date.today()), "source": "Salary", "amount": 50000.0}, headers=auth_headers)
    response = client.get("/api/v1/income", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert len(data["items"]) >= 1


def test_get_income(client, auth_headers):
    r = client.post("/api/v1/income", json={"date": str(date.today()), "source": "Freelance", "amount": 10000.0}, headers=auth_headers)
    income_id = r.json()["id"]
    response = client.get(f"/api/v1/income/{income_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["id"] == income_id


def test_update_income(client, auth_headers):
    r = client.post("/api/v1/income", json={"date": str(date.today()), "source": "Old Source", "amount": 1000.0}, headers=auth_headers)
    income_id = r.json()["id"]
    response = client.put(f"/api/v1/income/{income_id}", json={"source": "New Source", "amount": 2000.0}, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["source"] == "New Source"


def test_delete_income(client, auth_headers):
    r = client.post("/api/v1/income", json={"date": str(date.today()), "source": "To Delete", "amount": 500.0}, headers=auth_headers)
    income_id = r.json()["id"]
    response = client.delete(f"/api/v1/income/{income_id}", headers=auth_headers)
    assert response.status_code == 204
    get_response = client.get(f"/api/v1/income/{income_id}", headers=auth_headers)
    assert get_response.status_code == 404


def test_income_invalid_amount(client, auth_headers):
    response = client.post("/api/v1/income", json={"date": str(date.today()), "source": "Test", "amount": -100.0}, headers=auth_headers)
    assert response.status_code == 422
