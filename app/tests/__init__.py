import pytest

from giraffe_budget import create_app


@pytest.fixture
def test_client():
    app = create_app()

    with app.test_client() as client:
        yield client
