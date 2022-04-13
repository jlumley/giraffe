import random
import requests
import unittest
import uuid

from datetime import datetime

API_HOST = "localhost"
API_PORT = 80
API_BASE_PATH = "/api/payee"

BASE_URL = f"http://{API_HOST}:{API_PORT}{API_BASE_PATH}"


class TestPayeeEndpoints(unittest.TestCase):
    def test_create_payee_success(self):
        """
        Testing creating new payees successfully
        """
        payee = {"name": uuid.uuid4().hex[:8]}
        resp = create_payee(payee)
        self.assertEqual(resp.status_code, 201)

        resp = get_payees().json()
        payees = [p["name"] for p in resp]
        self.assertTrue(payee["name"] in payees)

    def test_create_payee_fail(self):
        """
        Test Creating Payees Unseccessfully
        """
        payees = [
            {"name": 123},
            {},
        ]
        for payee in payees:
            resp = create_payee(payee)
            self.assertEqual(resp.status_code, 400)

    def test_delete_payee(self):
        """
        Testing deleting a payee
        """
        payee = {"name": uuid.uuid4().hex[:8]}
        resp = create_payee(payee)
        payee_id = resp.json()[0]["id"]

        self.assertEqual(resp.status_code, 201)

        self.assertEqual(delete_payee(payee_id).status_code, 200)

        resp = get_payees().json()
        payees = [p["name"] for p in resp]
        self.assertFalse(payee["name"] in payees)

    def test_delete_payee_invalid_id(self):
        """
        Testing deleting a payee with invalid id
        """
        payee_ids = [None, "fff"]
        for payee_id in payee_ids:
            resp = delete_payee(payee_id)
            self.assertEqual(resp.status_code, 404)

    def test_update_payee(self):
        """
        Testing updating a payee
        """
        payee = {"name": uuid.uuid4().hex[:8]}
        resp = create_payee(payee)
        payee_id = resp.json()[0]["id"]

        self.assertEqual(resp.status_code, 201)

        resp = update_payee(payee_id, {"name": uuid.uuid4().hex[:8]})
        self.assertEqual(resp.status_code, 200)

        resp = get_payees().json()
        payees = [p["name"] for p in resp]
        self.assertFalse(payee["name"] in payees)


def get_payees():
    """
    Fetch all payees
    """
    resp = requests.get(f"{BASE_URL}")
    return resp


def create_payee(payee_data):
    """
    Create New Payee
    """
    resp = requests.post(f"{BASE_URL}/create", json=payee_data)
    return resp


def update_payee(payee_id, payee_data):
    """
    Update Payee
    """
    resp = requests.put(f"{BASE_URL}/update/{payee_id}", json=payee_data)
    return resp


def delete_payee(payee_id):
    """
    Delete Payee
    """
    resp = requests.delete(f"{BASE_URL}/delete/{payee_id}")
    return resp


def get_current_date():
    """
    return date string for todays date
    """
    return datetime.now().strftime("%d-%m-%Y")


if __name__ == "__main__":
    unittest.main()
