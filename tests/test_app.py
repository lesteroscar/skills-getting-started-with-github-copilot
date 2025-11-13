import pytest
import httpx
from src.app import app
from fastapi import FastAPI
from httpx import AsyncClient
from httpx import ASGITransport

transport = httpx.ASGITransport(app=app)

@pytest.mark.asyncio
async def test_get_activities():
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert all("description" in v for v in data.values())

@pytest.mark.asyncio
async def test_signup_and_unregister():
    test_email = "testuser@mergington.edu"
    activity = "Chess Club"
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        # Sign up
        response = await ac.post(f"/activities/{activity}/signup?email={test_email}")
        assert response.status_code == 200 or response.status_code == 400
        # Try duplicate signup
        response2 = await ac.post(f"/activities/{activity}/signup?email={test_email}")
        assert response2.status_code == 400
        # Unregister
        response3 = await ac.post(f"/activities/{activity}/unregister?email={test_email}")
        assert response3.status_code == 200 or response3.status_code == 400
        # Unregister again (should fail)
        response4 = await ac.post(f"/activities/{activity}/unregister?email={test_email}")
        assert response4.status_code == 400
