from pathlib import Path
import pytest

from imomtae.usecase.get_collection import (
    get_video_by_user_id, 
    get_video_by_user_id_and_video_id
)

test_db_path = "test/repository/test_db.json"
test_db = Path(test_db_path)


def test_get_video_by_user_id():
    getted = get_video_by_user_id(
        db=test_db,
        user_id=""
    )

    assert isinstance(getted, dict)