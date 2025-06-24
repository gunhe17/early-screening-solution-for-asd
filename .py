from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess
import threading
import time
import os
import signal
from typing import Optional

app = FastAPI()

class RecordingManager:
    def __init__(self):
        self.process: Optional[subprocess.Popen] = None
        self.is_recording = False
        
    def start_recording(self, cmd_args: list) -> bool:
        if self.is_recording:
            return False
            
        try:
            self.process = subprocess.Popen(
                cmd_args,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            self.is_recording = True
            
            # Output monitoring thread
            def monitor_output():
                if self.process:
                    for line in iter(self.process.stdout.readline, ''):
                        print(f"[Recording] {line.strip()}")
                        
            threading.Thread(target=monitor_output, daemon=True).start()
            return True
            
        except Exception as e:
            print(f"Recording start failed: {e}")
            return False
    
    def stop_recording(self) -> bool:
        if not self.is_recording or not self.process:
            return False
            
        try:
            # stdin으로 stop 명령 전송
            self.process.stdin.write("stop\n")
            self.process.stdin.flush()
            
            # process 종료 대기 (최대 10초)
            try:
                self.process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                # 강제 종료
                self.process.terminate()
                try:
                    self.process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    self.process.kill()
                    
            self.is_recording = False
            self.process = None
            return True
            
        except Exception as e:
            print(f"Recording stop failed: {e}")
            return False
    
    def get_status(self) -> dict:
        return {
            "is_recording": self.is_recording,
            "process_alive": self.process is not None and self.process.poll() is None
        }

# Global manager instance
recording_manager = RecordingManager()

class RecordingRequest(BaseModel):
    camera_indices: list[int] = [0]
    frame_width: int = 1280
    frame_height: int = 720
    frame_rate: int = 30
    record_duration: int = 30
    output_mode: str = "image"
    output_filename: str = "output"
    output_directory: str = "."

@app.post("/start-recording")
async def start_recording(request: RecordingRequest):
    if recording_manager.is_recording:
        raise HTTPException(status_code=400, detail="Recording already in progress")
    
    # main.exe 명령어 구성
    cmd_args = [
        "./main.exe",  # executable path
        "--camera_indices", ",".join(map(str, request.camera_indices)),
        "--frame_width", str(request.frame_width),
        "--frame_height", str(request.frame_height),
        "--frame_rate", str(request.frame_rate),
        "--record_duration", str(request.record_duration),
        "--output_mode", request.output_mode,
        "--output_filename", request.output_filename,
        "--output_directory", request.output_directory
    ]
    
    success = recording_manager.start_recording(cmd_args)
    
    if success:
        return {"message": "Recording started successfully", "config": request.dict()}
    else:
        raise HTTPException(status_code=500, detail="Failed to start recording")

@app.post("/stop-recording")
async def stop_recording():
    if not recording_manager.is_recording:
        raise HTTPException(status_code=400, detail="No recording in progress")
    
    success = recording_manager.stop_recording()
    
    if success:
        return {"message": "Recording stopped successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to stop recording")

@app.get("/recording-status")
async def get_recording_status():
    return recording_manager.get_status()

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)