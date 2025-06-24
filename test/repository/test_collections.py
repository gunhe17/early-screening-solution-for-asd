from pathlib import Path
import pytest
import uuid

from imomtae.repository.collections import (
    CollectionCreate,
    CollectionGet,
    Collection,
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

collection_id = str(
    uuid.uuid4()
)
user_id = str(
    uuid.uuid4()
)
collection_data = Collection.from_dict({
    "id": collection_id,
    "user_id": user_id,
    "path1": f"data/collection_videos/{collection_id}/step1.mp4",
    "path2": f"data/collection_videos/{collection_id}/step2.mp4",
    "path3": f"data/collection_videos/{collection_id}/step3.mp4",
})

# command
def test_collection_creation():
    created_collection = CollectionCreate.execute(
        db=test_db,
        collection=collection_data, 
    )
    
    assert isinstance(created_collection, dict)
    
    assert created_collection["id"] == collection_data.id
    assert created_collection["user_id"] == collection_data.user_id
    assert created_collection["path1"] == collection_data.path1
    assert created_collection["path2"] == collection_data.path2
    assert created_collection["path3"] == collection_data.path3

# query
def test_soliution_get_by_user_id():
    getted_collection = CollectionGet.get_by_user_id(
        db=test_db,
        user_id=collection_data.user_id,
    )
    
    assert isinstance(getted_collection, dict)
    
    assert getted_collection["id"] == collection_data.id
    assert getted_collection["user_id"] == collection_data.user_id
    assert getted_collection["path1"] == collection_data.path1
    assert getted_collection["path2"] == collection_data.path2
    assert getted_collection["path3"] == collection_data.path3