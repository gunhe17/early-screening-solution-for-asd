from typing import Optional
import traceback


# #
# Base

class ServiceError(Exception):
    def __init__(self, msg: str, code: int) -> None:
        self.msg = msg
        self.code = code

    def __str__(self) -> str:
        return self.msg
    
    def __trace_back__(self) -> str:
        return ''.join(traceback.format_exception(type(self), self, self.__traceback__))
    

class ExistingUserError(ServiceError):
    def __init__(self):
        super().__init__(msg=f"\n\t[Error] 이미 등록된 사용자입니다.)", code=400)