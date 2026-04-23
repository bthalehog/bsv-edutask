import os
from uuid import uuid4
from unittest.mock import patch

import pytest
import pymongo

from src.util.dao import DAO

valid_document = {"name": "Test", "active": True, "email": "test@example.org"}
missing_required = {"name": "Test", "active": True}
wrong_type = {"name": "Test", "active": "true", "email": "test@example.org"}
duplicate_one = {"name": "Test", "active": True, "email": "test@example.org"}
duplicate_two = {"name": "Testtest", "active": False, "email": "test@example.org"}

### FIXTURE
@pytest.fixture
def dao_create_fixture():
    mongo_url = os.environ.get("MONGO_URL", "mongodb://127.0.0.1:27017")

    validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["name", "active", "email"],
            "properties": {
                "name": {"bsonType": "string"},
                "active": {"bsonType": "bool"},
                "email": {"bsonType": "string"},
            },
        }
    }

    collection_name = f"it_dao_create_{uuid4()}"

    with patch("src.util.dao.dotenv_values") as mock_dotenv_values, \
         patch("src.util.dao.getValidator") as mock_get_validator:

        mock_dotenv_values.return_value = {"MONGO_URL": mongo_url}
        mock_get_validator.return_value = validator

        dao = DAO(collection_name)
        dao.collection.create_index("email", unique=True)

        yield dao

        dao.drop()

### PYTEST
@pytest.mark.integration
def test_create_valid_document(dao_create_fixture):
    created = dao_create_fixture.create(valid_document)

    assert created["name"] == valid_document["name"]
    assert created["active"] == valid_document["active"]
    assert created["email"] == valid_document["email"]
    assert "_id" in created

@pytest.mark.integration
def test_create_missing_required_property(dao_create_fixture):
    with pytest.raises(pymongo.errors.WriteError):
        dao_create_fixture.create(missing_required)

@pytest.mark.integration
def test_create_wrong_bson_type(dao_create_fixture):
    with pytest.raises(pymongo.errors.WriteError):
        dao_create_fixture.create(wrong_type)

@pytest.mark.integration
def test_create_duplicate_unique_field(dao_create_fixture):
    dao_create_fixture.create(duplicate_one)

    with pytest.raises(pymongo.errors.DuplicateKeyError):
        dao_create_fixture.create(duplicate_two)

@pytest.mark.integration
def test_create_does_not_mutate_input_payload(dao_create_fixture):
    payload = {"name": "Test", "active": True, "email": "test@example.org"}
    original_payload = dict(payload)

    dao_create_fixture.create(payload)

    assert payload == original_payload