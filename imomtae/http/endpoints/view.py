from fastapi.templating import Jinja2Templates
from fastapi.responses import StreamingResponse
from fastapi import Request
import subprocess
from subprocess import Popen

import traceback
import asyncio
import json
import os


# #
# Config

templates = Jinja2Templates(directory="./imomtae/http/templates")


# #
# page

async def home_page(request: Request):
    return templates.TemplateResponse("home/page.html", {
        "request": request
    })

async def capture_page(request: Request, user_id: str, video_id: int):
    return templates.TemplateResponse("capture/page.html", {
        "request": request,
    })

async def monitor_page(request: Request, user_id: str):
    return templates.TemplateResponse("monitor/page.html", {
        "request": request,
    })

# test
async def test_page(request: Request, page: str):

    if page == "naver":
        return templates.TemplateResponse("test/naver/page.html", {
            "request": request,
        })
    
    if page == "tobii":
        return templates.TemplateResponse("test/tobii/page.html", {
            "request": request,
        })

# #
# test helper

current_tobii_process: subprocess.Popen[str] | None = None

async def tobii_start_recording(
    request: Request,
    duration: int = 10,
    fps: int = 30,
    stream: bool = True
):
    """Tobii 실행 및 실시간 스트리밍 - 개선된 subprocess 처리 포함"""
    global current_tobii_process

    async def generate_stream():
        global current_tobii_process

        try:
            import platform, traceback, sys

            yield sse_message({"type": "log", "message": "=== TOBII RECORDING START ==="})
            yield sse_message({"type": "log", "message": f"OS: {platform.system()} {platform.release()}"})
            yield sse_message({"type": "log", "message": f"Python: {platform.python_version()}"})
            yield sse_message({"type": "log", "message": f"Current working dir: {os.getcwd()}"})

            # 기존 프로세스 종료
            if current_tobii_process and current_tobii_process.returncode is None:
                yield sse_message({"type": "log", "message": "Terminating existing process..."})
                current_tobii_process.terminate()
                try:
                    await asyncio.wait_for(asyncio.to_thread(current_tobii_process.wait), timeout=2.0)
                    yield sse_message({"type": "log", "message": "Existing process terminated successfully"})
                except asyncio.TimeoutError:
                    current_tobii_process.kill()
                    yield sse_message({"type": "log", "message": "Force killed existing process"})

            # 실행 파일 탐색
            exe_path = None
            candidates = [
                "test/bin/tobii_test.exe",
                "./test/bin/tobii_test.exe",
            ]
            for i, path in enumerate(candidates):
                abs_path = os.path.abspath(path)
                exists = os.path.exists(abs_path)
                yield sse_message({"type": "log", "message": f"[{i+1}] {path} -> {abs_path} [{'EXISTS' if exists else 'NOT FOUND'}]"})
                if exists and not exe_path:
                    exe_path = abs_path
                    try:
                        size_mb = round(os.stat(abs_path).st_size / 1024 / 1024, 2)
                        yield sse_message({"type": "log", "message": f"✓ File size: {size_mb} MB"})
                    except Exception as e:
                        yield sse_message({"type": "error", "message": f"Cannot read file stats: {e}"})

            if not exe_path:
                yield sse_message({"type": "error", "message": "Tobii executable not found"})
                return

            yield sse_message({"type": "log", "message": f"✓ Using executable: {exe_path}"})

            # 명령 구성
            # cmd = [exe_path, "--calibration_file", "calibration_strange.bin"]
            cmd = [exe_path, "--calibration_file", "calibration_20250703_140435.bin"]
            # cmd = [exe_path]


            if not stream:
                cmd.append("--no_stream")
            work_dir = os.path.dirname(exe_path)
            yield sse_message({"type": "log", "message": f"Command: {' '.join(cmd)}"})
            yield sse_message({"type": "log", "message": f"Working directory: {work_dir}"})

            # DLL 확인
            for dll in ["tobii_research.dll"]:
                path = os.path.join(work_dir, dll)
                msg = f"✓ Found dependency: {dll}" if os.path.exists(path) else f"⚠️ Missing dependency: {dll} (may cause issues)"
                yield sse_message({"type": "log", "message": msg})

            # subprocess 실행
            env = os.environ.copy()
            env["PATH"] = f"{work_dir};{env['PATH']}"
            current_tobii_process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=work_dir,
                text=True,
                bufsize=1,
                env=env,
            )
            yield sse_message({"type": "started", "pid": current_tobii_process.pid})
            yield sse_message({"type": "log", "message": f"✓ Process started with PID: {current_tobii_process.pid}"})
            yield sse_message({"type": "log", "message": "Reading process output..."})

            # 실시간 출력 스트리밍
            async def stream_reader(stream, stream_type):
                count = 0
                loop = asyncio.get_running_loop()
                while True:
                    line = await loop.run_in_executor(None, stream.readline)
                    if not line:
                        break
                    line = line.strip()
                    if not line:
                        continue
                    count += 1
                    msg = f"{stream_type.upper()}[{count}]: {line}"
                    yield sse_message({"type": stream_type, "message": msg})
                    parsed = parse_tobii_output(line)
                    if parsed:
                        yield sse_message(parsed)

            async for msg in stream_reader(current_tobii_process.stdout, "log"):
                yield msg
            async for msg in stream_reader(current_tobii_process.stderr, "error"):
                yield msg

            return_code = current_tobii_process.wait()
            yield sse_message({"type": "log", "message": f"Process exited with code: {return_code}"})

        except Exception as e:
            yield sse_message({"type": "error", "message": f"{type(e).__name__}: {e}"})
            yield sse_message({"type": "error", "message": traceback.format_exc()})
        finally:
            if current_tobii_process and current_tobii_process.poll() is None:
                current_tobii_process.terminate()
                try:
                    current_tobii_process.wait(timeout=2)
                except subprocess.TimeoutExpired:
                    current_tobii_process.kill()
            yield sse_message({"type": "stopped"})
            yield sse_message({"type": "log", "message": "=== TOBII RECORDING END ==="})

    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
        }
    )

async def tobii_stop_recording(request: Request):
    """Tobii 프로세스 강제 종료"""
    global current_tobii_process
    
    if not current_tobii_process:
        return {"status": "not_running"}
    
    try:
        if current_tobii_process.returncode is None:
            current_tobii_process.terminate()

            # await asyncio.wait_for(current_tobii_process.wait(), timeout=2.0)
            return_code = await asyncio.to_thread(current_tobii_process.wait, timeout=2)

            return {"status": "stopped", "method": "terminate"}
        else:
            return {"status": "already_finished"}
    except asyncio.TimeoutError:
        current_tobii_process.kill()

        # await current_tobii_process.wait()
        return_code = await asyncio.to_thread(current_tobii_process.wait)

        return {"status": "stopped", "method": "kill"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# helper
def parse_tobii_output(line: str) -> dict | None:
    """C++ 출력 라인을 파싱하여 JSON 객체로 변환"""
    try:
        if line.startswith("GAZE_DATA:"):
            data = json.loads(line[10:])
            return {"type": "gaze", "data": data}
        
        elif line.startswith("ENHANCED_GAZE_DATA:"):  # 추가
            data = json.loads(line[19:])
            return {"type": "enhanced_gaze", "data": data}
        
        elif line.startswith("STATUS:"):
            data = json.loads(line[7:])
            return {"type": "status", "data": data}
        
        elif line.startswith("RECORDING_STARTED:"):
            return {"type": "recording_started"}
        
        elif line.startswith("RECORDING_STOPPED:"):
            return {"type": "recording_stopped"}
        
        elif line.startswith("ERROR:"):
            data = json.loads(line[6:])
            return {"type": "error", "data": data}
        
        return None
        
    except json.JSONDecodeError:
        return None

def sse_message(data: dict) -> str:
    """Server-Sent Events 메시지 형식으로 변환"""
    return f"data: {json.dumps(data)}\n\n"