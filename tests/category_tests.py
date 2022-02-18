import random
import requests
import unittest
import uuid

from datetime import datetime

API_HOST = "localhost"
API_PORT = 80
API_BASE_PATH = "/api/category"

BASE_URL = f"http://{API_HOST}:{API_PORT}{API_BASE_PATH}"


class TestCategoryEndpoints(unittest.TestCase):
    def test_create_category_success(self):
        """
        Testing creating new categories successfully
        """
        category = {"name": uuid.uuid4().hex[:8], "group": uuid.uuid4().hex[:8]}
        resp = create_category(category)
        self.assertEqual(resp.status_code, 201)

        resp = get_categories_names().json()
        categories = [p["name"] for p in resp]
        self.assertTrue(category["name"] in categories)

    def test_create_category_fail(self):
        """
        Test Creating Categories Unseccessfully
        """
        categories = [{"name": 123}, {}]
        for category in categories:
            resp = create_category(category)
            self.assertEqual(resp.status_code, 400)

    def _update_category(self):
        """
        Testing updating a category
        """
        category = {"name": uuid.uuid4().hex[:8]}
        resp = create_category(category)
        category_id = resp.json()[0]["id"]

        self.assertEqual(resp.status_code, 201)

        resp = update_category(category_id, {"name": uuid.uuid4().hex[:8]})
        self.assertEqual(resp.status_code, 200)

        resp = get_categories_names()
        categories = [p["name"] for p in resp.json()[0]]
        self.assertFalse(category["name"] in categories)


def get_categories_names():
    """
    Fetch all categories
    """
    resp = requests.get(f"{BASE_URL}/names")
    return resp


def create_category(category_data):
    """
    Create New Category
    """
    resp = requests.post(f"{BASE_URL}/create", json=category_data)
    return resp


def update_category(category_id, category_data):
    """
    Update Category
    """
    resp = requests.put(f"{BASE_URL}/update/{category_id}", json=category_data)
    return resp


def delete_category(category_id):
    """
    Delete Category
    """
    resp = requests.delete(f"{BASE_URL}/delete/{category_id}")
    return resp


def get_current_date():
    """
    return date string for todays date
    """
    return datetime.now().strftime("%d-%m-%Y")


if __name__ == "__main__":
    unittest.main()
