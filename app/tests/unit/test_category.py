import pytest
import random
import uuid

from .. import test_client


def test_create_category(test_client):
    """Test create new category"""
    categories = [dict(name="new category 1", group="group1")]

    for category in categories:
        create_response = test_client.post("/category/create", json=category)
        assert create_response.status_code == 201
        assert "id" in create_response.json.keys()


def test_create_category_invalid_data(test_client):
    """Test create new category fail cases"""
    categories = [dict(name="test category"), dict(group="test group"), dict()]
    for category in categories:
        create_response = test_client.post("/category/create", json=category)
        assert create_response.status_code == 400


def test_update_category(test_client):
    """Test update category"""
    category_data = dict(name="category foo", group="group foo")
    new_name = "new category name"
    new_group = "new group name"
    updates = [dict(name=new_name), dict(group=new_group)]
    create_response = test_client.post("/category/create", json=category_data)
    category_id = create_response.json.get("id")
    for update in updates:
        update_response = test_client.put(
            f"/category/update/{category_id}", json=update
        )
        assert update_response.status_code == 200

    category_response = test_client.get(f"/category/{category_id}/2022-04-05")
    assert category_response.status_code == 200
    assert category_response.json.get("name") == new_name
    assert category_response.json.get("group") == new_group


def test_get_categories(test_client):
    """Test get all categories"""
    category_response = test_client.get("/category/2022-04-09")
    assert category_response.status_code == 200


def test_get_category_target_types(test_client):
    """Test get all category_target_types"""
    category_response = test_client.get("/category/target/types")
    assert category_response.status_code == 200


def test_get_category(test_client):
    """Test single category by id"""
    category_data = dict(name="category foo2", group="group foo2")

    create_response = test_client.post("/category/create", json=category_data)
    category_id = create_response.json.get("id")

    category_response = test_client.get(f"/category/{category_id}/2022-04-07")
    assert category_response.status_code == 200
    assert category_response.json.get("name") == category_data.get("name")
    assert category_response.json.get("group") == category_data.get("group")


def test_update_category_target(test_client):
    """Test update category target"""
    category = dict(name="new category 81", group="group1")
    create_response = test_client.post("/category/create", json=category)
    category_id = create_response.json.get("id")
    targets = [
        dict(
            target_type="savings_target", target_amount=53567, target_date="2022-11-02"
        ),
        dict(target_type="monthly_savings", target_amount=8900),
    ]
    for t in targets:
        update_response = test_client.put(f"/category/target/{category_id}", json=t)
        update_response.status_code == 200

        category_response = test_client.get(f"/category/{category_id}/2022-04-07")
        assert category_response.status_code == 200
        assert category_response.json.get("target_type") == t.get("target_type")
        assert category_response.json.get("target_amount") == t.get("target_amount")


def test_delete_category_target(test_client):
    """Test delete category target"""
    category = dict(name="new category 155", group="group1")
    create_response = test_client.post("/category/create", json=category)
    category_id = create_response.json.get("id")
    targets = [
        dict(
            target_type="savings_target", target_amount=53567, target_date="2022-11-02"
        ),
        dict(target_type="monthly_savings", target_amount=8900),
    ]
    for t in targets:
        test_client.put(f"/category/target/{category_id}", json=t)
        delete_response = test_client.delete(f"/category/target/{category_id}")
        delete_response.status_code == 200

        category_response = test_client.get(f"/category/{category_id}/2022-04-07")
        assert category_response.status_code == 200
        assert category_response.json.get("target_type") == None
        assert category_response.json.get("target_amount") == None


def test_delete_category(test_client):
    """Test delete category and moving all transactions and assignments to the new category"""
    
    category = dict(name="new category 1238455", group="group1")
    create_response = test_client.post("/category/create", json=category)
    category_a = create_response.json.get("id")

    category = dict(name="new category 152345", group="group1")
    create_response = test_client.post("/category/create", json=category)
    category_b = create_response.json.get("id")

    delete_response = test_client.delete(f"/category/delete/{category_a}/{category_b}")
    assert delete_response.status_code == 200

    category_response = test_client.get(f"/category/{category_a}/2022-04-07")
    assert category_response.status_code == 404

def test_delete_category_invalid_categories(test_client):
    """Test delete category failure cases"""
    
    category = dict(name="new category 1238455", group="group1")
    create_response = test_client.post("/category/create", json=category)
    category_a = create_response.json.get("id")

    category = dict(name="new category 152345", group="group1")
    create_response = test_client.post("/category/create", json=category)
    category_b = create_response.json.get("id")
    
    delete_response = test_client.delete(f"/category/delete/{category_a}/sldakjfsadljf")
    assert delete_response.status_code == 404
    delete_response = test_client.delete(f"/category/delete/fooosoaa/{category_b}")
    assert delete_response.status_code == 404
    
