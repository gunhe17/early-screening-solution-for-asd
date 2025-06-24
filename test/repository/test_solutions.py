from pathlib import Path
import pytest

from imomtae.repository.solutions import (
    SolutionCreate,
    SolutionGet,
    Solution
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

solution_data = Solution.from_dict({
    "id": "1",
    "path": "data/soluntion_videos/step1.mp4",
    "duration": "1m 13s"
})

# command
def test_solution_creation():
    created_solution = SolutionCreate.execute(
        db=test_db,
        solution=solution_data, 
    )
    
    assert isinstance(created_solution, dict)
    
    assert created_solution["id"] == solution_data.id
    assert created_solution["path"] == solution_data.path
    assert created_solution["duration"] == solution_data.duration

# query
def test_soliution_get_by_id():
    getted_solution = SolutionGet.get_by_id(
        db=test_db,
        id="1", 
    )
    
    assert isinstance(getted_solution, dict)
    
    assert getted_solution["id"] == solution_data.id
    assert getted_solution["path"] == solution_data.path
    assert getted_solution["duration"] == solution_data.duration
    
def test_solution_get_all():
    all_solutions = SolutionGet.get_all(
        db=test_db,
    )
    
    assert isinstance(all_solutions, list)
    
    assert len(all_solutions) == 1
    
    assert all_solutions[0]["id"] == solution_data.id
    assert all_solutions[0]["path"] == solution_data.path
    assert all_solutions[0]["duration"] == solution_data.duration