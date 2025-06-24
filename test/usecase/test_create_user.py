from pathlib import Path
import pytest

from imomtae.usecase.create_user import create

test_db_path = "test/repository/test_db.json"
test_db = Path(test_db_path)


def test_create():
    created = create(
        db=test_db,
        name="test를 위한 사용자",
        birth="001010"
    )

    assert isinstance(created, dict)