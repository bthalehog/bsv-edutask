import pytest
from src.controllers.usercontroller import UserController
from unittest.mock import MagicMock

valid_user = {"email": "alhf24@student.bth.se", "name": "Valid"}
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
@pytest.mark.unit
def test_login_email_valid(controller, mock_dao):
    mock_dao.find.return_value = [valid_user]
    res = controller.get_user_by_email(valid_user["email"])

    assert res == valid_user 

@pytest.mark.unit
def test_login_email_invalid(controller, mock_dao):
    with pytest.raises(ValueError, match="Error: invalid email address"):
        controller.get_user_by_email("alhf244@studentcom")
    
    mock_dao.find.assert_not_called()

@pytest.mark.unit
def test_multiple_emails_match(controller, mock_dao):
    mock_dao.find.return_value = [multiple_one, multiple_two]
    res = controller.get_user_by_email(multiple_one["email"])

    assert res == multiple_one

@pytest.mark.unit
def test_no_user_found(controller, mock_dao):
    mock_dao.find.return_value = []

    with pytest.raises(IndexError):
        controller.get_user_by_email("missing@gmail.com")