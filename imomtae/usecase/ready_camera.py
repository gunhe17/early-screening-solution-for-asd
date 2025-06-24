import subprocess
from pathlib import Path

from imomtae.config import (
    DBConfig,
    SystemConfig,
    CameraConfig,
)

db_config = DBConfig()
system_config = SystemConfig()
camera_config = CameraConfig()


def ready(
    db=Path(db_config.DB_PATH)
) -> bool:
    
    # Skip
    if system_config.OS != "Windows": 
        return True

    return True