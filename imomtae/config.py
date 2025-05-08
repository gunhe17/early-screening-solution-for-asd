import os
from dotenv import load_dotenv

load_dotenv()


class CameraConfig():
    @property
    def CAM_COUNT(self):
        return os.getenv("CAM_COUNT", 1)

    @property
    def CAM_NO1_INDEX(self):
        return os.getenv("CAM_NO1_INDEX", 0)

    @property
    def CAM_NO2_INDEX(self):
        return os.getenv("CAM_NO2_INDEX", None)

    @property
    def CAM_NO3_INDEX(self):
        return os.getenv("CAM_NO3_INDEX", None)

    @property
    def CAM_NO4_INDEX(self):
        return os.getenv("CAM_NO4_INDEX", None)

    @property
    def CAM_NO5_INDEX(self):
        return os.getenv("CAM_NO5_INDEX", None)

    @property
    def CAM_NO6_INDEX(self):
        return os.getenv("CAM_NO6_INDEX", None)

    @property
    def INDEX_LIST(self):
        indices = []
        for i in range(1, self.CAM_COUNT + 1):
            index = getattr(self, f"CAM_NO{i}_INDEX", None)
            if index is not None:
                indices.append(index)
        return indices