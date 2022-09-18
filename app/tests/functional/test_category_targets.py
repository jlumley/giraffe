import pytest
import random
import uuid

from datetime import datetime

from .. import test_client


def test_savings_target(test_client):
    """Test monthly_target and underfunded are correct"""
    category = dict(name="new category 155", group="group1")
    create_response = test_client.post("/category/create", json=category)
    category_id = create_response.json.get("id")
    target = dict(
        target_amount=12000, target_date="2022-12-31"
    )

    test_client.put(f"/category/target/savings_target/{category_id}", json=target)
    test_client.put(
        f"/category/assign/{category_id}", json=dict(amount=900, date="2022-01-01")
    )

    category_response = test_client.get(f"/category/{category_id}/2022-01-01")
    assert category_response.status_code == 200
    assert category_response.json.get("monthly_target") == 1000
    assert category_response.json.get("underfunded") == 1000 - 900


def test_savings_target_overfunded(test_client):
    """Test monthly_target and underfunded are correct"""
    category = dict(name="new category 1575", group="group1")
    create_response = test_client.post("/category/create", json=category)
    category_id = create_response.json.get("id")
    target = dict(
        target_amount=12000, target_date="2022-12-31"
    )

    test_client.put(f"/category/target/savings_target/{category_id}", json=target)
    test_client.put(
        f"/category/assign/{category_id}", json=dict(amount=1100, date="2022-01-01")
    )

    category_response = test_client.get(f"/category/{category_id}/2022-01-01")
    assert category_response.status_code == 200
    assert category_response.json.get("monthly_target") == 1000
    assert category_response.json.get("underfunded") == 0


def test_monthly_savings_target(test_client):
    """Test monthly_target and underfunded are correct"""
    category = dict(name="new category 1565", group="group1")
    create_response = test_client.post("/category/create", json=category)
    category_id = create_response.json.get("id")
    target = dict(target_amount=6700)

    test_client.put(f"/category/target/monthly_savings/{category_id}", json=target)
    test_client.put(
        f"/category/assign/{category_id}", json=dict(amount=777, date="2022-01-01")
    )

    category_response = test_client.get(f"/category/{category_id}/2022-01-01")
    assert category_response.status_code == 200
    assert category_response.json.get("monthly_target") == 6700
    assert category_response.json.get("underfunded") == 6700 - 777


def test_monthly_savings_target_overfunded(test_client):
    """Test monthly_target and underfunded are correct"""
    category = dict(name="new category 15565", group="group1")
    create_response = test_client.post("/category/create", json=category)
    category_id = create_response.json.get("id")
    target = dict(target_amount=6700)

    test_client.put(f"/category/target/monthly_savings/{category_id}", json=target)
    test_client.put(
        f"/category/assign/{category_id}", json=dict(amount=6701, date="2022-01-01")
    )

    category_response = test_client.get(f"/category/{category_id}/2022-01-01")
    assert category_response.status_code == 200
    assert category_response.json.get("monthly_target") == 6700
    assert category_response.json.get("underfunded") == 0
