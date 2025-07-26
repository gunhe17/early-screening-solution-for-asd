/**
 * @TobiiVisualizer - Enhanced with proper screen ratio mapping
 */
class TobiiVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        
        // Canvas element 존재 여부 확인
        if (!this.canvas) {
            console.error(`Canvas element with id '${canvasId}' not found`);
            return;
        }
        
        // Canvas context 획득 시도
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error(`Failed to get 2D context for canvas '${canvasId}'`);
            return;
        }
        
        this.gazeTrail = [];
        this.maxTrailLength = 30;
        this.showTrail = true;
        this.lastFrameTime = 0;
        this.fpsCounter = 0;
        this.fpsTimer = Date.now();
        
        // Screen mapping properties
        this.screenConfig = {
            width_mm: 531,   // 실제 화면 가로 크기 (mm)
            height_mm: 298,  // 실제 화면 세로 크기 (mm)
            distance_mm: 600 // 화면까지의 거리 (mm)
        };
        
        // Viewport mapping area (전체화면 내에서 실제 화면 비율 영역)
        this.viewportArea = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
        
        this.updateViewportArea();
        
        console.log(`TobiiVisualizer initialized for canvas: ${canvasId}`);
    }

    updateViewportArea() {
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        // 상단바 높이 계산 (실제 픽셀 기준)
        const topBar = document.querySelector('.absolute.top-0.left-0.right-0.z-10');
        const topBarHeight = topBar ? topBar.offsetHeight : 70; // 기본값 70px
        
        // Canvas 내에서 상단바를 제외한 실제 사용 가능 영역
        const availableWidth = canvasWidth;
        const availableHeight = canvasHeight - (topBarHeight * (canvasHeight / window.innerHeight));
        const availableTop = topBarHeight * (canvasHeight / window.innerHeight);
        
        // 실제 화면 비율 (531:298 ≈ 1.78:1)
        const screenAspectRatio = this.screenConfig.width_mm / this.screenConfig.height_mm;
        const availableAspectRatio = availableWidth / availableHeight;
        
        let viewportWidth, viewportHeight, viewportTop;
        
        if (availableAspectRatio > screenAspectRatio) {
            // 사용 가능 영역이 화면보다 더 넓음 - 높이 기준으로 맞춤
            viewportHeight = availableHeight * 0.95; // 95% 사용 (약간의 여백)
            viewportWidth = viewportHeight * screenAspectRatio;
            viewportTop = availableTop + (availableHeight - viewportHeight) / 2;
        } else {
            // 사용 가능 영역이 화면보다 더 높음 - 너비 기준으로 맞춤
            viewportWidth = availableWidth * 0.95; // 95% 사용 (약간의 여백)
            viewportHeight = viewportWidth / screenAspectRatio;
            viewportTop = availableTop + (availableHeight - viewportHeight) / 2;
        }
        
        // 상단바를 피해서 배치
        this.viewportArea = {
            x: (canvasWidth - viewportWidth) / 2,
            y: viewportTop,
            width: viewportWidth,
            height: viewportHeight
        };
        
        console.log('Viewport area updated (avoiding top bar):', this.viewportArea);
        console.log('Top bar height:', topBarHeight, 'Available height:', availableHeight);
    }

    mapGazeToViewport(normalizedX, normalizedY) {
        // 정규화된 좌표 (0~1)를 viewport 영역으로 매핑
        return {
            x: this.viewportArea.x + normalizedX * this.viewportArea.width,
            y: this.viewportArea.y + normalizedY * this.viewportArea.height
        };
    }

    drawViewportBorder() {
        // Viewport 영역 테두리 그리기
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 5]);
        this.ctx.strokeRect(
            this.viewportArea.x, 
            this.viewportArea.y, 
            this.viewportArea.width, 
            this.viewportArea.height
        );
        this.ctx.setLineDash([]); // 점선 해제
        
        // 코너 마커 그리기
        const cornerSize = 20;
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
        this.ctx.lineWidth = 3;
        
        // 좌상단
        this.ctx.beginPath();
        this.ctx.moveTo(this.viewportArea.x, this.viewportArea.y + cornerSize);
        this.ctx.lineTo(this.viewportArea.x, this.viewportArea.y);
        this.ctx.lineTo(this.viewportArea.x + cornerSize, this.viewportArea.y);
        this.ctx.stroke();
        
        // 우상단
        this.ctx.beginPath();
        this.ctx.moveTo(this.viewportArea.x + this.viewportArea.width - cornerSize, this.viewportArea.y);
        this.ctx.lineTo(this.viewportArea.x + this.viewportArea.width, this.viewportArea.y);
        this.ctx.lineTo(this.viewportArea.x + this.viewportArea.width, this.viewportArea.y + cornerSize);
        this.ctx.stroke();
        
        // 좌하단
        this.ctx.beginPath();
        this.ctx.moveTo(this.viewportArea.x, this.viewportArea.y + this.viewportArea.height - cornerSize);
        this.ctx.lineTo(this.viewportArea.x, this.viewportArea.y + this.viewportArea.height);
        this.ctx.lineTo(this.viewportArea.x + cornerSize, this.viewportArea.y + this.viewportArea.height);
        this.ctx.stroke();
        
        // 우하단
        this.ctx.beginPath();
        this.ctx.moveTo(this.viewportArea.x + this.viewportArea.width - cornerSize, this.viewportArea.y + this.viewportArea.height);
        this.ctx.lineTo(this.viewportArea.x + this.viewportArea.width, this.viewportArea.y + this.viewportArea.height);
        this.ctx.lineTo(this.viewportArea.x + this.viewportArea.width, this.viewportArea.y + this.viewportArea.height - cornerSize);
        this.ctx.stroke();
        
        // 라벨 표시 (상단바와 겹치지 않도록 viewport 내부 상단에)
        this.ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
        this.ctx.font = '14px monospace';
        this.ctx.fillText(
            `Screen Area (${this.screenConfig.width_mm}×${this.screenConfig.height_mm}mm)`,
            this.viewportArea.x + 10,
            this.viewportArea.y + 25  // viewport 내부 상단으로 이동
        );
    }

    drawGazePoint(gazeData) {
        // FPS 계산
        this.fpsCounter++;
        const now = Date.now();
        if (now - this.fpsTimer >= 1000) {
            document.getElementById('current-fps').textContent = this.fpsCounter;
            this.fpsCounter = 0;
            this.fpsTimer = now;
        }

        // Canvas 크기가 변경되었는지 확인
        const rect = this.canvas.getBoundingClientRect();
        if (this.canvas.width !== rect.width || this.canvas.height !== rect.height) {
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
            this.updateViewportArea();
        }

        // 화면 좌표로 변환 (viewport 영역 내로 매핑)
        const avgPos = this.mapGazeToViewport(gazeData.average.x, gazeData.average.y);
        const leftPos = this.mapGazeToViewport(gazeData.left_eye.x, gazeData.left_eye.y);
        const rightPos = this.mapGazeToViewport(gazeData.right_eye.x, gazeData.right_eye.y);

        // Trail 업데이트
        if (gazeData.average.valid) {
            this.gazeTrail.push({
                x: avgPos.x,
                y: avgPos.y,
                timestamp: now
            });

            if (this.gazeTrail.length > this.maxTrailLength) {
                this.gazeTrail.shift();
            }
        }

        // 캔버스 지우기
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Viewport 경계 그리기
        this.drawViewportBorder();

        // 그리드 그리기 (viewport 내부)
        this.drawGrid();

        // Trail 그리기
        if (this.showTrail && this.gazeTrail.length > 1) {
            this.ctx.strokeStyle = 'rgba(100, 150, 255, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            
            for (let i = 0; i < this.gazeTrail.length - 1; i++) {
                const point = this.gazeTrail[i];
                const alpha = i / this.gazeTrail.length;
                
                if (i === 0) {
                    this.ctx.moveTo(point.x, point.y);
                } else {
                    this.ctx.lineTo(point.x, point.y);
                }
            }
            this.ctx.stroke();
        }

        // 개별 눈 포인트 그리기 (viewport 내부에만)
        if (gazeData.left_eye.valid && this.isInViewport(leftPos.x, leftPos.y)) {
            this.ctx.fillStyle = 'rgba(255, 100, 100, 0.7)';
            this.ctx.beginPath();
            this.ctx.arc(leftPos.x, leftPos.y, 8, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // 라벨
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.font = '10px monospace';
            this.ctx.fillText('L', leftPos.x - 3, leftPos.y + 3);
        }

        if (gazeData.right_eye.valid && this.isInViewport(rightPos.x, rightPos.y)) {
            this.ctx.fillStyle = 'rgba(100, 100, 255, 0.7)';
            this.ctx.beginPath();
            this.ctx.arc(rightPos.x, rightPos.y, 8, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // 라벨
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.font = '10px monospace';
            this.ctx.fillText('R', rightPos.x - 3, rightPos.y + 3);
        }

        // 평균 포인트 그리기 (메인)
        if (gazeData.average.valid && this.isInViewport(avgPos.x, avgPos.y)) {
            // 외곽 링
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(avgPos.x, avgPos.y, 15, 0, 2 * Math.PI);
            this.ctx.stroke();
            
            // 내부 원
            this.ctx.fillStyle = 'rgba(255, 50, 50, 0.9)';
            this.ctx.beginPath();
            this.ctx.arc(avgPos.x, avgPos.y, 10, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // 중심점
            this.ctx.fillStyle = 'white';
            this.ctx.beginPath();
            this.ctx.arc(avgPos.x, avgPos.y, 2, 0, 2 * Math.PI);
            this.ctx.fill();
        }

        // Viewport 밖의 시선 표시 (화살표로)
        if (gazeData.average.valid && !this.isInViewport(avgPos.x, avgPos.y)) {
            this.drawOutOfBoundsIndicator(avgPos.x, avgPos.y);
        }
        
        // 좌표 정보 표시
        this.drawCoordinateInfo(gazeData, avgPos);
    }

    drawGrid() {
        // Viewport 내부에 격자 그리기
        this.ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
        this.ctx.lineWidth = 1;
        
        const gridSpacing = 50;
        
        // 세로선
        for (let x = this.viewportArea.x; x <= this.viewportArea.x + this.viewportArea.width; x += gridSpacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.viewportArea.y);
            this.ctx.lineTo(x, this.viewportArea.y + this.viewportArea.height);
            this.ctx.stroke();
        }
        
        // 가로선
        for (let y = this.viewportArea.y; y <= this.viewportArea.y + this.viewportArea.height; y += gridSpacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.viewportArea.x, y);
            this.ctx.lineTo(this.viewportArea.x + this.viewportArea.width, y);
            this.ctx.stroke();
        }
        
        // 중심선
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        
        // 중앙 세로선
        const centerX = this.viewportArea.x + this.viewportArea.width / 2;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, this.viewportArea.y);
        this.ctx.lineTo(centerX, this.viewportArea.y + this.viewportArea.height);
        this.ctx.stroke();
        
        // 중앙 가로선
        const centerY = this.viewportArea.y + this.viewportArea.height / 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.viewportArea.x, centerY);
        this.ctx.lineTo(this.viewportArea.x + this.viewportArea.width, centerY);
        this.ctx.stroke();
    }

    isInViewport(x, y) {
        return x >= this.viewportArea.x && 
               x <= this.viewportArea.x + this.viewportArea.width &&
               y >= this.viewportArea.y && 
               y <= this.viewportArea.y + this.viewportArea.height;
    }

    drawOutOfBoundsIndicator(gazeX, gazeY) {
        // Viewport 밖의 시선을 경계에서 화살표로 표시
        const centerX = this.viewportArea.x + this.viewportArea.width / 2;
        const centerY = this.viewportArea.y + this.viewportArea.height / 2;
        
        // 중심에서 시선 방향으로의 벡터
        const dx = gazeX - centerX;
        const dy = gazeY - centerY;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length === 0) return;
        
        // 정규화된 방향 벡터
        const dirX = dx / length;
        const dirY = dy / length;
        
        // Viewport 경계와의 교점 찾기
        let intersectionX, intersectionY;
        
        // 가로 경계 체크
        if (dirX > 0) {
            // 오른쪽 경계
            intersectionX = this.viewportArea.x + this.viewportArea.width;
            intersectionY = centerY + (intersectionX - centerX) * (dirY / dirX);
        } else {
            // 왼쪽 경계
            intersectionX = this.viewportArea.x;
            intersectionY = centerY + (intersectionX - centerX) * (dirY / dirX);
        }
        
        // 세로 경계와 교점이 viewport 범위를 벗어나면 세로 경계 사용
        if (intersectionY < this.viewportArea.y || intersectionY > this.viewportArea.y + this.viewportArea.height) {
            if (dirY > 0) {
                // 아래쪽 경계
                intersectionY = this.viewportArea.y + this.viewportArea.height;
                intersectionX = centerX + (intersectionY - centerY) * (dirX / dirY);
            } else {
                // 위쪽 경계
                intersectionY = this.viewportArea.y;
                intersectionX = centerX + (intersectionY - centerY) * (dirX / dirY);
            }
        }
        
        // 화살표 그리기
        this.ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
        this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
        this.ctx.lineWidth = 2;
        
        const arrowSize = 15;
        this.ctx.beginPath();
        this.ctx.arc(intersectionX, intersectionY, 8, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // 화살표 방향
        const arrowX = intersectionX - dirX * arrowSize;
        const arrowY = intersectionY - dirY * arrowSize;
        
        this.ctx.beginPath();
        this.ctx.moveTo(arrowX, arrowY);
        this.ctx.lineTo(intersectionX, intersectionY);
        this.ctx.stroke();
    }

    drawCoordinateInfo(gazeData, avgPos) {
        // 우상단에 좌표 정보 표시 (상단바와 겹치지 않도록)
        const infoX = this.canvas.width - 290;
        const infoY = Math.max(this.viewportArea.y + 10, 10); // 상단바 아래 또는 viewport 위쪽
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(infoX, infoY, 280, 80);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px monospace';
        
        const normalizedX = gazeData.average.x.toFixed(3);
        const normalizedY = gazeData.average.y.toFixed(3);
        const pixelX = Math.round(avgPos.x - this.viewportArea.x);
        const pixelY = Math.round(avgPos.y - this.viewportArea.y);
        
        this.ctx.fillText(`Normalized: (${normalizedX}, ${normalizedY})`, infoX + 5, infoY + 20);
        this.ctx.fillText(`Screen Pixel: (${pixelX}, ${pixelY})`, infoX + 5, infoY + 40);
        this.ctx.fillText(`Valid: ${gazeData.average.valid ? 'Yes' : 'No'}`, infoX + 5, infoY + 60);
    }

    toggleTrail() {
        this.showTrail = !this.showTrail;
        return this.showTrail;
    }

    clearTrail() {
        this.gazeTrail = [];
    }

    setTrailLength(length) {
        this.maxTrailLength = length;
    }

    updateScreenConfig(config) {
        this.screenConfig = { ...this.screenConfig, ...config };
        this.updateViewportArea();
    }
}


/**
 * @TobiiVisualizer3D - Enhanced with Real-time Eye Tracking Data
 */
class TobiiVisualizer3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Three.js container not found:', containerId);
            return;
        }

        // Three.js 기본 설정
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // 3D 객체들
        this.leftEye = null;
        this.rightEye = null;
        this.leftGazeRay = null;
        this.rightGazeRay = null;
        this.avgGazeRay = null;
        this.screenPlane = null;
        this.hitPoint = null;
        this.hitGlow = null;
        this.hitTrail = [];

        // 상태
        this.showRays = true;
        this.maxTrailLength = 50;
        
        // 마우스 컨트롤 상태
        this.mouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.cameraAngleX = 0;
        this.cameraAngleY = 0;
        this.cameraDistance = 800;

        this.init();
    }

    init() {
        this.setupThreeJS();
        this.createScene();
        this.setupLighting();
        this.setupCamera();
        this.setupControls();
        this.animate();

        console.log('TobiiVisualizer3D initialized with enhanced eye tracking visualization');
    }

    setupThreeJS() {
        // Scene 생성
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);

        // Renderer 생성
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        const rect = this.container.getBoundingClientRect();
        this.renderer.setSize(rect.width, rect.height);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.container.appendChild(this.renderer.domElement);
    }

    createScene() {
        // 좌표계 헬퍼
        const axesHelper = new THREE.AxesHelper(100);
        this.scene.add(axesHelper);

        // 그리드 헬퍼
        const gridHelper = new THREE.GridHelper(500, 20, 0x004400, 0x002200);
        gridHelper.position.y = -100;
        this.scene.add(gridHelper);

        // 눈 모델들
        this.createEyeModels();
        
        // 화면 평면
        this.createScreenPlane();
        
        // 시선 Ray들
        this.createGazeRays();
        
        // Hit point
        this.createHitPoint();
    }

    createEyeModels() {
        const eyeGeometry = new THREE.SphereGeometry(8, 16, 12);
        
        // 왼쪽 눈 (빨간색)
        const leftEyeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.leftEye = new THREE.Mesh(eyeGeometry, leftEyeMaterial);
        this.scene.add(this.leftEye);

        // 오른쪽 눈 (파란색)
        const rightEyeMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        this.rightEye = new THREE.Mesh(eyeGeometry, rightEyeMaterial);
        this.scene.add(this.rightEye);
    }

    createScreenPlane() {
        // 화면 평면 (531mm x 298mm)
        const screenGeometry = new THREE.PlaneGeometry(531, 298);
        const screenMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x333333, 
            transparent: true, 
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        this.screenPlane = new THREE.Mesh(screenGeometry, screenMaterial);
        this.screenPlane.position.set(0, 0, 600);
        this.scene.add(this.screenPlane);

        // 화면 테두리
        const borderGeometry = new THREE.EdgesGeometry(screenGeometry);
        const borderMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 });
        const screenBorder = new THREE.LineSegments(borderGeometry, borderMaterial);
        screenBorder.position.copy(this.screenPlane.position);
        this.scene.add(screenBorder);
    }

    createGazeRays() {
        // 왼쪽 시선 Ray
        const leftRayMaterial = new THREE.LineBasicMaterial({ 
            color: 0xff4444,
            linewidth: 3
        });
        this.leftGazeRay = new THREE.Line(new THREE.BufferGeometry(), leftRayMaterial);
        this.scene.add(this.leftGazeRay);

        // 오른쪽 시선 Ray
        const rightRayMaterial = new THREE.LineBasicMaterial({ 
            color: 0x4444ff,
            linewidth: 3
        });
        this.rightGazeRay = new THREE.Line(new THREE.BufferGeometry(), rightRayMaterial);
        this.scene.add(this.rightGazeRay);

        // 평균 시선 Ray
        const avgRayMaterial = new THREE.LineBasicMaterial({ 
            color: 0x40ff80,
            linewidth: 4
        });
        this.avgGazeRay = new THREE.Line(new THREE.BufferGeometry(), avgRayMaterial);
        this.scene.add(this.avgGazeRay);
    }

    createHitPoint() {
        const hitGeometry = new THREE.SphereGeometry(5, 16, 12);
        const hitMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.hitPoint = new THREE.Mesh(hitGeometry, hitMaterial);
        this.scene.add(this.hitPoint);

        // 글로우 효과
        const hitGlow = new THREE.Mesh(
            new THREE.SphereGeometry(12, 16, 12),
            new THREE.MeshBasicMaterial({ 
                color: 0x00ff00, 
                transparent: true, 
                opacity: 0.3 
            })
        );
        this.hitGlow = hitGlow;
        this.scene.add(hitGlow);
    }

    setupLighting() {
        // 환경광
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        // 주 조명
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(200, 200, 200);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
    }

    setupCamera() {
        const rect = this.container.getBoundingClientRect();
        this.camera = new THREE.PerspectiveCamera(
            75,
            rect.width / rect.height,
            0.1,
            2000
        );
        
        // 카메라 초기 위치
        this.camera.position.set(300, 200, 800);
        this.camera.lookAt(0, 0, 600);
    }

    setupControls() {
        this.renderer.domElement.addEventListener('mousedown', (event) => {
            this.mouseDown = true;
            this.mouseX = event.clientX;
            this.mouseY = event.clientY;
        });

        this.renderer.domElement.addEventListener('mouseup', () => {
            this.mouseDown = false;
        });

        this.renderer.domElement.addEventListener('mousemove', (event) => {
            if (this.mouseDown) {
                const deltaX = event.clientX - this.mouseX;
                const deltaY = event.clientY - this.mouseY;
                
                this.cameraAngleY += deltaX * 0.01;
                this.cameraAngleX += deltaY * 0.01;
                
                this.cameraAngleX = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.cameraAngleX));
                
                const x = this.cameraDistance * Math.cos(this.cameraAngleX) * Math.sin(this.cameraAngleY);
                const y = this.cameraDistance * Math.sin(this.cameraAngleX);
                const z = this.cameraDistance * Math.cos(this.cameraAngleX) * Math.cos(this.cameraAngleY) + 600;
                
                this.camera.position.set(x, y, z);
                this.camera.lookAt(0, 0, 600);
                
                this.mouseX = event.clientX;
                this.mouseY = event.clientY;
            }
        });

        this.renderer.domElement.addEventListener('wheel', (event) => {
            this.cameraDistance += event.deltaY * 0.5;
            this.cameraDistance = Math.max(200, Math.min(1500, this.cameraDistance));
            
            const x = this.cameraDistance * Math.cos(this.cameraAngleX) * Math.sin(this.cameraAngleY);
            const y = this.cameraDistance * Math.sin(this.cameraAngleX);
            const z = this.cameraDistance * Math.cos(this.cameraAngleX) * Math.cos(this.cameraAngleY) + 600;
            
            this.camera.position.set(x, y, z);
            this.camera.lookAt(0, 0, 600);
        });
    }

    updateFrame(frame) {
        console.log('TobiiVisualizer3D updateFrame called with:', frame);
        
        if (!frame || !this.scene) {
            console.log('Frame or scene not available');
            return;
        }

        // 눈 위치 업데이트
        if (frame.leftEyeOrigin) {
            this.leftEye.position.set(...frame.leftEyeOrigin);
            this.leftEye.visible = true;
        } else {
            this.leftEye.visible = false;
        }

        if (frame.rightEyeOrigin) {
            this.rightEye.position.set(...frame.rightEyeOrigin);
            this.rightEye.visible = true;
        } else {
            this.rightEye.visible = false;
        }

        // 시선 Ray 업데이트
        if (this.showRays) {
            this.updateGazeRay(this.leftGazeRay, frame.leftEyeOrigin, frame.leftGazeDir);
            this.updateGazeRay(this.rightGazeRay, frame.rightEyeOrigin, frame.rightGazeDir);
            this.updateAverageGazeRay(frame);
        }

        // Hit point 업데이트
        if (frame.valid && frame.screenHit3D) {
            this.hitPoint.position.set(...frame.screenHit3D);
            this.hitGlow.position.copy(this.hitPoint.position);
            this.hitPoint.visible = true;
            this.hitGlow.visible = true;
            
            this.updateHitTrail(frame.screenHit3D);
        } else {
            this.hitPoint.visible = false;
            this.hitGlow.visible = false;
        }

        // Quality 기반 투명도 조절
        if (frame.quality) {
            const alpha = frame.quality.confidence;
            this.leftGazeRay.material.opacity = alpha * 0.8;
            this.rightGazeRay.material.opacity = alpha * 0.8;
            this.avgGazeRay.material.opacity = alpha * 0.9;
        }
    }

    updateGazeRay(rayObject, origin, direction) {
        if (!origin || !direction || !rayObject) return;

        const points = [];
        points.push(new THREE.Vector3(...origin));
        
        // Ray 끝점 계산 (200 길이로 연장)
        const rayLength = 200;
        const endPoint = new THREE.Vector3(
            origin[0] + direction[0] * rayLength,
            origin[1] + direction[1] * rayLength,
            origin[2] + direction[2] * rayLength
        );
        points.push(endPoint);

        rayObject.geometry.setFromPoints(points);
        rayObject.visible = this.showRays;
    }

    updateAverageGazeRay(frame) {
        if (!frame.leftEyeOrigin || !frame.rightEyeOrigin || !frame.avgGazeDir) return;

        // 양쪽 눈의 중점에서 시작
        const avgOrigin = [
            (frame.leftEyeOrigin[0] + frame.rightEyeOrigin[0]) / 2,
            (frame.leftEyeOrigin[1] + frame.rightEyeOrigin[1]) / 2,
            (frame.leftEyeOrigin[2] + frame.rightEyeOrigin[2]) / 2
        ];

        this.updateGazeRay(this.avgGazeRay, avgOrigin, frame.avgGazeDir);
    }

    updateHitTrail(hitPoint3D) {
        this.hitTrail.push({
            position: [...hitPoint3D],
            timestamp: Date.now()
        });

        if (this.hitTrail.length > this.maxTrailLength) {
            this.hitTrail.shift();
        }
    }

    toggleRays() {
        this.showRays = !this.showRays;
        
        if (this.leftGazeRay) {
            this.leftGazeRay.visible = this.showRays;
        }
        if (this.rightGazeRay) {
            this.rightGazeRay.visible = this.showRays;
        }
        if (this.avgGazeRay) {
            this.avgGazeRay.visible = this.showRays;
        }
        
        return this.showRays;
    }

    resetCamera() {
        this.cameraAngleX = 0;
        this.cameraAngleY = 0;
        this.cameraDistance = 800;
        this.camera.position.set(300, 200, 800);
        this.camera.lookAt(0, 0, 600);
    }

    onWindowResize() {
        if (!this.camera || !this.renderer || !this.container) return;

        const rect = this.container.getBoundingClientRect();
        this.camera.aspect = rect.width / rect.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(rect.width, rect.height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Hit point 글로우 효과
        if (this.hitGlow && this.hitGlow.visible) {
            const time = Date.now() * 0.005;
            this.hitGlow.scale.setScalar(1 + Math.sin(time) * 0.2);
        }
        
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}


/**
 * @TobiiController
 */

function convertTobiiToCanvasCoords(screenCoords, canvas) {
    const [normX, normY] = screenCoords;
    
    // Tobii screen config
    const tobiiWidth = 531; // mm
    const tobiiHeight = 298; // mm
    const tobiiAspectRatio = tobiiWidth / tobiiHeight; // 1.78
    
    // Canvas 정보
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const canvasAspectRatio = canvasWidth / canvasHeight;
    
    let canvasX, canvasY;
    
    if (Math.abs(canvasAspectRatio - tobiiAspectRatio) < 0.1) {
        // Aspect ratio가 비슷하면 직접 변환
        canvasX = normX * canvasWidth;
        canvasY = normY * canvasHeight;
    } else {
        // Aspect ratio가 다르면 중앙 정렬로 변환
        if (canvasAspectRatio > tobiiAspectRatio) {
            // Canvas가 더 넓음 (letterbox)
            const effectiveWidth = canvasHeight * tobiiAspectRatio;
            const offsetX = (canvasWidth - effectiveWidth) / 2;
            
            canvasX = offsetX + (normX * effectiveWidth);
            canvasY = normY * canvasHeight;
        } else {
            // Canvas가 더 높음 (pillarbox)
            const effectiveHeight = canvasWidth / tobiiAspectRatio;
            const offsetY = (canvasHeight - effectiveHeight) / 2;
            
            canvasX = normX * canvasWidth;
            canvasY = offsetY + (normY * effectiveHeight);
        }
    }
    
    return [canvasX, canvasY];
}

class TobiiController {
    constructor() {
        this.eventSource = null;
        this.isRecording = false;
        this.startTime = null;
        this.gazeCount = 0;
        this.lastStatusUpdate = 0;
    }

    async startRecording(duration, fps, enableStream) {
        if (this.isRecording) return;

        try {
            const params = new URLSearchParams({
                duration: duration,
                fps: fps,
                stream: enableStream
            });

            // 기존 연결이 있다면 정리
            if (this.eventSource) {
                this.eventSource.close();
                this.eventSource = null;
            }

            this.eventSource = new EventSource(`/test/tobii/start?${params}`);
            this.isRecording = true;
            this.startTime = Date.now();
            this.gazeCount = 0;
            this.connectionAttempts = 0;
            this.maxConnectionAttempts = 3;

            this.eventSource.onopen = (event) => {
                console.log('EventSource connection opened');
                this.addLogMessage('✅ Connection established');
                this.connectionAttempts = 0;
            };

            this.eventSource.onmessage = (event) => {
                try {
                    this.handleMessage(JSON.parse(event.data));
                } catch (e) {
                    console.error('Failed to parse message:', event.data);
                    this.addLogMessage(`❌ Parse error: ${e.message}`, 'text-red-400');
                }
            };

            this.eventSource.onerror = (error) => {
                console.error('EventSource error:', error);
                console.log('EventSource readyState:', this.eventSource.readyState);
                console.log('Connection attempts:', this.connectionAttempts);
                
                this.connectionAttempts++;
                
                // ReadyState 확인
                switch(this.eventSource.readyState) {
                    case EventSource.CONNECTING:
                        if (this.connectionAttempts >= this.maxConnectionAttempts) {
                            this.addLogMessage(`❌ Connection failed after ${this.maxConnectionAttempts} attempts`, 'text-red-400');
                            this.forceStopRecording();
                        } else {
                            this.addLogMessage(`🔄 Reconnecting... (${this.connectionAttempts}/${this.maxConnectionAttempts})`, 'text-yellow-400');
                        }
                        break;
                    case EventSource.OPEN:
                        this.addLogMessage('❌ Connection error occurred', 'text-red-400');
                        break;
                    case EventSource.CLOSED:
                        this.addLogMessage('❌ Connection closed by server', 'text-red-400');
                        this.forceStopRecording();
                        break;
                }
            };

            return true;
        } catch (error) {
            console.error('Failed to start recording:', error);
            this.handleError('Failed to start recording');
            return false;
        }
    }

    async stopRecording() {
        if (!this.isRecording) return;

        try {
            const response = await fetch('/test/tobii/stop', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('Stop result:', result);
            
        } catch (error) {
            console.error('Failed to stop recording:', error);
            this.addLogMessage(`❌ Stop failed: ${error.message}`, 'text-red-400');
        }

        this.forceStopRecording();
        return true;
    }

    forceStopRecording() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        this.isRecording = false;
        this.connectionAttempts = 0;
    }

    handleMessage(data) {
        console.log('Message received:', data.type, data); // 디버그
        
        switch (data.type) {
            case 'gaze':
                this.handleGazeData(data.data);
                break;
            case 'enhanced_gaze':  
                console.log('Processing enhanced gaze data'); // 디버그
                this.handleEnhancedGazeData(data.data);
                break;
            case 'status':
                this.handleStatusData(data.data);
                break;
            case 'started':
                this.handleRecordingStarted();
                break;
            case 'stopped':
                this.handleRecordingStopped();
                break;
            case 'error':
                this.handleError(data.message);
                break;
            case 'log':
                this.handleLogMessage(data.message);
                break;
        }
    }

    handleGazeData(gazeData) {
        this.gazeCount++;
        
        // 시각화 업데이트 - Main과 Sub 동기화
        if (window.page.visualizer) {
            window.page.visualizer.drawGazePoint(gazeData);
        }
        
        if (window.page.sub_visualizer) {
            window.page.sub_visualizer.drawGazePoint(gazeData);
        }

        // UI 업데이트
        this.updateGazeUI(gazeData);
    }

    handleStatusData(statusData) {
        document.getElementById('gaze-count').textContent = statusData.gaze_count || 0;
        document.getElementById('elapsed-time').textContent = `${(statusData.elapsed_seconds || 0).toFixed(1)}s`;
    }

    handleRecordingStarted() {
        document.getElementById('status-text').textContent = 'Recording';
        document.getElementById('status-text').className = 'text-2xl font-bold text-green-600';
        this.addLogMessage('🎯 Recording started');
    }

    handleRecordingStopped() {
        document.getElementById('status-text').textContent = 'Stopped';
        document.getElementById('status-text').className = 'text-2xl font-bold text-red-600';
        this.addLogMessage('⏹️ Recording stopped');
        this.isRecording = false;
    }

    handleError(message) {
        this.addLogMessage(`❌ Error: ${message}`, 'text-red-400');
    }

    handleLogMessage(message) {
        this.addLogMessage(message);
    }

    handleEnhancedGazeData(enhancedData) {
        console.log('Enhanced gaze data received:', enhancedData);
        
        if (window.page.dataManager) {
            window.page.dataManager.processEnhancedData(enhancedData);
        }
        
        // 2D 시각화를 위한 정확한 좌표 변환
        if (enhancedData['3d_visualization'] && enhancedData['3d_visualization'].screen_hit) {
            const screenCoords = enhancedData['3d_visualization'].screen_hit.screen_coords;
            const valid = enhancedData['3d_visualization'].screen_hit.valid;
            
            if (valid) {
                // Main Canvas 업데이트
                if (window.page.visualizer && window.page.visualizer.canvas) {
                    const [canvasX, canvasY] = convertTobiiToCanvasCoords(
                        screenCoords, 
                        window.page.visualizer.canvas
                    );
                    
                    const compatData = {
                        left_eye: { 
                            x: canvasX / window.page.visualizer.canvas.width, 
                            y: canvasY / window.page.visualizer.canvas.height, 
                            valid: true, 
                            pupil: 3.0 
                        },
                        right_eye: { 
                            x: canvasX / window.page.visualizer.canvas.width, 
                            y: canvasY / window.page.visualizer.canvas.height, 
                            valid: true, 
                            pupil: 3.0 
                        },
                        average: { 
                            x: canvasX / window.page.visualizer.canvas.width, 
                            y: canvasY / window.page.visualizer.canvas.height, 
                            valid: true 
                        }
                    };
                    
                    window.page.visualizer.drawGazePoint(compatData);
                }
                
                // Sub Canvas 업데이트
                if (window.page.sub_visualizer && window.page.sub_visualizer.canvas) {
                    const [subCanvasX, subCanvasY] = convertTobiiToCanvasCoords(
                        screenCoords, 
                        window.page.sub_visualizer.canvas
                    );
                    
                    const subCompatData = {
                        left_eye: { 
                            x: subCanvasX / window.page.sub_visualizer.canvas.width, 
                            y: subCanvasY / window.page.sub_visualizer.canvas.height, 
                            valid: true, 
                            pupil: 3.0 
                        },
                        right_eye: { 
                            x: subCanvasX / window.page.sub_visualizer.canvas.width, 
                            y: subCanvasY / window.page.sub_visualizer.canvas.height, 
                            valid: true, 
                            pupil: 3.0 
                        },
                        average: { 
                            x: subCanvasX / window.page.sub_visualizer.canvas.width, 
                            y: subCanvasY / window.page.sub_visualizer.canvas.height, 
                            valid: true 
                        }
                    };
                    
                    window.page.sub_visualizer.drawGazePoint(subCompatData);
                }
            }
        }
    }

    updateGazeUI(gazeData) {
        // 위치 정보 업데이트
        const formatPos = (x, y, valid) => valid ? `(${x.toFixed(3)}, ${y.toFixed(3)})` : 'Invalid';
        
        document.getElementById('left-eye-pos').textContent = formatPos(
            gazeData.left_eye.x, gazeData.left_eye.y, gazeData.left_eye.valid
        );
        document.getElementById('right-eye-pos').textContent = formatPos(
            gazeData.right_eye.x, gazeData.right_eye.y, gazeData.right_eye.valid
        );
        document.getElementById('avg-eye-pos').textContent = formatPos(
            gazeData.average.x, gazeData.average.y, gazeData.average.valid
        );

        // 상세 정보 업데이트
        document.getElementById('left-detailed-pos').textContent = formatPos(
            gazeData.left_eye.x, gazeData.left_eye.y, gazeData.left_eye.valid
        );
        document.getElementById('left-valid').textContent = gazeData.left_eye.valid ? 'Yes' : 'No';
        document.getElementById('left-pupil').textContent = gazeData.left_eye.pupil.toFixed(2);

        document.getElementById('right-detailed-pos').textContent = formatPos(
            gazeData.right_eye.x, gazeData.right_eye.y, gazeData.right_eye.valid
        );
        document.getElementById('right-valid').textContent = gazeData.right_eye.valid ? 'Yes' : 'No';
        document.getElementById('right-pupil').textContent = gazeData.right_eye.pupil.toFixed(2);
    }

    addLogMessage(message, className = 'text-green-400') {
        const logContainer = document.getElementById('log-container');
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${className}`;
        logEntry.textContent = `[${timestamp}] ${message}`;
        
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;

        // 로그 항목 수 제한 (성능)
        const logEntries = logContainer.querySelectorAll('.log-entry');
        if (logEntries.length > 100) {
            logEntries[0].remove();
        }
    }
}

/**
 * @TobiiDataManager
 */
class TobiiDataManager {
    constructor() {
        this.dataBuffer = [];
        this.maxBufferSize = 1800; // 60초 @ 30fps
        this.subscribers = [];
        this.currentIndex = 0;
        this.startTime = null;
    }

    subscribe(callback) {
        this.subscribers.push(callback);
    }

    processEnhancedData(enhancedData) {
        if (!this.startTime) {
            this.startTime = enhancedData.timestamp;
        }

        const viz3d = enhancedData['3d_visualization'];
        const frame = {
            timestamp: enhancedData.timestamp,
            relativeTime: enhancedData.timestamp - this.startTime,
            leftEyeOrigin: viz3d.left_eye_ray.origin,
            rightEyeOrigin: viz3d.right_eye_ray.origin,
            leftGazeDir: viz3d.left_eye_ray.direction,
            rightGazeDir: viz3d.right_eye_ray.direction,
            avgGazeDir: viz3d.average_ray.direction,
            screenHit3D: viz3d.screen_hit.point_3d,
            screenHit2D: viz3d.screen_hit.screen_coords,
            quality: viz3d.quality,
            screenConfig: viz3d.screen_config,
            valid: viz3d.screen_hit.valid && viz3d.left_eye_ray.valid && viz3d.right_eye_ray.valid
        };

        this.addFrame(frame);
        this.notifySubscribers(frame);
    }

    addFrame(frame) {
        this.dataBuffer.push(frame);
        
        if (this.dataBuffer.length > this.maxBufferSize) {
            this.dataBuffer.shift();
        }
        
        this.currentIndex = this.dataBuffer.length - 1;
    }

    notifySubscribers(frame) {
        this.subscribers.forEach(callback => {
            try {
                callback(frame);
            } catch (error) {
                console.error('Subscriber error:', error);
            }
        });
    }

    getFrameAtTime(timestamp) {
        if (!this.startTime) return null;
        
        const relativeTime = timestamp - this.startTime;
        return this.dataBuffer.find(frame => 
            Math.abs(frame.relativeTime - relativeTime) < 50
        );
    }

    getFrameAtIndex(index) {
        return this.dataBuffer[Math.max(0, Math.min(index, this.dataBuffer.length - 1))];
    }

    getTotalDuration() {
        if (this.dataBuffer.length < 2) return 0;
        return this.dataBuffer[this.dataBuffer.length - 1].relativeTime;
    }

    clear() {
        this.dataBuffer = [];
        this.currentIndex = 0;
        this.startTime = null;
    }
}

/**
 * @Page
 */
class Page {
    constructor() {
        this.main = document.querySelector('main');
        this.controller = new TobiiController();
        this.visualizer = null; // 나중에 초기화
        this.sub_visualizer = null;
        this.dataManager = new TobiiDataManager();
        this.visualizer3D = null;
        this.heatMap = null;
        this.timeline = null;
    }

    async init() {
        this.bindEvents();
        this.initializeVisualizers();
        this.setupDataManager();
        this.addLogMessage('Enhanced 3D visualization system initialized');
    }

    initializeVisualizers() {
        // 기존 2D Canvas 초기화
        const gazeCanvas = document.getElementById('gaze-canvas');
        if (gazeCanvas) {
            this.visualizer = new TobiiVisualizer('gaze-canvas');
            this.setupCanvas();
        }

        const sub_gazeCanvas = document.getElementById('sub-gaze-canvas');
        if (sub_gazeCanvas) {
            this.sub_visualizer = new TobiiVisualizer('sub-gaze-canvas');
            this.setupSubCanvas(); // 별도 메서드로 분리
        }

        // Three.js 3D 초기화 추가
        const threeContainer = document.getElementById('three-container');
        if (threeContainer && typeof THREE !== 'undefined') {
            this.visualizer3D = new TobiiVisualizer3D('three-container');
            console.log('3D visualizer initialized');
        } else if (!threeContainer) {
            console.warn('three-container not found');
        } else {
            console.warn('Three.js not loaded');
        }

        // Heat Map Canvas 초기화
        const heatmapCanvas = document.getElementById('heatmap-canvas');
        if (heatmapCanvas) {
            console.log('Heat map canvas found, ready for Phase 3');
        }
    }

    bindEvents() {
        // Recording controls - 안전한 요소 확인
        const startBtn = document.getElementById('start-btn');
        const stopBtn = document.getElementById('stop-btn');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.startRecording();
            });
        }

        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                this.stopRecording();
            });
        }

        // 3D Controls - 안전한 요소 확인
        const cameraReset = document.getElementById('camera-reset');
        const viewToggle = document.getElementById('view-toggle'); // 이름 변경
        const toggleRays = document.getElementById('toggle-rays');   // 3D Rays 토글

        if (cameraReset) {
            cameraReset.addEventListener('click', () => {
                if (this.visualizer3D) {
                    this.visualizer3D.resetCamera();
                    console.log('Camera reset');
                }
            });
        }

        // 3D ↔ 2D Sub visualizer 전환 (상단 메뉴의 버튼)
        if (viewToggle) {
            viewToggle.addEventListener('click', () => {
                const threeContainer = document.getElementById('three-container');
                const subCanvas = document.getElementById('sub-gaze-canvas');
                const mainCanvas = document.getElementById('gaze-canvas');
                
                if (threeContainer && subCanvas && mainCanvas) {
                    const isThreeVisible = !threeContainer.classList.contains('hidden');
                    
                    if (isThreeVisible) {
                        // 3D(미니) + 2D(전체) -> 2D(미니) + 3D(전체)로 전환
                        threeContainer.classList.add('hidden');
                        subCanvas.classList.remove('hidden');
                        
                        // 3D를 전체화면으로 이동
                        mainCanvas.style.display = 'none';
                        this.move3DToFullscreen();
                        
                        viewToggle.textContent = '2D';
                        console.log('Switched: 2D minimap + 3D fullscreen');
                    } else {
                        // 2D(미니) + 3D(전체) -> 3D(미니) + 2D(전체)로 전환
                        threeContainer.classList.remove('hidden');
                        subCanvas.classList.add('hidden');
                        
                        // 2D를 전체화면으로 복원
                        mainCanvas.style.display = 'block';
                        this.move3DToMinimap();
                        
                        viewToggle.textContent = '3D';
                        console.log('Switched: 3D minimap + 2D fullscreen');
                    }
                }
            });
        }

        // 3D 시각화에서 Rays 표시/숨김 (하단 미니뷰의 버튼)
        if (toggleRays) {
            toggleRays.addEventListener('click', () => {
                if (this.visualizer3D) {
                    const showRays = this.visualizer3D.toggleRays();
                    toggleRays.textContent = showRays ? 'Hide Rays' : 'Show Rays';
                    console.log(`3D Rays ${showRays ? 'enabled' : 'disabled'}`);
                }
            });
        }

        // Canvas resize handling
        window.addEventListener('resize', () => {
            this.setupCanvas();
        });
    }

    setupCanvas() {
        const canvas = document.getElementById('gaze-canvas');
        const container = canvas.parentElement;
        
        // 전체화면 여부 확인
        const isFullscreen = canvas.style.display !== 'none' && 
                            container.classList.contains('absolute');
        
        if (isFullscreen) {
            // 전체화면일 때: 실제 화면 크기 사용
            const rect = container.getBoundingClientRect();
            const devicePixelRatio = window.devicePixelRatio || 1;
            
            // CSS 크기 설정
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
            
            // Canvas 내부 해상도 설정 (고해상도 대응)
            canvas.width = rect.width * devicePixelRatio;
            canvas.height = rect.height * devicePixelRatio;
            
            // Context scaling 적용
            const ctx = canvas.getContext('2d');
            ctx.scale(devicePixelRatio, devicePixelRatio);
            
            console.log(`Fullscreen canvas: ${rect.width}x${rect.height}, ratio: ${(rect.width/rect.height).toFixed(2)}`);
        } else {
            // 미니맵일 때: Tobii screen aspect ratio 유지
            const containerWidth = container.clientWidth - 24;
            const tobiiAspectRatio = 531 / 298; // 1.78 (Tobii screen 비율)
            const height = containerWidth / tobiiAspectRatio;
            
            canvas.style.width = `${containerWidth}px`;
            canvas.style.height = `${height}px`;
            canvas.width = containerWidth;
            canvas.height = height;
            
            console.log(`Minimap canvas: ${containerWidth}x${height}, Tobii ratio: ${tobiiAspectRatio.toFixed(2)}`);
        }
    }

    setupSubCanvas() {
        const sub_canvas = document.getElementById('sub-gaze-canvas');
        if (!sub_canvas) return;

        const sub_container = sub_canvas.parentElement;
        const sub_containerWidth = sub_container.clientWidth - 24;
        
        // 항상 Tobii screen aspect ratio 사용
        const tobiiAspectRatio = 531 / 298;
        const sub_height = sub_containerWidth / tobiiAspectRatio;
        
        sub_canvas.style.width = `${sub_containerWidth}px`;
        sub_canvas.style.height = `${sub_height}px`;
        sub_canvas.width = sub_containerWidth;
        sub_canvas.height = sub_height;
        
        console.log(`Sub canvas: ${sub_containerWidth}x${sub_height}, Tobii ratio: ${tobiiAspectRatio.toFixed(2)}`);
    }

    setupDataManager() {
        // Data manager 구독 설정
        this.dataManager.subscribe((frame) => {
            this.updateVisualizationViews(frame);
        });
    }

    async startRecording() {
        const duration = parseInt(document.getElementById('duration-input').value);
        const fps = parseInt(document.getElementById('fps-select').value);
        const enableStream = document.getElementById('enable-stream').checked;

        this.addLogMessage(`Starting recording: ${duration}s @ ${fps}fps`);

        const success = await this.controller.startRecording(duration, fps, enableStream);
        
        if (success) {
            document.getElementById('start-btn').disabled = true;
            document.getElementById('stop-btn').disabled = false;
            
            // 두 visualizer 모두 초기화
            if (this.visualizer) {
                this.visualizer.clearTrail();
            }
            if (this.sub_visualizer) {
                this.sub_visualizer.clearTrail();
            }
        } else {
            this.addLogMessage('Failed to start recording', 'text-red-400');
        }
    }

    async stopRecording() {
        this.addLogMessage('Stopping recording...');
        
        await this.controller.stopRecording();
        
        document.getElementById('start-btn').disabled = false;
        document.getElementById('stop-btn').disabled = true;
        
        setTimeout(() => {
            document.getElementById('status-text').textContent = 'Ready';
            document.getElementById('status-text').className = 'text-2xl font-bold text-blue-600';
        }, 1000);
    }

    addLogMessage(message, className = 'text-green-400') {
        this.controller.addLogMessage(message, className);
    }

    updateVisualizationViews(frame) {
        console.log('Updating visualization views with frame:', frame); // 디버그
        
        // 3D 시각화 업데이트
        if (this.visualizer3D) {
            console.log('Updating 3D visualizer'); // 디버그
            this.visualizer3D.updateFrame(frame);
        } else {
            console.log('3D visualizer not available'); // 디버그
        }
        
        // 기존 로그
        if (frame.valid) {
            const pos = `(${frame.screenHit2D[0].toFixed(3)}, ${frame.screenHit2D[1].toFixed(3)})`;
            const confidence = frame.quality.confidence.toFixed(2);
            console.log(`3D Gaze: ${pos}, Quality: ${confidence}`);
        }
    }

    move3DToFullscreen() {
        if (!this.visualizer3D) return;
        
        // 3D renderer를 전체화면 컨테이너로 이동
        const fullscreenContainer = document.querySelector('.absolute.inset-0.bg-gray-900');
        const rendererElement = this.visualizer3D.renderer.domElement;
        
        // 스타일 조정
        rendererElement.style.width = '100%';
        rendererElement.style.height = '100%';
        rendererElement.style.position = 'absolute';
        rendererElement.style.top = '0';
        rendererElement.style.left = '0';
        rendererElement.style.zIndex = '1';
        
        fullscreenContainer.appendChild(rendererElement);
        
        // 3D renderer 크기 조정
        const rect = fullscreenContainer.getBoundingClientRect();
        this.visualizer3D.camera.aspect = rect.width / rect.height;
        this.visualizer3D.camera.updateProjectionMatrix();
        this.visualizer3D.renderer.setSize(rect.width, rect.height);
    }

    move3DToMinimap() {
        if (!this.visualizer3D) return;
        
        // 3D renderer를 미니맵 컨테이너로 복원
        const minimapContainer = document.getElementById('three-container');
        const rendererElement = this.visualizer3D.renderer.domElement;
        
        // 스타일 복원
        rendererElement.style.width = '100%';
        rendererElement.style.height = '100%';
        rendererElement.style.position = 'relative';
        rendererElement.style.top = 'auto';
        rendererElement.style.left = 'auto';
        rendererElement.style.zIndex = 'auto';
        
        minimapContainer.appendChild(rendererElement);
        
        // 3D renderer 크기 조정
        const rect = minimapContainer.getBoundingClientRect();
        this.visualizer3D.camera.aspect = rect.width / rect.height;
        this.visualizer3D.camera.updateProjectionMatrix();
        this.visualizer3D.renderer.setSize(rect.width, rect.height);
    }
}

/**
 * @export
 */
export const page = new Page();

/**
 * @window
 */
if (!window.page) {
    window.page = page;
}

/**
 * @event
 */
document.addEventListener('DOMContentLoaded', async() => {
    await page.init();
});


/**
 * @GazeStatisticsManager - 매 30초마다 누적 구간을 추가하는 통계 관리자
 */
class GazeStatisticsManager {
    constructor() {
        this.recordingStartTime = null;
        this.gazeDataPoints = [];
        this.intervalStep = 30; // 30초 간격
        this.activeIntervals = []; // 동적으로 생성되는 구간들
        this.intervalStats = new Map(); // 각 구간별 통계
        this.isRecording = false;
        this.nextIntervalThreshold = 30; // 다음 구간이 추가될 시간
        
        // UI 요소 초기화
        this.setupUI();
        
        console.log('GazeStatisticsManager initialized with 30-second intervals');
    }

    setupUI() {
        // 통계 표시용 UI 패널이 없으면 생성
        if (!document.getElementById('stats-panel')) {
            this.createStatsPanel();
        }
    }

    createStatsPanel() {
        // 상단 오른쪽에 통계 패널 추가
        const statsPanel = document.createElement('div');
        statsPanel.id = 'stats-panel';
        statsPanel.className = 'absolute top-20 right-4 z-20 w-80 bg-black bg-opacity-80 backdrop-blur-sm border border-gray-600 rounded-lg p-4';
        statsPanel.style.display = 'none'; // 초기에는 숨김
        
        statsPanel.innerHTML = `
            <div class="flex justify-between items-center mb-3">
                <h3 class="text-white text-sm font-semibold">Gaze Statistics (30s intervals)</h3>
                <button id="toggle-stats" class="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs">Hide</button>
            </div>
            <div class="text-xs text-gray-300 mb-3">
                Recording: <span id="recording-duration">0s</span> | Next interval: <span id="next-interval">30s</span>
            </div>
            <div id="intervals-container" class="space-y-2 max-h-60 overflow-y-auto">
                <!-- 동적으로 생성되는 구간들 -->
            </div>
        `;

        document.body.appendChild(statsPanel);

        // 토글 버튼 이벤트
        document.getElementById('toggle-stats').addEventListener('click', () => {
            this.toggleStatsPanel();
        });
    }

    toggleStatsPanel() {
        const panel = document.getElementById('stats-panel');
        const toggleBtn = document.getElementById('toggle-stats');
        
        if (panel.style.display === 'none') {
            panel.style.display = 'block';
            toggleBtn.textContent = 'Hide';
        } else {
            panel.style.display = 'none';
            toggleBtn.textContent = 'Show Stats';
        }
    }

    startRecording() {
        this.recordingStartTime = Date.now();
        this.gazeDataPoints = [];
        this.intervalStats.clear();
        this.activeIntervals = [30]; // 첫 번째 구간: 0-30초
        this.nextIntervalThreshold = 30;
        this.isRecording = true;
        
        // 통계 패널 표시
        const panel = document.getElementById('stats-panel');
        if (panel) {
            panel.style.display = 'block';
            document.getElementById('toggle-stats').textContent = 'Hide';
        }
        
        // UI 초기화
        this.createInitialInterval();
        this.updateRecordingInfo(0);
        
        console.log('Gaze statistics recording started with 30-second intervals');
    }

    stopRecording() {
        this.isRecording = false;
        
        // 최종 통계 계산
        this.calculateFinalStatistics();
        
        console.log('Gaze statistics recording stopped');
        console.log('Final intervals:', this.activeIntervals);
        console.log('Final statistics:', this.intervalStats);
    }

    createInitialInterval() {
        const container = document.getElementById('intervals-container');
        container.innerHTML = ''; // 초기화
        
        // 첫 번째 구간 생성
        this.createIntervalElement(30);
    }

    createIntervalElement(intervalSeconds) {
        const container = document.getElementById('intervals-container');
        
        const intervalElement = document.createElement('div');
        intervalElement.className = 'stats-interval p-2 border border-gray-600 rounded';
        intervalElement.setAttribute('data-interval', intervalSeconds);
        intervalElement.style.borderLeft = '3px solid #6b7280';
        intervalElement.style.opacity = '0.7';
        
        intervalElement.innerHTML = `
            <div class="text-yellow-400 text-xs font-medium">0-${intervalSeconds} seconds</div>
            <div class="text-white text-xs mt-1">
                <div>Average: <span class="avg-pos">-</span></div>
                <div class="flex justify-between">
                    <span>Samples: <span class="sample-count">0</span></span>
                    <span>Stability: <span class="stability">-</span></span>
                </div>
            </div>
        `;
        
        container.appendChild(intervalElement);
        
        // 스크롤을 맨 아래로
        container.scrollTop = container.scrollHeight;
    }

    addGazeData(gazeData) {
        if (!this.isRecording || !this.recordingStartTime) return;
        
        const currentTime = Date.now();
        const elapsedSeconds = (currentTime - this.recordingStartTime) / 1000;
        
        // 새로운 구간 추가 확인
        this.checkAndAddNewInterval(elapsedSeconds);
        
        // 유효한 gaze data만 저장
        if (gazeData.average && gazeData.average.valid) {
            const dataPoint = {
                timestamp: currentTime,
                elapsedSeconds: elapsedSeconds,
                x: gazeData.average.x,
                y: gazeData.average.y,
                confidence: gazeData.quality ? gazeData.quality.confidence : 1.0
            };
            
            this.gazeDataPoints.push(dataPoint);
            
            // 실시간 통계 업데이트
            this.updateRealTimeStatistics(elapsedSeconds);
        }
        
        // 녹화 정보 업데이트
        this.updateRecordingInfo(elapsedSeconds);
    }

    checkAndAddNewInterval(elapsedSeconds) {
        // 다음 30초 구간에 도달했는지 확인
        while (elapsedSeconds >= this.nextIntervalThreshold) {
            this.nextIntervalThreshold += this.intervalStep;
            this.activeIntervals.push(this.nextIntervalThreshold);
            
            // 새 구간 UI 요소 생성
            this.createIntervalElement(this.nextIntervalThreshold);
            
            console.log(`New interval added: 0-${this.nextIntervalThreshold}s`);
        }
    }

    updateRecordingInfo(elapsedSeconds) {
        const durationElement = document.getElementById('recording-duration');
        const nextIntervalElement = document.getElementById('next-interval');
        
        if (durationElement) {
            durationElement.textContent = `${Math.floor(elapsedSeconds)}s`;
        }
        
        if (nextIntervalElement) {
            const timeToNext = Math.max(0, this.nextIntervalThreshold - elapsedSeconds);
            nextIntervalElement.textContent = `${this.nextIntervalThreshold}s (in ${Math.ceil(timeToNext)}s)`;
        }
    }

    updateRealTimeStatistics(elapsedSeconds) {
        // 모든 활성 구간에 대해 통계 계산
        this.activeIntervals.forEach(interval => {
            if (elapsedSeconds >= interval) {
                // 해당 구간이 완료된 경우 최종 통계 계산
                this.calculateIntervalStatistics(interval);
            } else {
                // 진행 중인 구간의 실시간 통계 계산
                this.calculatePartialStatistics(interval, elapsedSeconds);
            }
        });
        
        this.updateUI();
    }

    calculateIntervalStatistics(intervalSeconds) {
        const relevantData = this.gazeDataPoints.filter(
            point => point.elapsedSeconds <= intervalSeconds
        );
        
        if (relevantData.length === 0) return;
        
        const stats = this.computeStatistics(relevantData);
        this.intervalStats.set(intervalSeconds, {
            ...stats,
            completed: true
        });
    }

    calculatePartialStatistics(intervalSeconds, currentElapsed) {
        const relevantData = this.gazeDataPoints.filter(
            point => point.elapsedSeconds <= Math.min(intervalSeconds, currentElapsed)
        );
        
        if (relevantData.length === 0) return;
        
        const stats = this.computeStatistics(relevantData);
        this.intervalStats.set(intervalSeconds, {
            ...stats,
            completed: false,
            progress: Math.min(currentElapsed / intervalSeconds, 1.0)
        });
    }

    computeStatistics(dataPoints) {
        if (dataPoints.length === 0) {
            return {
                averageX: 0,
                averageY: 0,
                sampleCount: 0,
                stability: 0,
                standardDeviationX: 0,
                standardDeviationY: 0
            };
        }
        
        // 평균 계산
        const sumX = dataPoints.reduce((sum, point) => sum + point.x, 0);
        const sumY = dataPoints.reduce((sum, point) => sum + point.y, 0);
        const averageX = sumX / dataPoints.length;
        const averageY = sumY / dataPoints.length;
        
        // 표준 편차 계산 (안정성 지표)
        const varianceX = dataPoints.reduce((sum, point) => 
            sum + Math.pow(point.x - averageX, 2), 0) / dataPoints.length;
        const varianceY = dataPoints.reduce((sum, point) => 
            sum + Math.pow(point.y - averageY, 2), 0) / dataPoints.length;
        
        const standardDeviationX = Math.sqrt(varianceX);
        const standardDeviationY = Math.sqrt(varianceY);
        
        // 안정성 점수 (0-1, 1이 가장 안정적)
        const maxDeviation = Math.max(standardDeviationX, standardDeviationY);
        const stability = Math.max(0, 1 - (maxDeviation * 10)); // 임의의 스케일링
        
        return {
            averageX,
            averageY,
            sampleCount: dataPoints.length,
            stability,
            standardDeviationX,
            standardDeviationY
        };
    }

    calculateFinalStatistics() {
        // 모든 구간에 대한 최종 통계 계산
        this.activeIntervals.forEach(interval => {
            this.calculateIntervalStatistics(interval);
        });
    }

    updateUI() {
        this.activeIntervals.forEach(interval => {
            const stats = this.intervalStats.get(interval);
            const element = document.querySelector(`[data-interval="${interval}"]`);
            
            if (!element || !stats) return;
            
            const avgPosElement = element.querySelector('.avg-pos');
            const sampleCountElement = element.querySelector('.sample-count');
            const stabilityElement = element.querySelector('.stability');
            
            if (stats.sampleCount > 0) {
                avgPosElement.textContent = `(${stats.averageX.toFixed(3)}, ${stats.averageY.toFixed(3)})`;
                sampleCountElement.textContent = stats.sampleCount;
                stabilityElement.textContent = `${(stats.stability * 100).toFixed(1)}%`;
                
                // 완료된 구간은 다른 색상으로 표시
                if (stats.completed) {
                    element.style.opacity = '1';
                    element.style.borderLeft = '3px solid #10b981';
                    element.querySelector('.text-yellow-400').className = 'text-green-400 text-xs font-medium';
                } else {
                    element.style.opacity = '0.8';
                    element.style.borderLeft = '3px solid #f59e0b';
                    element.querySelector('.text-yellow-400, .text-green-400').className = 'text-yellow-400 text-xs font-medium';
                }
            } else {
                avgPosElement.textContent = '-';
                sampleCountElement.textContent = '0';
                stabilityElement.textContent = '-';
                element.style.opacity = '0.5';
                element.style.borderLeft = '3px solid #6b7280';
            }
        });
    }

    // 시각화에 평균 위치 표시
    drawAveragePositions(visualizer) {
        if (!visualizer || !visualizer.ctx) return;
        
        this.activeIntervals.forEach((interval, index) => {
            const stats = this.intervalStats.get(interval);
            if (!stats || stats.sampleCount === 0) return;
            
            // viewport 좌표로 변환
            const avgPos = visualizer.mapGazeToViewport(stats.averageX, stats.averageY);
            
            if (!visualizer.isInViewport(avgPos.x, avgPos.y)) return;
            
            // 색상 팔레트 (30초마다 다른 색상)
            const colors = [
                '#fbbf24', '#f97316', '#dc2626', '#9333ea', '#059669', 
                '#0ea5e9', '#ec4899', '#84cc16', '#f59e0b', '#8b5cf6'
            ];
            const colorIndex = index % colors.length;
            const color = colors[colorIndex];
            
            const baseSize = 15;
            const size = baseSize + (index * 2); // 시간이 길수록 조금 더 큰 원
            
            // 평균 위치 원 그리기
            visualizer.ctx.strokeStyle = color;
            visualizer.ctx.fillStyle = color + '40'; // 투명도 추가
            visualizer.ctx.lineWidth = 2;
            
            visualizer.ctx.beginPath();
            visualizer.ctx.arc(avgPos.x, avgPos.y, size, 0, 2 * Math.PI);
            visualizer.ctx.fill();
            visualizer.ctx.stroke();
            
            // 중심점
            visualizer.ctx.fillStyle = color;
            visualizer.ctx.beginPath();
            visualizer.ctx.arc(avgPos.x, avgPos.y, 3, 0, 2 * Math.PI);
            visualizer.ctx.fill();
            
            // 라벨
            visualizer.ctx.fillStyle = 'white';
            visualizer.ctx.font = '10px monospace';
            visualizer.ctx.fillText(
                `${interval}s`, 
                avgPos.x + size + 5, 
                avgPos.y - size + 5
            );
            
            // 안정성 표시 (원 주변) - 불안정하면 점선
            if (stats.stability < 0.7) {
                visualizer.ctx.strokeStyle = color + '80';
                visualizer.ctx.setLineDash([5, 5]);
                visualizer.ctx.beginPath();
                visualizer.ctx.arc(avgPos.x, avgPos.y, size + 5, 0, 2 * Math.PI);
                visualizer.ctx.stroke();
                visualizer.ctx.setLineDash([]);
            }
            
            // 완료되지 않은 구간은 펄스 효과
            if (!stats.completed) {
                const time = Date.now() * 0.003;
                const pulseAlpha = 0.3 + Math.sin(time) * 0.2;
                visualizer.ctx.fillStyle = color + Math.floor(pulseAlpha * 255).toString(16).padStart(2, '0');
                visualizer.ctx.beginPath();
                visualizer.ctx.arc(avgPos.x, avgPos.y, size + 8, 0, 2 * Math.PI);
                visualizer.ctx.fill();
            }
        });
    }

    // 데이터 내보내기
    exportStatistics() {
        const exportData = {
            recordingStartTime: this.recordingStartTime,
            totalDuration: this.gazeDataPoints.length > 0 ? 
                Math.max(...this.gazeDataPoints.map(p => p.elapsedSeconds)) : 0,
            intervalStep: this.intervalStep,
            activeIntervals: this.activeIntervals,
            intervalStatistics: {},
            rawDataPoints: this.gazeDataPoints
        };
        
        this.activeIntervals.forEach(interval => {
            const stats = this.intervalStats.get(interval);
            if (stats) {
                exportData.intervalStatistics[`0-${interval}s`] = stats;
            }
        });
        
        return exportData;
    }

    // CSV 형태로 내보내기
    exportToCSV() {
        const stats = this.exportStatistics();
        let csv = 'Interval,Average_X,Average_Y,Sample_Count,Stability,Std_Dev_X,Std_Dev_Y,Completed\n';
        
        this.activeIntervals.forEach(interval => {
            const stat = stats.intervalStatistics[`0-${interval}s`];
            if (stat) {
                csv += `0-${interval}s,${stat.averageX.toFixed(6)},${stat.averageY.toFixed(6)},${stat.sampleCount},${stat.stability.toFixed(4)},${stat.standardDeviationX.toFixed(6)},${stat.standardDeviationY.toFixed(6)},${stat.completed}\n`;
            }
        });
        
        return csv;
    }
}

// TobiiVisualizer 클래스에 평균 위치 표시 기능 추가
const originalDrawGazePoint = TobiiVisualizer.prototype.drawGazePoint;
TobiiVisualizer.prototype.drawGazePoint = function(gazeData) {
    // 기존 drawGazePoint 호출
    originalDrawGazePoint.call(this, gazeData);
    
    // 통계 관리자가 있으면 평균 위치 표시
    if (window.page && window.page.statsManager) {
        window.page.statsManager.drawAveragePositions(this);
    }
};

// Page 클래스에 통계 관리자 추가
const originalPageInit = Page.prototype.init;
Page.prototype.init = async function() {
    await originalPageInit.call(this);
    
    // 통계 관리자 초기화
    this.statsManager = new GazeStatisticsManager();
    
    console.log('Statistics manager added to page');
};

const originalStartRecording = Page.prototype.startRecording;
Page.prototype.startRecording = async function() {
    const result = await originalStartRecording.call(this);
    
    // 통계 수집 시작
    if (this.statsManager) {
        this.statsManager.startRecording();
    }
    
    return result;
};

const originalStopRecording = Page.prototype.stopRecording;
Page.prototype.stopRecording = async function() {
    const result = await originalStopRecording.call(this);
    
    // 통계 수집 종료
    if (this.statsManager) {
        this.statsManager.stopRecording();
    }
    
    return result;
};

// TobiiController에서 gaze data를 통계 관리자에 전달
const originalHandleGazeData = TobiiController.prototype.handleGazeData;
TobiiController.prototype.handleGazeData = function(gazeData) {
    originalHandleGazeData.call(this, gazeData);
    
    // 통계 관리자에 데이터 전달
    if (window.page && window.page.statsManager) {
        window.page.statsManager.addGazeData(gazeData);
    }
};

const originalHandleEnhancedGazeData = TobiiController.prototype.handleEnhancedGazeData;
TobiiController.prototype.handleEnhancedGazeData = function(enhancedData) {
    originalHandleEnhancedGazeData.call(this, enhancedData);
    
    // Enhanced data에서 2D 좌표 추출하여 통계에 추가
    if (enhancedData['3d_visualization'] && enhancedData['3d_visualization'].screen_hit) {
        const screenCoords = enhancedData['3d_visualization'].screen_hit.screen_coords;
        const valid = enhancedData['3d_visualization'].screen_hit.valid;
        const quality = enhancedData['3d_visualization'].quality;
        
        if (valid && window.page && window.page.statsManager) {
            const compatData = {
                average: { 
                    x: screenCoords[0], 
                    y: screenCoords[1], 
                    valid: true 
                },
                quality: quality
            };
            
            window.page.statsManager.addGazeData(compatData);
        }
    }
};