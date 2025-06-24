from pathlib import Path
import pytest
import uuid

from imomtae.repository.users import (
    UserCreate,
    User
)

test_db_path = "test/repository/test_db.json"
test_db = Path(test_db_path)


##
# Setup

@pytest.fixture(scope="module", autouse=True)
def reset_db_file():
    test_db.parent.mkdir(parents=True, exist_ok=True)
    test_db.write_text("{}", encoding="utf-8")
    
    yield
    
    test_db.write_text("{}", encoding="utf-8")
    test_db.unlink()


##
# Test

user_id = str(
    uuid.uuid4()
)
user_data = User.from_dict({
    "id": user_id,
    "name": "test를위한사용자",
    "birth": "001010"
})

# command
def test_user_creation():
    created_user = UserCreate.execute(
        db=test_db,
        user=user_data,
    )
    
    assert isinstance(created_user, dict)
    
    assert created_user["id"] == user_data.id
    assert created_user["name"] == user_data.name
    assert created_user["birth"] == user_data.birth

# query