import pytest
import random
import uuid

from .. import test_client


def test_create_category(test_client):
    """Test create new category"""
    categories = [
        {
            "name": "fooas234",
            "group": "jkluiower",
            "credit_card": False,
            "starting_balance": 100,
        }
    ]
        
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
    category_data = {
        "name": "fooag234",
        "group": "jklgiower",
        "credit_card": False,
        "starting_balance": 180,
    }
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
    category_data = {
        "name": "fookg234",
        "group": "jkogiower",
        "credit_card": False,
        "starting_balance": 180,
    }

    create_response = test_client.post("/category/create", json=category_data)
    category_id = create_response.json.get("id")

    category_response = test_client.get(f"/category/{category_id}/2022-04-07")
    print(category_response.data)
    assert category_response.status_code == 200
    assert category_response.json.get("name") == category_data.get("name")
    assert category_response.json.get("group") == category_data.get("group")

def test_category_assign(test_client):
    """Test update category target"""
    category_data = {
        "name": "fookg234",
        "group": "jkogiower",
        "credit_card": False,
        "starting_balance": 180,
    }
    create_response = test_client.post("/category/create", json=category_data)
    category_id = create_response.json.get("id")
    assignment_data = dict(
        date="2022-04-01",
        amount=100
    )
    update_response = test_client.put(f"/category/assign/{category_id}", json=assignment_data)
    update_response.status_code == 200

    category_response = test_client.get(f"/category/{category_id}/2022-04-07")
    assert category_response.status_code == 200
    assert category_response.json.get("assigned_this_month") == assignment_data.get("amount")

def test_update_category_target(test_client):
    """Test update category target"""
    category_data = {
        "name": "fookg234",
        "group": "jkogiower",
        "credit_card": False,
        "starting_balance": 180,
    }
    create_response = test_client.post("/category/create", json=category_data)
    category_id = create_response.json.get("id")
    targets = [
        dict(
            target_type="savings_target", target_amount=53567, target_date="2022-11-02"
        ),
        dict(target_type="monthly_savings", target_amount=8900),
    ]
    for t in targets:
        target_type = t["target_type"]
        del t["target_type"]
        update_response = test_client.put(f"/category/target/{target_type}/{category_id}", json=t)
        print(update_response.data)
        assert update_response.status_code == 200

        category_response = test_client.get(f"/category/{category_id}/2022-04-07")
        assert category_response.status_code == 200
        assert category_response.json.get("target_type") == target_type
        assert category_response.json.get("target_amount") == t.get("target_amount")


def test_delete_category_target(test_client):
    """Test delete category target"""
    category_data = {
        "name": "fookg234",
        "group": "jkogiower",
        "credit_card": False,
        "starting_balance": 180,
    }
    create_response = test_client.post("/category/create", json=category_data)
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
    
    category_data = {
        "name": "fookg234",
        "group": "jkogiower",
        "credit_card": False,
        "starting_balance": 180,
    }
    create_response = test_client.post("/category/create", json=category_data)
    category_a = create_response.json.get("id")

    category_data = {
        "name": "fookg234",
        "group": "jkogiower",
        "credit_card": False,
        "starting_balance": 180,
    }
    create_response = test_client.post("/category/create", json=category_data)
    category_b = create_response.json.get("id")

    delete_response = test_client.delete(f"/category/delete/{category_a}/{category_b}")
    assert delete_response.status_code == 200

    category_response = test_client.get(f"/category/{category_a}/2022-04-07")
    assert category_response.status_code == 404

def test_delete_category_invalid_categories(test_client):
    """Test delete category failure cases"""
    category_data = {
        "name": "fookg234",
        "group": "jkogiower",
        "credit_card": False,
        "starting_balance": 180,
    }
    create_response = test_client.post("/category/create", json=category_data)
    category_a = create_response.json.get("id")

    category_data = {
        "name": "fookg234",
        "group": "jkogiower",
        "credit_card": False,
        "starting_balance": 180,
    }
    create_response = test_client.post("/category/create", json=category_data)
    category_b = create_response.json.get("id")
    
    delete_response = test_client.delete(f"/category/delete/{category_a}/sldakjfsadljf")
    assert delete_response.status_code == 404
    delete_response = test_client.delete(f"/category/delete/fooosoaa/{category_b}")
    assert delete_response.status_code == 404
    
