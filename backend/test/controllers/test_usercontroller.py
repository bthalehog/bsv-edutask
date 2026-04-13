import pytest
from src.controllers.usercontroller import UserController
from unittest.mock import MagicMock

valid_user = {"email": "alhf24@student.bth.se", "name": "Valid"}
invalid_user = {"email": "alhf244@studentcom", "name": "Invalid"}
multiple_one = {"email": "tester444@gmail.com", "name": "Mul"}
multiple_two = {"email": "tester444@gmail.com", "name": "Tiple"}

### MOCKUP
@pytest.fixture
def mock_dao():
    return MagicMock()

@pytest.fixture
def controller(mock_dao):
    return UserController(mock_dao)

### PYTEST
def test_login_email_valid(controller, mock_dao):
    mock_dao.find.return_value = [valid_user]
    res = controller.get_user_by_email(valid_user["email"])
    assert res != 'Error: invalid email address'
    assert res is valid_user 

def test_login_email_invalid(controller, mock_dao):
    mock_dao.find.return_value = ValueError, "Error: invalid email address"
    res = controller.get_user_by_email(invalid_user["email"])
    assert res == ValueError, "Error: invalid email address"

def test_multiple_emails_match(controller, mock_dao):
    mock_dao.find.return_value = [multiple_one, multiple_two]
    res = controller.get_user_by_email(multiple_one["email"])
    assert len(res) > 1
    assert res is multiple_one
    
def test_single_email_match(controller, mock_dao):
    mock_dao.find.return_value = [valid_user]

    res = controller.get_user_by_email(valid_user["email"])
    assert len(res) < 3
    assert res is valid_user
