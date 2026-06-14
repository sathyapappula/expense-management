import pytest


def test_register(client):
    response = client.post("/api/v1/auth/register", json={
        "email": "user@example.com",
        "username": "newuser",
        "full_name": "New User",
        "password": "securepass123",
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "user@example.com"


def test_register_duplicate_email(client):
    payload = {"email": "dup@example.com", "username": "user1", "full_name": "User One", "password": "password123"}
    client.post("/api/v1/auth/register", json=payload)
    payload2 = {**payload, "username": "user2"}
    response = client.post("/api/v1/auth/register", json=payload2)
    assert response.status_code == 400


def test_register_duplicate_username(client):
    payload = {"email": "a@example.com", "username": "samename", "full_name": "A", "password": "password123"}
    client.post("/api/v1/auth/register", json=payload)
    payload2 = {**payload, "email": "b@example.com"}
    response = client.post("/api/v1/auth/register", json=payload2)
    assert response.status_code == 400


def test_login(client):
    client.post("/api/v1/auth/register", json={
        "email": "login@example.com", "username": "loginuser",
        "full_name": "Login User", "password": "mypassword",
    })
    response = client.post("/api/v1/auth/login", json={"email": "login@example.com", "password": "mypassword"})
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_wrong_password(client):
    client.post("/api/v1/auth/register", json={
        "email": "wrongpw@example.com", "username": "wrongpwuser",
        "full_name": "Wrong PW", "password": "correctpassword",
    })
    response = client.post("/api/v1/auth/login", json={"email": "wrongpw@example.com", "password": "wrongpassword"})
    assert response.status_code == 401


def test_get_me(client, auth_headers):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"


def test_get_me_no_token(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 403
