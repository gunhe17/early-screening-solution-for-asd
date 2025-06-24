**카메라 설정**:
--camera_indices               카메라 인덱스 (예: 0,1,2)
--frame_width                  프레임 너비 (기본값: 1280)
--frame_height                 프레임 높이 (기본값: 720)
--frame_rate                   프레임 레이트 (기본값: 30)
--pixel_format                 픽셀 포맷 (MJPG, NV12, YUY2, RGB32, I420, UYVY)

**녹화 설정**:
--record_duration              녹화 시간(초) (기본값: 5)
--consumer_sleep               컨슈머 슬립(μs) (기본값: 100)
--sync_delay                   동기화 딜레이(ms) (기본값: 100)

**웜업 설정**:
--enable_warmup                웜업 활성화 (true/false, 기본값: true)
--warmup_duration              웜업 시간(초) (기본값: 3)

**출력 설정**:
--output_mode                  출력 모드 (video/image, 기본값: image)
--output_filename, --output    출력 파일명 (기본값: output)
--output_directory, --output_dir 출력 디렉토리 (기본값: .)
--video_format                 비디오 포맷 (기본값: avi)
--image_format                 이미지 포맷 (기본값: jpg)
--save_timestamp_csv           CSV 저장 (true/false, 기본값: true)

**외부 도구**:
--ffmpeg_path, --ffmpeg        FFmpeg 경로 (기본값: ffmpeg))";