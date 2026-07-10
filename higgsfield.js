document.addEventListener('DOMContentLoaded', () => {
    // --- State Variables ---
    let currentTab = 'playground';
    let executionMode = 'mock'; // 'mock' or 'real'
    let currentTask = 'text-to-image'; // 'text-to-image', 'text-to-video', 'image-to-video'
    let activeGeneration = null;
    let mockTimer = null;
    let selectedImageSrc = null;

    // Database of Mock Assets for Realistic Simulation
    const mockAssets = {
        'text-to-image': [
            {
                url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
                prompt: 'Abstract liquid fluid art, neon purple and teal colors, 3d render',
                resolution: '1080p',
                seed: 48923
            },
            {
                url: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&w=800&q=80',
                prompt: 'Cyberpunk neon street at night with retro cars, rainy reflection',
                resolution: '1080p',
                seed: 12938
            },
            {
                url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
                prompt: 'Wes Anderson style symmetry, cinematic pastel colors, detailed illustration',
                resolution: '1080p',
                seed: 87402
            },
            {
                url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80',
                prompt: 'Modern digital painting, surreal dreamscape with floating islands',
                resolution: '1080p',
                seed: 55431
            }
        ],
        'text-to-video': [
            {
                url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
                prompt: 'Dynamic camera panning shot of a cyberpunk city street with neon signs and glowing headlights, cinematic reflection on wet asphalt',
                duration: 4,
                seed: 98112
            },
            {
                url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
                prompt: 'Cinematic tracking shot of high-tech modern buildings illuminated by vibrant violet and cyan neon signage, night scene',
                duration: 4,
                seed: 75422
            },
            {
                url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
                prompt: 'Beautiful slow motion shot of an astronaut floating gracefully in deep space, colorful cosmic nebula in the background, unreal engine 5 render',
                duration: 8,
                seed: 22134
            }
        ],
        'image-to-video': [
            {
                url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                prompt: 'Animate ocean waves lapping on a golden sand beach under a sunset sky, slow motion, drone shot',
                duration: 4,
                seed: 88722
            }
        ]
    };

    // Model database based on Higgsfield SDK
    const modelCatalog = {
        'text-to-image': [
            { id: 'flux_2/pro', name: 'Flux 2.0 Pro (초정밀 텍스트 및 상세 묘사)' },
            { id: 'text2image_soul_v2', name: 'Soul ID v2 (동일 캐릭터 일관성 유지)' },
            { id: 'cinematic_studio_2_5', name: 'Cinematic Studio 2.5 (시네마틱 연출)' },
            { id: 'grok_image_2', name: 'Grok Image 2.0 (웹툰 및 일러스트)' },
            { id: 'image_auto', name: 'Auto Routing Engine (자동 모델 배정)' }
        ],
        'text-to-video': [
            { id: 'veo-3-1-preview', name: 'Google Veo 3.1 Pro (최고 화질 특수효과)' },
            { id: 'veo-3-1-fast', name: 'Google Veo 3.1 Fast (고속 시네마틱 렌더링)' },
            { id: 'kling_3_0_pro', name: 'Kling 3.0 Pro (자연스러운 인물 & 립싱크)' },
            { id: 'seedance_2_0_mini', name: 'Seedance 2.0 Mini (광고 및 스토리보드)' },
            { id: 'wan2_7', name: 'Wan 2.7 Cinematic (고화질 물리학적 무브먼트)' }
        ],
        'image-to-video': [
            { id: 'veo3_1_lite', name: 'Veo 3.1 Lite (고속 이미지 애니메이션)' },
            { id: 'kling_omni_image', name: 'Kling O1 Image (물리 기반 입체 움직임)' },
            { id: 'seedance_2_0_mini/image-to-video', name: 'Seedance 2.0 (멀티샷 상업 연출)' },
            { id: 'wan2_6', name: 'Wan 2.6 Video Ref (모션 참조 애니메이터)' }
        ]
    };

    // --- DOM Elements ---
    const btnPlayground = document.getElementById('nav-btn-playground');
    const btnGallery = document.getElementById('nav-btn-gallery');
    const btnDocs = document.getElementById('nav-btn-docs');
    const tabPlayground = document.getElementById('tab-playground');
    const tabGallery = document.getElementById('tab-gallery');
    const tabDocs = document.getElementById('tab-docs');
    const themeToggleBtn = document.getElementById('btn-theme-toggle');

    // Configuration / API Key elements
    const btnModeMock = document.getElementById('btn-mode-mock');
    const btnModeReal = document.getElementById('btn-mode-real');
    const realApiFields = document.querySelector('.real-api-fields');
    const inputKeyId = document.getElementById('hf-key-id');
    const inputKeySecret = document.getElementById('hf-key-secret');
    const inputProxyUrl = document.getElementById('hf-proxy-url');
    const btnCollapseCredentials = document.getElementById('btn-collapse-credentials');
    const credentialsBody = document.getElementById('credentials-body');
    const labelPlaygroundMode = document.getElementById('playground-mode-label');

    // Input Elements
    const btnTasks = document.querySelectorAll('.btn-task');
    const modelSelect = document.getElementById('hf-model-select');
    const modelCustomInput = document.getElementById('hf-model-custom');
    const btnToggleModelInput = document.getElementById('btn-toggle-model-input');
    const promptInput = document.getElementById('hf-prompt');
    const btnLoadRecent = document.getElementById('btn-load-recent');
    const imageInputContainer = document.getElementById('image-input-container');
    const imageUploader = document.getElementById('image-uploader');
    const imageFileInput = document.getElementById('hf-image-file');
    const imageUrlInput = document.getElementById('hf-image-url');
    const imagePreviewBox = document.getElementById('image-preview-box');
    const imagePreview = document.getElementById('image-preview');
    const btnRemoveImage = document.getElementById('btn-remove-image');

    // Parameter Elements
    const aspectRatioSelect = document.getElementById('hf-aspect-ratio');
    const durationSelect = document.getElementById('hf-duration');
    const motionStrengthInput = document.getElementById('hf-motion-strength');
    const motionValLabel = document.getElementById('motion-val');
    const safetySelect = document.getElementById('hf-safety');
    const seedInput = document.getElementById('hf-seed');
    const videoOnlyParams = document.querySelectorAll('.video-only-param');
    const imageOnlyParams = document.querySelectorAll('.image-only-param');

    // Generator & Monitor Elements
    const btnGenerate = document.getElementById('btn-generate');
    const monitorPlaceholder = document.getElementById('generation-placeholder');
    const monitorContent = document.getElementById('generation-monitor-content');
    const monitorBadge = document.getElementById('monitor-badge');
    const monitorStatusText = document.getElementById('monitor-status-text');
    const monitorPercentageText = document.getElementById('monitor-percentage-text');
    const monitorProgressBar = document.getElementById('monitor-progress-bar');
    const monitorRequestId = document.getElementById('monitor-request-id');
    const monitorTimeElapsed = document.getElementById('monitor-time-elapsed');
    const consoleLogsContainer = document.getElementById('console-logs-container');
    const btnClearLogs = document.getElementById('btn-clear-logs');
    
    // JSON Inspector Elements
    const inspectorToggleReq = document.getElementById('inspector-toggle-req');
    const inspectorReqJson = document.getElementById('inspector-req-json');
    const inspectorToggleRes = document.getElementById('inspector-toggle-res');
    const inspectorResJson = document.getElementById('inspector-res-json');

    // Output & Gallery Elements
    const btnSaveGallery = document.getElementById('btn-save-gallery');
    const resultPlaceholder = document.getElementById('result-placeholder');
    const resultDisplay = document.getElementById('result-display');
    const galleryGrid = document.getElementById('gallery-grid-container');
    const galleryEmptyState = document.getElementById('gallery-empty-state');
    const btnClearGallery = document.getElementById('btn-clear-gallery');
    const galleryFilterBtns = document.querySelectorAll('.btn-filter');

    // --- Core Initialization ---
    initTheme();
    loadCredentials();
    updateModelOptions();
    checkPromptStudioTransfer();
    renderGallery();

    // --- Tab Switching System ---
    function switchTab(tabName) {
        currentTab = tabName;
        [btnPlayground, btnGallery, btnDocs].forEach(btn => btn.classList.remove('active'));
        [tabPlayground, tabGallery, tabDocs].forEach(tab => tab.classList.remove('active'));

        if (tabName === 'playground') {
            btnPlayground.classList.add('active');
            tabPlayground.classList.add('active');
        } else if (tabName === 'gallery') {
            btnGallery.classList.add('active');
            tabGallery.classList.add('active');
            renderGallery();
        } else if (tabName === 'docs') {
            btnDocs.classList.add('active');
            tabDocs.classList.add('active');
        }
    }

    btnPlayground.addEventListener('click', () => switchTab('playground'));
    btnGallery.addEventListener('click', () => switchTab('gallery'));
    btnDocs.addEventListener('click', () => switchTab('docs'));

    // --- Theme Toggle System ---
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        } else {
            document.body.classList.remove('light-mode');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }
    }

    themeToggleBtn.addEventListener('click', () => {
        const isLightMode = document.body.classList.toggle('light-mode');
        if (isLightMode) {
            localStorage.setItem('theme', 'light');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
            showToast('라이트 모드로 전환되었습니다.', 'info');
        } else {
            localStorage.setItem('theme', 'dark');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
            showToast('다크 모드로 전환되었습니다.', 'info');
        }
    });

    // --- Credentials Manager ---
    function loadCredentials() {
        const keyId = localStorage.getItem('hf_key_id') || '';
        const keySecret = localStorage.getItem('hf_key_secret') || '';
        const proxyUrl = localStorage.getItem('hf_proxy_url') || '';
        const savedMode = localStorage.getItem('hf_execution_mode') || 'mock';

        inputKeyId.value = keyId;
        inputKeySecret.value = keySecret;
        inputProxyUrl.value = proxyUrl;
        
        if (savedMode === 'real') {
            setExecutionMode('real');
        } else {
            setExecutionMode('mock');
        }
    }

    function saveCredentials() {
        localStorage.setItem('hf_key_id', inputKeyId.value.trim());
        localStorage.setItem('hf_key_secret', inputKeySecret.value.trim());
        localStorage.setItem('hf_proxy_url', inputProxyUrl.value.trim());
    }

    function setExecutionMode(mode) {
        executionMode = mode;
        localStorage.setItem('hf_execution_mode', mode);

        if (mode === 'real') {
            btnModeReal.classList.add('active');
            btnModeMock.classList.remove('active');
            realApiFields.style.display = 'flex';
            labelPlaygroundMode.textContent = 'Real API Connected';
            document.querySelector('.playground-status-badge').style.borderColor = 'var(--color-secondary)';
        } else {
            btnModeMock.classList.add('active');
            btnModeReal.classList.remove('active');
            realApiFields.style.display = 'none';
            labelPlaygroundMode.textContent = 'Mock Simulation Mode';
            document.querySelector('.playground-status-badge').style.borderColor = 'var(--border-glass)';
        }
    }

    btnModeMock.addEventListener('click', () => setExecutionMode('mock'));
    btnModeReal.addEventListener('click', () => setExecutionMode('real'));
    [inputKeyId, inputKeySecret, inputProxyUrl].forEach(el => {
        el.addEventListener('input', saveCredentials);
    });

    // Collapse Settings
    btnCollapseCredentials.addEventListener('click', () => {
        const isCollapsed = credentialsBody.style.display === 'none';
        if (isCollapsed) {
            credentialsBody.style.display = 'flex';
            btnCollapseCredentials.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
        } else {
            credentialsBody.style.display = 'none';
            btnCollapseCredentials.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
        }
    });

    // --- Task Switching ---
    btnTasks.forEach(btn => {
        btn.addEventListener('click', () => {
            btnTasks.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentTask = btn.dataset.task;
            updateModelOptions();
            toggleTaskParameters();

            // Reset custom model input when switching tasks
            if (modelSelect && modelCustomInput && btnToggleModelInput) {
                modelSelect.style.display = 'block';
                modelCustomInput.style.display = 'none';
                modelCustomInput.value = '';
                btnToggleModelInput.innerHTML = '<i class="fa-solid fa-pen"></i> 직접 입력';
            }
        });
    });

    // Custom Model ID Input Toggle Click Listener
    if (btnToggleModelInput && modelCustomInput && modelSelect) {
        btnToggleModelInput.addEventListener('click', () => {
            const isSelectVisible = modelSelect.style.display !== 'none';
            if (isSelectVisible) {
                modelSelect.style.display = 'none';
                modelCustomInput.style.display = 'block';
                btnToggleModelInput.innerHTML = '<i class="fa-solid fa-list"></i> 목록 선택';
                modelCustomInput.value = modelSelect.value; // 드롭다운에 선택된 모델 ID를 텍스트창에 자동 대입
                modelCustomInput.focus();
            } else {
                modelSelect.style.display = 'block';
                modelCustomInput.style.display = 'none';
                btnToggleModelInput.innerHTML = '<i class="fa-solid fa-pen"></i> 직접 입력';
            }
        });
    }

    // Helper to get selected model ID (either custom text or dropdown value)
    function getSelectedModel() {
        const isCustomModel = modelCustomInput && modelCustomInput.style.display !== 'none';
        return isCustomModel ? modelCustomInput.value.trim() : modelSelect.value;
    }

    function updateModelOptions() {
        modelSelect.innerHTML = '';
        const models = modelCatalog[currentTask];
        models.forEach(model => {
            const opt = document.createElement('option');
            opt.value = model.id;
            opt.textContent = model.name;
            modelSelect.appendChild(opt);
        });
    }

    function toggleTaskParameters() {
        if (currentTask === 'text-to-image') {
            videoOnlyParams.forEach(el => el.style.display = 'none');
            imageOnlyParams.forEach(el => el.style.display = 'block');
            imageInputContainer.style.display = 'none';
        } else if (currentTask === 'text-to-video') {
            videoOnlyParams.forEach(el => el.style.display = 'block');
            imageOnlyParams.forEach(el => el.style.display = 'none');
            imageInputContainer.style.display = 'none';
        } else if (currentTask === 'image-to-video') {
            videoOnlyParams.forEach(el => el.style.display = 'block');
            imageOnlyParams.forEach(el => el.style.display = 'none');
            imageInputContainer.style.display = 'block';
        }
    }

    // Motion range slider
    motionStrengthInput.addEventListener('input', (e) => {
        motionValLabel.textContent = e.target.value;
    });

    // --- Image Upload System ---
    imageUploader.addEventListener('click', (e) => {
        if (e.target !== imageUrlInput) {
            imageFileInput.click();
        }
    });

    imageFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    imageUrlInput.addEventListener('input', () => {
        const val = imageUrlInput.value.trim();
        if (val.startsWith('http://') || val.startsWith('https://')) {
            setImagePreview(val);
        }
    });

    function setImagePreview(src) {
        selectedImageSrc = src;
        imagePreview.src = src;
        imagePreviewBox.style.display = 'flex';
        imageUploader.style.display = 'none';
    }

    btnRemoveImage.addEventListener('click', () => {
        selectedImageSrc = null;
        imageFileInput.value = '';
        imageUrlInput.value = '';
        imagePreviewBox.style.display = 'none';
        imageUploader.style.display = 'flex';
    });

    // Prompt Suggestions click
    document.querySelectorAll('.suggestion-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            const text = tag.textContent;
            let currentPrompt = promptInput.value.trim();
            if (currentPrompt) {
                promptInput.value = currentPrompt + ', ' + text;
            } else {
                promptInput.value = text;
            }
        });
    });

    // --- Prompt Studio integration check ---
    function checkPromptStudioTransfer() {
        const tempPrompt = localStorage.getItem('higgsfield_temp_prompt');
        if (tempPrompt) {
            btnLoadRecent.style.display = 'inline-flex';
        }
    }

    btnLoadRecent.addEventListener('click', () => {
        const tempPrompt = localStorage.getItem('higgsfield_temp_prompt');
        if (tempPrompt) {
            promptInput.value = tempPrompt;
            showToast('Prompt Studio에서 프롬프트를 성공적으로 가져왔습니다.', 'success');
            localStorage.removeItem('higgsfield_temp_prompt');
            btnLoadRecent.style.display = 'none';
        }
    });

    // --- JSON Inspector Expand/Collapse ---
    inspectorToggleReq.addEventListener('click', () => {
        const isCollapsed = inspectorReqJson.style.display === 'none';
        inspectorReqJson.style.display = isCollapsed ? 'block' : 'none';
        inspectorToggleReq.classList.toggle('expanded', isCollapsed);
    });

    inspectorToggleRes.addEventListener('click', () => {
        const isCollapsed = inspectorResJson.style.display === 'none';
        inspectorResJson.style.display = isCollapsed ? 'block' : 'none';
        inspectorToggleRes.classList.toggle('expanded', isCollapsed);
    });

    // --- Logging Utility ---
    function clearLogs() {
        consoleLogsContainer.innerHTML = '';
    }

    function addLog(message, type = 'info') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        
        const timestamp = document.createElement('span');
        timestamp.className = 'timestamp';
        const now = new Date();
        timestamp.textContent = `[${now.toTimeString().split(' ')[0]}]`;
        
        const text = document.createElement('span');
        text.textContent = message;

        entry.appendChild(timestamp);
        entry.appendChild(text);
        consoleLogsContainer.appendChild(entry);
        consoleLogsContainer.scrollTop = consoleLogsContainer.scrollHeight;
    }

    btnClearLogs.addEventListener('click', clearLogs);

    // --- Generation Engine: Mock & Real ---
    btnGenerate.addEventListener('click', () => {
        if (activeGeneration) {
            showToast('현재 다른 작업이 진행 중입니다. 완료될 때까지 기다려 주세요.', 'warning');
            return;
        }

        const promptText = promptInput.value.trim();
        if (!promptText) {
            showToast('생성 프롬프트를 입력해 주세요.', 'danger');
            promptInput.focus();
            return;
        }

        if (currentTask === 'image-to-video' && !selectedImageSrc) {
            showToast('비디오 생성을 위한 소스 이미지를 업로드하거나 URL을 입력해 주세요.', 'danger');
            return;
        }

        startGeneration(promptText);
    });

    function startGeneration(prompt) {
        // UI reset
        monitorPlaceholder.style.display = 'none';
        monitorContent.style.display = 'block';
        btnSaveGallery.style.display = 'none';
        resultPlaceholder.style.display = 'flex';
        resultDisplay.style.display = 'none';
        resultDisplay.innerHTML = '';
        
        clearLogs();
        inspectorReqJson.style.display = 'none';
        inspectorToggleReq.classList.remove('expanded');
        inspectorResJson.style.display = 'none';
        inspectorToggleRes.classList.remove('expanded');

        const model = getSelectedModel();
        if (!model) {
            showToast('모델 ID를 입력하거나 선택해 주세요.', 'danger');
            return;
        }
        const seed = seedInput.value ? parseInt(seedInput.value) : Math.floor(Math.random() * 1000000);
        const aspect = aspectRatioSelect.value;
        
        const requestPayload = {
            model: model,
            input: {
                prompt: prompt,
                aspect_ratio: aspect,
                seed: seed
            }
        };

        if (currentTask === 'text-to-image') {
            requestPayload.input.safety_tolerance = parseInt(safetySelect.value);
        } else {
            requestPayload.input.duration = parseInt(durationSelect.value);
            requestPayload.input.motion_strength = parseInt(motionStrengthInput.value);
            if (currentTask === 'image-to-video') {
                requestPayload.input.image = selectedImageSrc.startsWith('data:') ? '[Base64 Image Uploaded]' : selectedImageSrc;
            }
        }

        inspectorReqJson.textContent = JSON.stringify(requestPayload, null, 2);

        if (executionMode === 'mock') {
            runMockGeneration(prompt, requestPayload);
        } else {
            runRealGeneration(prompt, requestPayload);
        }
    }

    // --- Mock Generation Simulation ---
    function runMockGeneration(prompt, requestPayload) {
        activeGeneration = { mode: 'mock' };
        
        // Generate a request ID
        const requestId = 'hf_req_' + Math.random().toString(36).substring(2, 11);
        monitorRequestId.textContent = requestId;
        
        setMonitorState('queued', 0, '대기열에 진입 중...');
        addLog(`[INFO] Higgsfield API에 연결하는 중 (Simulation Mode)...`);
        addLog(`[INFO] 태스크 유형: ${currentTask}, 모델: ${requestPayload.model}`);
        
        let elapsed = 0;
        let progress = 0;
        const startTime = Date.now();

        // Status Timeline Simulation
        const timeline = [
            { t: 0, status: 'queued', progress: 5, log: '[SUCCESS] 요청 수락 완료. 대기열 ID: ' + requestId, logType: 'success' },
            { t: 1.5, status: 'queued', progress: 10, log: '[POLLING] 상태 검사: queued (대기 순번: 1)', logType: 'polling' },
            { t: 3.5, status: 'in_progress', progress: 15, log: '[INFO] 상태 전환: in_progress. GPU 자원 할당 완료.', logType: 'info' },
            { t: 4.5, status: 'in_progress', progress: 20, log: '[INFO] [in_progress] 모델 가중치 로딩 및 디퓨전 샘플러 인스턴스 초기화 중...', logType: 'info' },
            { t: 6.5, status: 'in_progress', progress: 40, log: '[INFO] [in_progress] 프레임 노이즈 제거 진행 중 (Denoising DPM-Solver 35%)...', logType: 'info' },
            { t: 8.5, status: 'in_progress', progress: 65, log: currentTask !== 'text-to-image' ? `[INFO] [in_progress] 모션 필드 계산 및 Temporal Attention 가중치 주입 (강도: ${requestPayload.input.motion_strength || 5})...` : '[INFO] [in_progress] 텍스트 크로스 어텐션 최적화 및 디테일 개선 중...', logType: 'info' },
            { t: 10.5, status: 'in_progress', progress: 85, log: '[INFO] [in_progress] 초고해상도 업스케일러 및 미디어 포맷팅 처리 중...', logType: 'info' },
            { t: 12, status: 'completed', progress: 100, log: '[SUCCESS] 상태 전환: completed. 미디어 생성이 성공적으로 완료되었습니다!', logType: 'success' }
        ];

        // Simulated response payloads matching timeline
        const responses = {
            'queued': { request_id: requestId, status: 'queued', position: 1, created_at: new Date().toISOString() },
            'in_progress': { request_id: requestId, status: 'in_progress', progress_ratio: 0.4, elapsed_seconds: 4.5 },
            'completed': {
                request_id: requestId,
                status: 'completed',
                jobs: [
                    {
                        model: requestPayload.model,
                        results: {
                            raw: {
                                url: '', // To be filled dynamically
                                credits_consumed: currentTask === 'text-to-image' ? 1.0 : (requestPayload.input.duration === 4 ? 4.0 : 8.0)
                            }
                        }
                    }
                ],
                completed_at: new Date().toISOString()
            }
        };

        // Time updates ticker
        mockTimer = setInterval(() => {
            elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            monitorTimeElapsed.textContent = elapsed + 's';

            // Find current event in timeline
            const currentEvent = timeline.filter(e => e.t <= elapsed).pop();
            
            if (currentEvent) {
                const currentStatus = currentEvent.status;
                const targetProgress = currentEvent.progress;
                
                // Set monitor state
                setMonitorState(currentStatus, targetProgress, getStatusText(currentStatus, targetProgress));
                
                // Add logs on first trigger of time segment
                if (currentEvent.triggered === undefined) {
                    currentEvent.triggered = true;
                    addLog(currentEvent.log, currentEvent.logType);
                    
                    // Show updated JSON response payload
                    const resPayload = responses[currentStatus];
                    if (currentStatus === 'completed') {
                        // Pick a mock asset matching this task
                        const assets = mockAssets[currentTask];
                        // Select one based on seed or randomly
                        const selectedAsset = assets[requestPayload.input.seed % assets.length] || assets[0];
                        resPayload.jobs[0].results.raw.url = selectedAsset.url;
                        activeGeneration.mediaUrl = selectedAsset.url;
                        activeGeneration.prompt = prompt;
                        activeGeneration.model = requestPayload.model;
                        activeGeneration.task = currentTask;
                    }
                    inspectorResJson.textContent = JSON.stringify(resPayload, null, 2);
                }

                // If completed, finish execution
                if (currentStatus === 'completed') {
                    clearInterval(mockTimer);
                    addLog(`[INFO] 계산 유닛 사용량: ${responses.completed.jobs[0].results.raw.credits_consumed} 크레딧 소모.`, 'info');
                    finishGeneration(true, activeGeneration.mediaUrl);
                }
            }
        }, 100);
    }

    // --- Real API Integration Executor ---
    async function runRealGeneration(prompt, requestPayload) {
        activeGeneration = { mode: 'real' };
        
        const keyId = inputKeyId.value.trim();
        const keySecret = inputKeySecret.value.trim();
        const proxyUrl = inputProxyUrl.value.trim();

        if (!keyId || !keySecret) {
            showToast('실제 API 연동 모드에서는 Key ID와 Key Secret이 필수적입니다.', 'danger');
            resetMonitor();
            activeGeneration = null;
            return;
        }

        addLog(`[INFO] Higgsfield API 실시간 요청 준비 중...`);
        
        // Target endpoint
        const targetUrl = `https://platform.higgsfield.ai/v2/requests`;
        const fetchUrl = proxyUrl ? proxyUrl + targetUrl : targetUrl;
        
        addLog(`[INFO] HTTP POST 요청 발송 중: ${targetUrl}`);
        
        try {
            const response = await fetch(fetchUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${keyId}:${keySecret}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'higgsfield-server-js/2.0'
                },
                body: JSON.stringify(requestPayload)
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`API Error (${response.status}): ${errText}`);
            }

            const data = await response.json();
            inspectorResJson.textContent = JSON.stringify(data, null, 2);
            
            const requestId = data.request_id || data.id;
            if (!requestId) {
                throw new Error('요청에 성공했으나 Request ID가 반환되지 않았습니다.');
            }
            
            monitorRequestId.textContent = requestId;
            addLog(`[SUCCESS] 요청 수락 완료. Request ID: ${requestId}`, 'success');
            
            // Start Polling
            startRealPolling(requestId, keyId, keySecret, proxyUrl);

        } catch (error) {
            addLog(`[ERROR] 요청 전송 오류: ${error.message}`, 'error');
            addLog(`[TIP] 브라우저에서 직접 API 호출로 인한 CORS 제한일 수 있습니다. CORS 프록시 설정을 확인하거나 모의 시뮬레이션(Mock) 모드를 테스트해보세요.`, 'info');
            showToast('API 요청 중 에러가 발생했습니다. 로그 콘솔을 확인해주세요.', 'danger');
            finishGeneration(false);
        }
    }

    function startRealPolling(requestId, keyId, keySecret, proxyUrl) {
        let elapsed = 0;
        const startTime = Date.now();
        const pollInterval = 3000; // Poll every 3s
        
        const targetStatusUrl = `https://platform.higgsfield.ai/v2/requests/${requestId}/status`;
        const fetchStatusUrl = proxyUrl ? proxyUrl + targetStatusUrl : targetStatusUrl;

        addLog(`[POLLING] 실시간 상태 폴링 시작: 3초 간격 호출`, 'polling');

        const pollTimer = setInterval(async () => {
            elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            monitorTimeElapsed.textContent = elapsed + 's';
            
            try {
                const response = await fetch(fetchStatusUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Key ${keyId}:${keySecret}`,
                        'User-Agent': 'higgsfield-server-js/2.0'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Polling Error: HTTP ${response.status}`);
                }

                const data = await response.json();
                inspectorResJson.textContent = JSON.stringify(data, null, 2);
                
                const status = data.status; // 'queued', 'in_progress', 'completed', 'failed', 'nsfw'
                const progressRatio = data.progress_ratio || 0;
                const percentage = Math.round(progressRatio * 100);

                setMonitorState(status, percentage || getStatusDefaultPercentage(status), getStatusText(status, percentage));
                addLog(`[POLLING] API Response Status: '${status}' (진행도: ${percentage}%)`, 'polling');

                if (status === 'completed') {
                    clearInterval(pollTimer);
                    // Fetch full request details to get the final media URL
                    const detailUrl = `https://platform.higgsfield.ai/v2/requests/${requestId}`;
                    const fetchDetailUrl = proxyUrl ? proxyUrl + detailUrl : detailUrl;
                    
                    addLog(`[INFO] 완료 데이터 가져오는 중: ${detailUrl}`);
                    
                    const detailRes = await fetch(fetchDetailUrl, {
                        headers: {
                            'Authorization': `Key ${keyId}:${keySecret}`,
                            'User-Agent': 'higgsfield-server-js/2.0'
                        }
                    });
                    
                    const detailData = await detailRes.json();
                    const mediaUrl = detailData.jobs?.[0]?.results?.raw?.url;

                    if (mediaUrl) {
                        activeGeneration.mediaUrl = mediaUrl;
                        activeGeneration.prompt = promptInput.value.trim();
                        activeGeneration.model = getSelectedModel();
                        activeGeneration.task = currentTask;
                        finishGeneration(true, mediaUrl);
                    } else {
                        throw new Error('결과 미디어 URL을 찾을 수 없습니다.');
                    }
                } else if (status === 'failed' || status === 'nsfw') {
                    clearInterval(pollTimer);
                    const errorReason = data.error_message || '정책 위반 또는 시스템 오류';
                    addLog(`[ERROR] 생성 실패 사유: ${errorReason}`, 'error');
                    finishGeneration(false);
                }

            } catch (error) {
                addLog(`[ERROR] 폴링 상태 업데이트 실패: ${error.message}`, 'error');
                // Don't stop immediately on single error, but if too many occur, user can reset
            }
        }, pollInterval);

        activeGeneration.timer = pollTimer;
    }

    function getStatusDefaultPercentage(status) {
        if (status === 'queued') return 5;
        if (status === 'in_progress') return 45;
        if (status === 'completed') return 100;
        return 0;
    }

    function getStatusText(status, percent) {
        switch (status) {
            case 'queued': return `대기열 등록 중 (대기 순번 대기중)`;
            case 'in_progress': return `생성 렌더링 중 (${percent}%)`;
            case 'completed': return `완료! 결과 출력 준비`;
            case 'nsfw': return `오류: 안전성 필터 차단`;
            case 'failed': return `오류: 하드웨어 렌더링 실패`;
            default: return `진행 중...`;
        }
    }

    function setMonitorState(status, percentage, text) {
        monitorBadge.className = `badge-status ${status === 'in_progress' ? 'progress' : status}`;
        monitorBadge.textContent = status.replace('_', ' ');
        
        monitorStatusText.textContent = text;
        monitorPercentageText.textContent = percentage + '%';
        monitorProgressBar.style.width = percentage + '%';
    }

    // --- Generation Finish and Media Rendering ---
    function finishGeneration(success, mediaUrl = '') {
        activeGeneration = null;
        
        if (success && mediaUrl) {
            resultPlaceholder.style.display = 'none';
            resultDisplay.style.display = 'flex';
            
            if (currentTask === 'text-to-image') {
                const img = document.createElement('img');
                img.src = mediaUrl;
                img.alt = 'Generated Image';
                img.onerror = () => {
                    addLog(`[ERROR] 이미지 로드 실패: ${mediaUrl}`, 'error');
                    resultDisplay.innerHTML = `
                        <div style="padding: 20px; text-align: center; color: var(--text-secondary);">
                            <i class="fa-solid fa-circle-exclamation" style="font-size: 2rem; color: var(--color-accent); margin-bottom: 10px;"></i>
                            <p style="font-size: 0.85rem; margin-bottom: 12px;">네트워크 차단 또는 보안 정책으로 이미지를 로드할 수 없습니다.</p>
                            <a href="${mediaUrl}" target="_blank" class="btn-primary" style="display: inline-block; padding: 8px 16px; font-size: 0.8rem; text-decoration: none; border-radius: 8px; color: white;">
                                <i class="fa-solid fa-up-right-from-square"></i> 새 창에서 이미지 열기
                            </a>
                        </div>
                    `;
                };
                resultDisplay.appendChild(img);
            } else {
                const video = document.createElement('video');
                video.src = mediaUrl;
                video.controls = true;
                video.autoplay = true;
                video.loop = true;
                video.style.width = '100%';
                video.onerror = () => {
                    addLog(`[ERROR] 비디오 로드 실패: ${mediaUrl}`, 'error');
                    resultDisplay.innerHTML = `
                        <div style="padding: 20px; text-align: center; color: var(--text-secondary);">
                            <i class="fa-solid fa-circle-exclamation" style="font-size: 2rem; color: var(--color-accent); margin-bottom: 10px;"></i>
                            <p style="font-size: 0.85rem; margin-bottom: 12px;">네트워크 환경 또는 브라우저 보안 정책(CORS/임베드 차단)으로 인해 비디오를 재생할 수 없습니다.</p>
                            <a href="${mediaUrl}" target="_blank" class="btn-primary" style="display: inline-block; padding: 8px 16px; font-size: 0.8rem; text-decoration: none; border-radius: 8px; color: white;">
                                <i class="fa-solid fa-up-right-from-square"></i> 새 창에서 비디오 열기
                            </a>
                        </div>
                    `;
                };
                resultDisplay.appendChild(video);
            }

            btnSaveGallery.style.display = 'inline-flex';
            btnSaveGallery.onclick = () => saveCurrentToGallery(mediaUrl);
            
            showToast('미디어 생성이 성공적으로 완료되었습니다!', 'success');
        } else {
            resultPlaceholder.innerHTML = `
                <i class="fa-solid fa-circle-exclamation placeholder-icon" style="color: var(--color-accent);"></i>
                <p>미디어 생성에 실패했습니다. 좌측 모니터의 콘솔 로그를 확인해보세요.</p>
            `;
            showToast('생성에 실패했습니다.', 'danger');
        }
    }

    function resetMonitor() {
        monitorPlaceholder.style.display = 'flex';
        monitorContent.style.display = 'none';
        btnSaveGallery.style.display = 'none';
        
        if (mockTimer) clearInterval(mockTimer);
    }

    // --- Gallery Storage System ---
    function saveCurrentToGallery(mediaUrl) {
        const promptText = promptInput.value.trim();
        const model = getSelectedModel();
        
        const gallery = JSON.parse(localStorage.getItem('hf_gallery') || '[]');
        
        // Prevent duplicate saves
        if (gallery.some(item => item.mediaUrl === mediaUrl)) {
            showToast('이미 갤러리에 저장된 미디어입니다.', 'info');
            return;
        }

        const newItem = {
            id: 'gal_' + Date.now(),
            task: currentTask,
            prompt: promptText,
            model: model,
            mediaUrl: mediaUrl,
            date: new Date().toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        gallery.unshift(newItem);
        localStorage.setItem('hf_gallery', JSON.stringify(gallery));
        showToast('결과물이 로컬 갤러리에 추가되었습니다.', 'success');
        btnSaveGallery.style.display = 'none'; // Hide after saving
    }

    function renderGallery(filterType = 'all') {
        galleryGrid.innerHTML = '';
        const gallery = JSON.parse(localStorage.getItem('hf_gallery') || '[]');
        
        const filtered = gallery.filter(item => {
            if (filterType === 'all') return true;
            if (filterType === 'image') return item.task === 'text-to-image';
            if (filterType === 'video') return item.task !== 'text-to-image';
            return true;
        });

        if (filtered.length === 0) {
            galleryGrid.style.display = 'none';
            galleryEmptyState.style.display = 'flex';
            return;
        }

        galleryGrid.style.display = 'grid';
        galleryEmptyState.style.display = 'none';

        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = 'gallery-card';

            const mediaWrapper = document.createElement('div');
            mediaWrapper.className = 'gallery-media-wrapper';

            const isImage = item.task === 'text-to-image';
            
            if (isImage) {
                const img = document.createElement('img');
                img.src = item.mediaUrl;
                img.alt = item.prompt;
                img.loading = 'lazy';
                mediaWrapper.appendChild(img);
                
                const badge = document.createElement('div');
                badge.className = 'gallery-media-type';
                badge.innerHTML = '<i class="fa-solid fa-image"></i>';
                mediaWrapper.appendChild(badge);
            } else {
                const video = document.createElement('video');
                video.src = item.mediaUrl;
                video.muted = true;
                video.loop = true;
                video.preload = 'metadata';
                
                // Simple play on hover
                mediaWrapper.addEventListener('mouseenter', () => video.play().catch(()=>{}));
                mediaWrapper.addEventListener('mouseleave', () => {
                    video.pause();
                    video.currentTime = 0;
                });
                
                mediaWrapper.appendChild(video);

                const badge = document.createElement('div');
                badge.className = 'gallery-media-type';
                badge.innerHTML = '<i class="fa-solid fa-video"></i>';
                mediaWrapper.appendChild(badge);
            }

            const cardContent = document.createElement('div');
            cardContent.className = 'gallery-card-content';

            const promptText = document.createElement('p');
            promptText.className = 'gallery-card-prompt';
            promptText.textContent = item.prompt;
            promptText.title = item.prompt;
            
            const cardMeta = document.createElement('div');
            cardMeta.className = 'gallery-card-meta';
            
            const dateSpan = document.createElement('span');
            dateSpan.textContent = item.date;

            const actionsDiv = document.createElement('div');
            actionsDiv.style.display = 'flex';
            actionsDiv.style.gap = '10px';

            // Download
            const dlBtn = document.createElement('button');
            dlBtn.className = 'btn-gallery-card-action';
            dlBtn.title = '다운로드';
            dlBtn.innerHTML = '<i class="fa-solid fa-download"></i>';
            dlBtn.onclick = () => {
                const a = document.createElement('a');
                a.href = item.mediaUrl;
                a.download = `higgsfield_${item.task}_${Date.now()}`;
                a.target = '_blank';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            };

            // Delete
            const delBtn = document.createElement('button');
            delBtn.className = 'btn-gallery-card-action';
            delBtn.title = '삭제';
            delBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
            delBtn.onclick = () => {
                deleteGalleryItem(item.id);
            };

            actionsDiv.appendChild(dlBtn);
            actionsDiv.appendChild(delBtn);
            
            cardMeta.appendChild(dateSpan);
            cardMeta.appendChild(actionsDiv);
            
            cardContent.appendChild(promptText);
            cardContent.appendChild(cardMeta);
            
            card.appendChild(mediaWrapper);
            card.appendChild(cardContent);
            
            galleryGrid.appendChild(card);
        });
    }

    function deleteGalleryItem(id) {
        if (confirm('이 결과물을 갤러리에서 삭제하시겠습니까?')) {
            let gallery = JSON.parse(localStorage.getItem('hf_gallery') || '[]');
            gallery = gallery.filter(item => item.id !== id);
            localStorage.setItem('hf_gallery', JSON.stringify(gallery));
            showToast('항목이 삭제되었습니다.', 'info');
            renderGallery(document.querySelector('.btn-filter.active').dataset.filter);
        }
    }

    // Filter Buttons
    galleryFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            galleryFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderGallery(btn.dataset.filter);
        });
    });

    // Clear All
    btnClearGallery.addEventListener('click', () => {
        const gallery = JSON.parse(localStorage.getItem('hf_gallery') || '[]');
        if (gallery.length === 0) return;
        
        if (confirm('정말로 모든 갤러리 내역을 영구히 삭제하시겠습니까?')) {
            localStorage.removeItem('hf_gallery');
            showToast('모든 갤러리 내역이 초기화되었습니다.', 'info');
            renderGallery();
        }
    });

    // --- Toast Notification System ---
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let iconClass = 'fa-info-circle';
        if (type === 'success') iconClass = 'fa-check-circle';
        if (type === 'danger') iconClass = 'fa-times-circle';
        if (type === 'warning') iconClass = 'fa-exclamation-triangle';

        toast.innerHTML = `
            <div class="toast-content">
                <i class="fa-solid ${iconClass}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close"><i class="fa-solid fa-xmark"></i></button>
        `;

        const container = document.getElementById('toast-container');
        container.appendChild(toast);
        
        // Show
        setTimeout(() => toast.classList.add('show'), 10);

        // Close button click
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        });

        // Auto close
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 400);
            }
        }, 4000);
    }
});
