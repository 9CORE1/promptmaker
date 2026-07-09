document.addEventListener('DOMContentLoaded', () => {
    // --- Application State ---
    let selectedMode = 'video'; // 'video' or 'image'
    let selectedPurpose = 'product'; // 'product', 'cinematic', 'vlog' / 'thumbnail_poster', 'sns_marketing', 'brand_keyvisual'
    let currentStep = 1;
    let totalSteps = 10; // 10 for video, 8 for image

    let videoFormData = {};
    let imageFormData = {};
    let formData = videoFormData; // Reference pointing to active mode's form data

    // Configurations loaded from configs.js
    let currentConfigs = window.purposeConfigs;

    // Elements DOM References
    const dynamicStepsNav = document.getElementById('dynamic-steps-nav');
    const dynamicFormContainer = document.getElementById('dynamic-form-container');
    const progressBar = document.getElementById('progress-bar');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const currentStepIndicator = document.getElementById('current-step-indicator');
    const totalStepsIndicator = document.getElementById('total-steps-indicator');
    const previewContent = document.getElementById('prompt-preview-content');
    const finalOutputTextarea = document.getElementById('final-output-textarea');
    const toastContainer = document.getElementById('toast-container');
    const presetSelect = document.getElementById('preset-select');
    const artistStyleSelect = document.getElementById('artist-style-select');
    const selectedArtistStyleBox = document.getElementById('selected-artist-style-box');
    const artistStyleImg = document.getElementById('artist-style-img');
    const artistStyleName = document.getElementById('artist-style-name');
    const btnClearArtistStyle = document.getElementById('btn-clear-artist-style');

    // 촬영/구도/오디오/라이팅 전문 용어 툴팁 사전 (방송, 홍보, 마케팅 실무 관점)
    const tooltipDictionary = {
        'wide-angle': '광각 렌즈(24~35mm): 넓은 화각으로 역동적인 시야를 주며, 모델의 손짓 연출 등을 액티브하게 묘사하는 촬영 기법입니다.',
        '50mm': '표준 렌즈(35~50mm): 사람 실제 눈의 원근감과 가장 유사하여 왜곡이 없고, 브랜드 제품 및 모델을 정갈하고 신뢰감 있게 포착합니다.',
        '85mm': '망원 렌즈(85mm): 배경을 아름답게 흐리고 인물(출연자)의 상반신과 이목구비에만 강한 임팩트를 주는 하이엔드 뷰티 포트레이트 전용 렌즈입니다.',
        'shallow depth': '얕은 심도(아웃포커싱): 주인공 모델에 초점을 선명하게 맞추고 주변 배경을 부드러운 빛망울(보케)로 흐려 시선을 강하게 집중시킵니다.',
        'bokeh': '보케(빛망울): 렌즈의 초점이 맞지 않는 배경의 빛들이 예쁘고 둥글게 번지는 효과로, 감성적이고 세련된 이미지를 만들어냅니다.',
        'deep depth': '깊은 심도(팬포커싱): 화면 전면부터 깊은 배경 속 오브젝트까지 모든 사물을 아주 또렷하게 잡아내어, 광고 정보를 가장 확실하게 제공합니다.',
        'all sharp': '팬포커스(모두 선명함): 모든 피사체를 뭉개짐 없이 선명하게 유지하여 구조적 균형감과 정밀함을 돋보이게 합니다.',
        '여백': '네거티브 스페이스(여백): 광고 헤드카피, 브랜드 타이틀 로고가 배치될 빈 공간을 미리 확보하여 레이아웃의 답답함을 해소합니다.',
        'negative space': '네거티브 스페이스(여백): 광고 헤드카피, 브랜드 타이틀 로고가 배치될 빈 공간을 미리 확보하여 레이아웃의 답답함을 해소합니다.',
        'Centered': '중앙 배치 구도: 주인공 피사체를 정중앙에 위치시켜 가장 직관적인 시각적 타격감과 구조적인 안정성을 줍니다.',
        '하이 앵글': '부감(하이 앵글): 위에서 내려다보는 앵글로 차트나 레이아웃을 입체적으로 조망하고, 마케팅 그래픽의 공간감과 정보를 세련되게 전달합니다.',
        '슬로우모션': '슬로우 모션: 움직임을 느리게 묘사하여 제품의 고급스러운 액체 제형 흐름이나 모델의 우아한 표정/동작을 극대화합니다.',
        'slow motion': '슬로우 모션: 움직임을 느리게 묘사하여 제품의 고급스러운 액체 제형 흐름이나 모델의 우아한 표정/동작을 극대화합니다.',
        '매크로': '매크로(초근접): 피사체에 카메라 렌즈를 밀착시켜 물방울, 피부결, 제품 캡 등을 아주 웅장하고 미세하게 확대 촬영하는 기법입니다.',
        'macro': '매크로(초근접): 피사체에 카메라 렌즈를 밀착시켜 물방울, 피부결, 제품 캡 등을 아주 웅장하고 미세하게 확대 촬영하는 기법입니다.',
        'dolly': '달리(Dolly) 워킹: 카메라를 바퀴 달린 레일이나 이동차에 얹어 피사체로 접근하거나 멀어지며 드라마틱한 전율을 포착하는 기법입니다.',
        'tracking': '트래킹(Tracking): 달리기, 걷기 등 움직이는 모델의 이동 경로와 동일한 속도로 카메라가 동행하며 역동적인 액션을 담아내는 기법입니다.',
        'ASMR': 'ASMR: 속삭이는 보이스, 손끝 탭핑 등 미세한 소리를 고음질로 녹음하여 소비자에게 높은 청각적 쾌감과 안정감을 주는 마케팅 오디오 기법입니다.',
        'asmr': 'ASMR: 속삭이는 보이스, 손끝 탭핑 등 미세한 소리를 고음질로 녹음하여 소비자에게 높은 청각적 쾌감과 안정감을 주는 마케팅 오디오 기법입니다.',
        'Lo-fi': '로파이(Lo-Fi): 정돈되지 않은 따뜻한 잡음 사운드가 믹스된 감성적인 인디 음악 장르로, 일상 라이프스타일 컷의 아늑함을 배가시킵니다.',
        '로파이': '로파이(Lo-Fi): 정돈되지 않은 따뜻한 잡음 사운드가 믹스된 감성적인 인디 음악 장르로, 일상 라이프스타일 컷의 아늑함을 배가시킵니다.',
        '백라이트': '백라이트(역광): 피사체 등 뒤에서 화려한 빛을 투사하여 출연자의 어깨선과 머릿결 아웃라인을 빛나게 해 입체감을 극대화하는 인공 조명입니다.',
        'rim light': '림 라이트(엣지 조명): 피사체 가장자리에 하이라이트 빛 라인을 생성해 인물을 어두운 배경과 뚜렷하게 분리해 주는 상업 조명 테크닉입니다.',
        '소프트박스': '소프트박스 라이트: 빛을 하얗고 고르게 들이쳐 피부 주름이나 제품 패키지의 잡티를 최소화하고 화사하게 다듬어주는 광고 스튜디오 필수 조명입니다.'
    };

    function getTagTooltip(text) {
        for (const key in tooltipDictionary) {
            if (text.toLowerCase().includes(key.toLowerCase())) {
                return tooltipDictionary[key];
            }
        }
        return '';
    }

    /**
     * 1. Dynamic Rendering Engine
     * Renders step cards and navbar based on the selected mode & purpose configurations.
     */
    function renderApp() {
        const config = currentConfigs[selectedPurpose];
        
        // --- 1.1 Render Sidebar Step Items ---
        let stepsHtml = '';
        config.steps.forEach(step => {
            const isActive = step.num === currentStep ? 'active' : '';
            const isCompleted = checkStepCompletion(step.num) ? 'completed' : '';
            
            stepsHtml += `
                <li class="nav-item ${isActive} ${isCompleted}" data-step="${step.num}">
                    <span class="step-num">${String(step.num).padStart(2, '0')}</span>
                    <span class="step-title">${step.title}</span>
                </li>
            `;
        });
        
        // Add final assemble step dynamically based on totalSteps
        const isFinalActive = currentStep === totalSteps ? 'active' : '';
        stepsHtml += `
            <li class="nav-item ${isFinalActive}" data-step="${totalSteps}">
                <span class="step-num">${String(totalSteps).padStart(2, '0')}</span>
                <span class="step-title">최종 조립</span>
            </li>
        `;
        dynamicStepsNav.innerHTML = stepsHtml;

        // Re-bind click event to steps
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const targetStep = parseInt(item.getAttribute('data-step'));
                goToStep(targetStep);
            });
        });

        // --- 1.2 Render Form Cards (Steps 1 to totalSteps-1) ---
        dynamicFormContainer.innerHTML = '';
        const inputStepsCount = totalSteps - 1;
        
        for (let s = 1; s <= inputStepsCount; s++) {
            const stepConfig = config.steps[s - 1];
            const isStepActive = s === currentStep ? 'active' : '';
            
            let cardHtml = `
                <div class="step-card ${isStepActive}" id="step-card-${s}">
                    <div class="card-header">
                        <span class="badge">Step ${String(s).padStart(2, '0')}</span>
                        <h2>${stepConfig.badge}</h2>
                        ${s === 1 ? (selectedMode === 'video' ? '<p>영상의 가장 기본적인 조건 및 목적을 설정합니다. 필수 항목(*)을 입력해 주세요.</p>' : '<p>이미지의 가장 기본적인 조건 및 목적을 설정합니다. 필수 항목(*)을 입력해 주세요.</p>') : '<p>세부 설정을 진행해 주세요. 필수 항목(*) 이외의 선택사항은 입력하지 않을 경우 자동으로 "없음"으로 처리됩니다.</p>'}
                    </div>
                    <div class="card-body ${s === (selectedMode === 'video' ? 7 : 0) ? 'scrollable-card-body' : ''}">
            `;



            // Find all fields belonging to this step
            const fieldsInStep = Object.keys(config.fields).filter(id => config.fields[id].step === s);
            
            // Build form inputs
            fieldsInStep.forEach(id => {
                const f = config.fields[id];
                const value = formData[id] || '';
                const reqMark = f.required ? '<span class="required-mark">*</span>' : '';
                const placeholderText = f.required ? '내용을 입력하세요.' : "미입력 시 '없음'이 자동 적용됩니다.";
                
                const exampleText = (config.examples && config.examples[id]) ? config.examples[id] : '';
                const exampleGuideHtml = exampleText ? `<div class="field-example-guide"><i class="fa-solid fa-circle-info"></i> 예시: ${exampleText}</div>` : '';

                cardHtml += `
                    <div class="form-group">
                        <label for="${id}">${f.label}${reqMark}</label>
                        ${exampleGuideHtml}
                `;
                
                if (f.type === 'textarea') {
                    cardHtml += `
                        <textarea id="${id}" rows="3" placeholder="${placeholderText}" class="form-control animate-focus">${value}</textarea>
                    `;
                } else {
                    cardHtml += `
                        <input type="text" id="${id}" placeholder="${placeholderText}" value="${value}" class="form-control animate-focus">
                    `;
                }

                // Build tags list. Optional fields get '없음' at the beginning.
                const tagsList = f.tags ? [...f.tags] : [];
                if (!f.required) {
                    tagsList.unshift('없음');
                }

                if (tagsList.length > 0) {
                    cardHtml += `<div class="tags-suggest">`;
                    tagsList.forEach(tagText => {
                        // 비디오/이미지 전 영역 촬영 전문설명 툴팁 주입
                        const tooltipText = getTagTooltip(tagText);
                        const tooltipAttr = tooltipText ? ` data-tooltip="${tooltipText}"` : '';
                        cardHtml += `<span class="tag"${tooltipAttr} data-target="${id}">${tagText}</span>`;
                    });
                    cardHtml += `</div>`;
                }

                cardHtml += `</div>`;
            });

            cardHtml += `
                    </div>
                </div>
            `;
            
            dynamicFormContainer.insertAdjacentHTML('beforeend', cardHtml);
        }

        // Re-bind Inputs Change Listener
        Object.keys(config.fields).forEach(id => {
            const inputEl = document.getElementById(id);
            if (inputEl) {
                inputEl.addEventListener('input', (e) => {
                    formData[id] = e.target.value;
                    updatePreview();
                    updateStepCompletedState(id);
                });

                // Auto-append '초' for video length if only numbers are entered on blur
                if (id === 'step1-length' && selectedMode === 'video') {
                    inputEl.addEventListener('blur', (e) => {
                        const val = e.target.value.trim();
                        if (val && /^\d+$/.test(val)) {
                            const formattedVal = val + '초';
                            e.target.value = formattedVal;
                            formData[id] = formattedVal;
                            updatePreview();
                            updateStepCompletedState(id);
                        }
                    });
                }
            }
        });

        // Re-bind Suggestion Tags Click Listener (With Append functionality for Negatives)
        document.querySelectorAll('.tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const targetId = tag.getAttribute('data-target');
                const inputVal = tag.textContent;
                const inputEl = document.getElementById(targetId);
                if (inputEl) {
                    const isNegativeField = (targetId === 'step9-avoid-sfx' || targetId === 'step7-avoid-errors');
                    
                    if (isNegativeField) {
                        if (inputVal === '없음') {
                            inputEl.value = '없음';
                        } else {
                            let currentVal = inputEl.value.trim();
                            if (currentVal === '' || currentVal === '없음' || currentVal === "미입력 시 '없음'이 자동 적용됩니다.") {
                                inputEl.value = inputVal;
                            } else {
                                // 쉼표 기준 중복 체크
                                const items = currentVal.split(',').map(item => item.trim());
                                if (!items.includes(inputVal)) {
                                    inputEl.value = currentVal + ', ' + inputVal;
                                }
                            }
                        }
                    } else {
                        // 일반 필드는 기존 값 덮어쓰기
                        inputEl.value = inputVal;
                    }
                    
                    formData[targetId] = inputEl.value;
                    updatePreview();
                    updateStepCompletedState(targetId);
                    inputEl.focus();
                }
            });
        });



        // Sync Step UI visibility & progress
        updateProgress();
    }

    /**
     * Check if a step has all REQUIRED fields filled
     */
    function checkStepCompletion(stepNum) {
        const config = currentConfigs[selectedPurpose];
        const fieldsInStep = Object.keys(config.fields).filter(id => config.fields[id].step === stepNum);
        if (fieldsInStep.length === 0) return false;
        
        return fieldsInStep.every(id => {
            const f = config.fields[id];
            if (f.required) {
                return formData[id] && formData[id].trim() !== '';
            }
            return true; // Optional fields don't block
        });
    }

    /**
     * Update preset select dropdown options based on current selectedPurpose
     */
    function updatePresetSelectOptions() {
        if (!presetSelect) return;
        presetSelect.innerHTML = '<option value="">-- 프리셋을 선택하여 폼을 자동으로 채우기 --</option>';
        
        const presets = window.presetsConfig[selectedPurpose];
        if (presets && presets.length > 0) {
            presets.forEach((preset, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = preset.name;
                presetSelect.appendChild(option);
            });
            if (currentStep === 1) {
                document.getElementById('preset-selector-container').style.display = 'flex';
            } else {
                document.getElementById('preset-selector-container').style.display = 'none';
            }
        } else {
            document.getElementById('preset-selector-container').style.display = 'none';
        }
    }

    function updateStepCompletedState(fieldId) {
        const config = currentConfigs[selectedPurpose];
        const fieldMeta = config.fields[fieldId];
        if (!fieldMeta) return;

        const stepNum = fieldMeta.step;
        const isCompleted = checkStepCompletion(stepNum);

        const navItem = document.querySelector(`.nav-item[data-step="${stepNum}"]`);
        if (navItem) {
            if (isCompleted) {
                navItem.classList.add('completed');
            } else {
                navItem.classList.remove('completed');
            }
        }
    }

    /**
     * Render dynamic Purpose Selector Grid at the top of the form area
     */
    function renderPurposeSelector() {
        const purposeContainer = document.getElementById('purpose-selector-container');
        if (!purposeContainer) return;
        
        let html = `
            <label class="purpose-selector-label">
                <i class="fa-solid fa-layer-group"></i> 
                ${selectedMode === 'video' ? '영상 제작 목적 선택' : '이미지 제작 목적 선택'} (전체 템플릿 전환) 
                <span class="required-mark">*</span>
            </label>
            <div class="purpose-cards-grid">
                ${Object.keys(currentConfigs).map(key => {
                    const cfg = currentConfigs[key];
                    const isSelected = key === selectedPurpose ? 'selected' : '';
                    return `
                        <div class="purpose-select-card ${isSelected}" data-purpose="${key}">
                            <div class="purpose-card-icon">
                                <i class="fa-solid ${cfg.icon}"></i>
                            </div>
                            <div class="purpose-card-info">
                                <h4>${cfg.title}</h4>
                                <p>${cfg.desc}</p>
                            </div>
                            <div class="purpose-check"><i class="fa-solid fa-circle-check"></i></div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        purposeContainer.innerHTML = html;
        
        // Re-bind Purpose Cards Select Listener
        purposeContainer.querySelectorAll('.purpose-select-card').forEach(card => {
            card.addEventListener('click', () => {
                const newPurpose = card.getAttribute('data-purpose');
                if (newPurpose !== selectedPurpose) {
                    if (hasAnyInputData()) {
                        if (confirm('제작 목적을 변경하면 현재 작성 중인 프롬프트 내용이 모두 초기화됩니다. 계속하시겠습니까?')) {
                            switchPurpose(newPurpose);
                        }
                    } else {
                        switchPurpose(newPurpose);
                    }
                }
            });
        });
    }

    /**
     * Switch Video/Image Purpose configuration
     */
    function switchPurpose(newPurpose) {
        selectedPurpose = newPurpose;
        currentStep = 1;
        
        if (selectedArtistStyleBox) {
            selectedArtistStyleBox.style.display = 'none';
        }
        if (artistStyleSelect) {
            artistStyleSelect.value = '';
        }
        
        // Reset and rebuild formData keys
        if (selectedMode === 'video') {
            videoFormData = {};
            formData = videoFormData;
        } else {
            imageFormData = {};
            formData = imageFormData;
        }
        
        const config = currentConfigs[selectedPurpose];
        Object.keys(config.fields).forEach(id => {
            formData[id] = '';
        });

        // Re-render UI and updates
        renderApp();
        renderPurposeSelector();
        updatePreview();
        updatePresetSelectOptions();
        goToStep(1);
        const modeText = selectedMode === 'video' ? '영상' : '이미지';
        showToast(`${modeText} 제작 목적이 '${config.title}'(으)로 변경되었습니다.`, 'info');
    }

    /**
     * Check if user has typed anything in the fields
     */
    function hasAnyInputData() {
        return Object.values(formData).some(val => val && val.trim() !== '');
    }

    /**
     * Update navigation steps
     */
    function goToStep(step) {
        if (step < 1 || step > totalSteps) return;

        // 제작 목적, 프리셋, 작가스타일 선택바를 1단계에서만 표시
        const purposeContainer = document.getElementById('purpose-selector-container');
        const presetContainer = document.getElementById('preset-selector-container');
        const artistStyleContainer = document.getElementById('artist-style-selector-container');

        if (step === 1) {
            if (purposeContainer) purposeContainer.style.display = 'block';
            if (artistStyleContainer) artistStyleContainer.style.display = 'flex';
            
            const presets = window.presetsConfig[selectedPurpose];
            if (presetContainer) {
                if (presets && presets.length > 0) {
                    presetContainer.style.display = 'flex';
                } else {
                    presetContainer.style.display = 'none';
                }
            }
        } else {
            if (purposeContainer) purposeContainer.style.display = 'none';
            if (presetContainer) presetContainer.style.display = 'none';
            if (artistStyleContainer) artistStyleContainer.style.display = 'none';
        }

        // Automatically hide selected artist style box when leaving Step 1
        if (step !== 1) {
            if (selectedArtistStyleBox) {
                selectedArtistStyleBox.style.display = 'none';
            }
            if (artistStyleSelect) {
                artistStyleSelect.value = '';
            }
        }

        const config = currentConfigs[selectedPurpose];
        const inputStepsCount = totalSteps - 1;
        // Hide all input cards
        for (let s = 1; s <= inputStepsCount; s++) {
            const card = document.getElementById(`step-card-${s}`);
            if (card) card.classList.remove('active');
        }
        // Hide final card
        const finalCard = document.getElementById('step-card-final');
        if (finalCard) finalCard.classList.remove('active');

        // Set state
        currentStep = step;

        // Show active card
        if (currentStep === totalSteps) {
            if (finalCard) finalCard.classList.add('active');
            
            // Set final badge step dynamically
            const finalBadge = document.getElementById('final-badge');
            if (finalBadge) {
                finalBadge.textContent = `Step ${String(totalSteps).padStart(2, '0')}`;
            }

            assembleFinalPrompt();
        } else {
            const activeCard = document.getElementById(`step-card-${currentStep}`);
            if (activeCard) activeCard.classList.add('active');
        }

        // Update active class in sidebar nav list
        document.querySelectorAll('.nav-item').forEach(item => {
            const itemStep = parseInt(item.getAttribute('data-step'));
            if (itemStep === currentStep) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Control Prev/Next Buttons states
        btnPrev.disabled = (currentStep === 1);
        
        if (currentStep === totalSteps - 1) {
            btnNext.innerHTML = `완료 및 조립 <i class="fa-solid fa-wand-magic"></i>`;
            btnNext.style.display = 'inline-flex';
        } else if (currentStep === totalSteps) {
            btnNext.style.display = 'none'; // Hide next button on the final step
        } else {
            btnNext.innerHTML = `다음 <i class="fa-solid fa-chevron-right"></i>`;
            btnNext.style.display = 'inline-flex';
        }

        updateProgress();
        // Auto-scroll preview to the current step's section
        setTimeout(() => {
            scrollToActiveSection(step);
        }, 100);
    }

    /**
     * Check validation of all steps and return true if everything required is filled
     */
    function handleValidationAndAlert() {
        const config = currentConfigs[selectedPurpose];
        const inputStepsCount = totalSteps - 1;
        let invalidSteps = [];

        for (let s = 1; s <= inputStepsCount; s++) {
            if (!checkStepCompletion(s)) {
                invalidSteps.push(s);
            }
        }

        if (invalidSteps.length > 0) {
            const firstInvalid = invalidSteps[0];
            const invalidTitles = invalidSteps.map(s => `${s}단계(${config.steps[s-1].title})`).join(', ');
            showToast(`미입력된 필수 항목이 있습니다. (${invalidTitles})`, 'error');
            goToStep(firstInvalid);
            return false;
        }

        return true;
    }

    // Bind footer nav buttons events
    btnNext.addEventListener('click', () => {
        if (currentStep < totalSteps) {
            if (currentStep === totalSteps - 1) {
                if (handleValidationAndAlert()) {
                    goToStep(totalSteps);
                }
            } else {
                goToStep(currentStep + 1);
            }
        } else {
            if (handleValidationAndAlert()) {
                showToast('모든 필수 입력값이 검증되었으며 프롬프트가 조립되었습니다.', 'success');
            }
        }
    });

    btnPrev.addEventListener('click', () => {
        if (currentStep > 1) {
            goToStep(currentStep - 1);
        }
    });

    /**
     * Progress indicators
     */
    function updateProgress() {
        const percent = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressBar.style.width = `${percent}%`;
        currentStepIndicator.textContent = currentStep;
        totalStepsIndicator.textContent = totalSteps;
    }

    /**
     * Assemble final raw text prompt
     */
    /**
     * Translate text to English using Google Translate API
     */
    async function translateToEnglish(text) {
        try {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl=en&dt=t&q=${encodeURIComponent(text)}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Translation API response error');
            const data = await response.json();
            if (data && data[0]) {
                return data[0].map(x => x[0]).join('');
            }
            throw new Error('Invalid translation data');
        } catch (err) {
            console.error('Translation failed:', err);
            return null;
        }
    }

    /**
     * Assemble final raw text prompt
     */
    async function assembleFinalPrompt() {
        const config = currentConfigs[selectedPurpose];
        let result = config.template;
        
        // 1. Create a local copy of formData to perform harmonization
        const data = { ...formData };
        
        // --- Smart Harmonization Rules ---
        
        // Rule A: Detect if "No Person" (Product Only / 인물 없음) is selected
        const genderVal = data['step2-gender'] || '';
        const isProductOnly = genderVal.includes('인물 없음') || genderVal.includes('제품 전용') || genderVal.includes('인물 없이') || (selectedMode === 'video' && selectedPurpose === 'product' && genderVal.includes('인물 없음'));
        
        // Rule B: Harmonize Lighting & Time of Day
        const timeKey = Object.keys(data).find(k => k.endsWith('-time'));
        const lightingKey = Object.keys(data).find(k => k.endsWith('-lighting'));
        
        if (timeKey && lightingKey) {
            const timeVal = (data[timeKey] || '').trim();
            const lightingVal = (data[lightingKey] || '').trim();

            // If time is night but lighting is sun/daylight
            if ((timeVal.includes('밤') || timeVal.includes('야간') || timeVal.includes('새벽') || timeVal.includes('어둠')) && 
                (lightingVal.includes('햇살') || lightingVal.includes('자연광') || lightingVal.includes('태양광') || lightingVal.includes('주광'))) {
                data[lightingKey] = '은은하게 비치는 달빛과 밤거리를 차분히 비추는 야간 포인트 조명';
            }

            // If time is daytime but lighting is neon/night artificial
            if ((timeVal.includes('아침') || timeVal.includes('낮') || timeVal.includes('정오') || timeVal.includes('대낮')) && 
                (lightingVal.includes('야간 스튜디오') || lightingVal.includes('네온') || lightingVal.includes('어두운'))) {
                data[timeKey] = '네온 사인과 화려한 조명들이 은은하게 펼쳐지는 도심 밤 시간대';
            }
        }

        // Rule C: Audio & Dialogue harmony (Video mode only)
        if (selectedMode === 'video') {
            const dialogueKey = Object.keys(data).find(k => k.endsWith('-dialogue'));
            const narrationKey = Object.keys(data).find(k => k.endsWith('-narration'));
            if (dialogueKey && narrationKey) {
                const dialogueVal = (data[dialogueKey] || '').trim();
                if (dialogueVal.includes('대사 전혀 없음') || dialogueVal.includes('무성') || dialogueVal.includes('없음')) {
                    data[narrationKey] = '내레이션 없음';
                }
            }
        }
        
        // 2. Perform variable replacement
        Object.keys(config.fields).forEach(id => {
            const f = config.fields[id];
            const hasVal = data[id] && data[id].trim() !== '';
            
            let value;
            if (hasVal) {
                value = data[id].trim();
                // Auto-append '초' for length if it's only numbers (video mode only)
                if (id === 'step1-length' && /^\d+$/.test(value) && selectedMode === 'video') {
                    value += '초';
                }
            } else if (f.required) {
                value = `[필수입력: ${f.label} 미입력]`;
            } else {
                value = '없음';
            }
            
            result = result.replace(new RegExp(escapeRegExp(f.token), 'g'), value);
        });

        // 3. Post-Process the Assembled Text Prompt to resolve conflicts
        
        // If Product Only (인물 없음) is active, completely strip out Model/Clothing sections
        if (isProductOnly) {
            if (selectedMode === 'video') {
                // Strip out from [주요 인물] to next section [제품] or [소품] or [대상]
                result = result.replace(/\[주요 인물\][\s\S]*?(\[(제품|소품|대상).*?\])/, '$1');
            } else {
                // Strip out from [주요 피사체] to [배경 & 상황]
                result = result.replace(/\[주요 피사체\][\s\S]*?(\[배경 & 상황\])/, '$1');
            }
        }
        
        // Clean up awkward optional sentence remnants containing "없음"
        result = result
            .replace(/[가-힣a-zA-Z0-9\s]*없음은 피한다\.?/g, '')
            .replace(/[가-힣a-zA-Z0-9\s]*없음은 배제한다\.?/g, '')
            .replace(/[가-힣a-zA-Z0-9\s]*없음본을 유지한다\.?/g, '')
            .replace(/영상 전체 동안 없음을 유지한다\.?/g, '')
            .replace(/피해야 할 의상 요소는 없음은 피한다\.?/g, '')
            .replace(/피해야 할 의상 요소는 피한다\.?/g, '')
            .replace(/없음이 배치되어 있으며,?/g, '')
            .replace(/인테리어는 없음이다\.?/g, '')
            .replace(/겉옷은 없음,?/g, '')
            .replace(/액세서리는 없음,?/g, '')
            .replace(/겉옷은 없음, 액세서리는 없음/g, '')
            .replace(/없음, 없음\./g, '')
            .replace(/없음, 없음/g, '')
            .replace(/,\s*,/g, ',')
            .replace(/,\s*\./g, '.')
            .replace(/\.\s*\./g, '.')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
        
        // Show loading state while translating
        finalOutputTextarea.value = "영문 프롬프트로 변환 중입니다 (Translating to English...)...";
        
        const englishPrompt = await translateToEnglish(result);
        if (englishPrompt) {
            finalOutputTextarea.value = englishPrompt;
        } else {
            finalOutputTextarea.value = result;
            showToast('영문 변환에 실패하여 국문 프롬프트로 출력합니다. 네트워크 연결을 확인해 주세요.', 'error');
        }
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Render live HTML preview on the right panel
     */
    function updatePreview() {
        const config = currentConfigs[selectedPurpose];
        let previewHtml = config.template;
        
        // Escape HTML
        previewHtml = previewHtml
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Format [Titles]
        previewHtml = previewHtml.replace(/(\[[^\]\n]+\])/g, '<span class="preview-section-header">$1</span>');

        // Swap variables with highlights
        Object.keys(config.fields).forEach(id => {
            const f = config.fields[id];
            const cleanTokenName = f.token.replace(/[{}]/g, '');
            const value = formData[id];
            const hasVal = value && value.trim() !== '';
            
            let replacedHtml;
            if (hasVal) {
                let cleanVal = value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                // Auto-append '초' for length if it's only numbers (video mode only)
                if (id === 'step1-length' && /^\d+$/.test(cleanVal.trim()) && selectedMode === 'video') {
                    cleanVal = cleanVal.trim() + '초';
                }
                replacedHtml = `<span class="highlight-token" title="${cleanTokenName}">${cleanVal}</span>`;
            } else if (f.required) {
                replacedHtml = `<span class="empty-token" style="color:var(--color-accent); border:1px dashed var(--color-accent); box-shadow: 0 0 5px rgba(239, 68, 68, 0.2);">{${cleanTokenName} (필수)}</span>`;
            } else {
                replacedHtml = `<span class="empty-token" style="opacity: 0.5;">없음</span>`;
            }
            
            previewHtml = previewHtml.replace(new RegExp(escapeRegExp(f.token), 'g'), replacedHtml);
        });

        previewContent.innerHTML = previewHtml;
    }

    /**
     * Scroll previewContent to the active step's section header
     */
    function scrollToActiveSection(stepNum) {
        // Define keywords to map step numbers to header text
        const stepKeywords = {
            1: ['기본', 'info'],
            2: ['인물', '피사체', 'subject', 'model'],
            3: ['의상', '배경', 'background', 'clothing'],
            4: ['제품', '소품', '화풍', 'style'],
            5: ['장소', '조명', 'lighting', 'place'],
            6: ['시각', '촬영', '구도', 'composition', 'camera'],
            7: ['타임라인', '금지', 'negative', 'goal'],
            8: ['오디오', 'audio'],
            9: ['금지', 'negative', 'goal']
        };

        const keywords = stepKeywords[stepNum];
        if (!keywords) return;

        const headers = previewContent.querySelectorAll('.preview-section-header');
        let targetHeader = null;

        for (const header of headers) {
            const text = header.textContent;
            const matches = keywords.some(kw => text.includes(kw));
            if (matches) {
                targetHeader = header;
                break;
            }
        }

        if (targetHeader) {
            const relativeTop = targetHeader.getBoundingClientRect().top - previewContent.getBoundingClientRect().top + previewContent.scrollTop - 25;
            previewContent.scrollTo({
                top: Math.max(0, relativeTop),
                behavior: 'smooth'
            });
        }
    }

    /**
     * Auto fill single current step examples
     */
    document.getElementById('btn-load-current-example').addEventListener('click', () => {
        const config = currentConfigs[selectedPurpose];
        const fields = Object.keys(config.fields).filter(id => config.fields[id].step === currentStep);
        
        if (fields.length === 0) {
            showToast('이 단계에는 채울 예시가 없습니다.', 'info');
            return;
        }

        fields.forEach(id => {
            if (config.examples[id]) {
                const inputEl = document.getElementById(id);
                if (inputEl) {
                    inputEl.value = config.examples[id];
                    formData[id] = config.examples[id];
                    updateStepCompletedState(id);
                }
            }
        });
        updatePreview();
        showToast(`${currentStep}단계의 예시 데이터가 입력되었습니다.`, 'success');
    });

    /**
     * Auto fill all steps examples
     */
    document.getElementById('btn-fill-all').addEventListener('click', () => {
        const config = currentConfigs[selectedPurpose];
        
        Object.keys(config.fields).forEach(id => {
            if (config.examples[id]) {
                const inputEl = document.getElementById(id);
                if (inputEl) {
                    inputEl.value = config.examples[id];
                    formData[id] = config.examples[id];
                    updateStepCompletedState(id);
                }
            }
        });
        
        updatePreview();
        if (currentStep === totalSteps) {
            assembleFinalPrompt();
        }
        showToast(`'${config.title}' 테마의 전체 예시가 성공적으로 채워졌습니다!`, 'success');
    });

    /**
     * Reset Form values
     */
    document.getElementById('btn-reset').addEventListener('click', () => {
        if (confirm('정말로 모든 입력을 지우고 초기화하시겠습니까?')) {
            const config = currentConfigs[selectedPurpose];
            Object.keys(config.fields).forEach(id => {
                const inputEl = document.getElementById(id);
                if (inputEl) {
                    inputEl.value = '';
                    formData[id] = '';
                }
                const navItem = document.querySelector(`.nav-item[data-step="${config.fields[id].step}"]`);
                if (navItem) navItem.classList.remove('completed');
            });
            
            if (selectedArtistStyleBox) {
                selectedArtistStyleBox.style.display = 'none';
            }
            if (presetSelect) presetSelect.value = '';
            if (artistStyleSelect) artistStyleSelect.value = '';
            
            updatePreview();
            if (currentStep === totalSteps) {
                assembleFinalPrompt();
            }
            goToStep(1);
            showToast('데이터가 성공적으로 초기화되었습니다.', 'info');
        }
    });

    /**
     * Copy final output to clipboard
     */
    document.getElementById('btn-copy-prompt').addEventListener('click', () => {
        if (!handleValidationAndAlert()) {
            return;
        }
        
        finalOutputTextarea.select();
        finalOutputTextarea.setSelectionRange(0, 99999);

        navigator.clipboard.writeText(finalOutputTextarea.value)
            .then(() => {
                showToast('최종 조립된 프롬프트가 클립보드에 성공적으로 복사되었습니다.', 'success');
            })
            .catch(err => {
                console.error('Copy failed: ', err);
                showToast('클립보드 복사에 실패했습니다. 텍스트 영역을 수동 복사하세요.', 'error');
            });
    });

    /**
     * Toast System
     */
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = 'fa-check-circle';
        if (type === 'error') {
            icon = 'fa-exclamation-circle';
        } else if (type === 'info') {
            icon = 'fa-info-circle';
        }

        toast.innerHTML = `
            <i class="fa-solid ${icon}"></i>
            <span>${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        toast.offsetHeight; // force reflow
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 3500);
    }

    /**
     * Theme Toggle System (Dark / Light)
     */
    const btnThemeToggle = document.getElementById('btn-theme-toggle');
    
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        if (btnThemeToggle) {
            btnThemeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }
    } else {
        document.body.classList.remove('light-mode');
        if (btnThemeToggle) {
            btnThemeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }
    }

    if (btnThemeToggle) {
        btnThemeToggle.addEventListener('click', () => {
            const isLightMode = document.body.classList.toggle('light-mode');
            if (isLightMode) {
                localStorage.setItem('theme', 'light');
                btnThemeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
                showToast('라이트 모드로 전환되었습니다.', 'info');
            } else {
                localStorage.setItem('theme', 'dark');
                btnThemeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
                showToast('다크 모드로 전환되었습니다.', 'info');
            }
        });
    }

    // Mode Switch Handler
    const btnModeVideo = document.getElementById('mode-video');
    const btnModeImage = document.getElementById('mode-image');
    const appTitle = document.getElementById('app-title');
    const appSubtitle = document.getElementById('app-subtitle');

    function switchMode(newMode) {
        if (selectedMode === newMode) return;

        // Check if there is input data and confirm before resetting
        if (hasAnyInputData()) {
            if (!confirm('제작 방식을 변경하면 현재 작성 중인 프롬프트 내용이 모두 초기화됩니다. 계속하시겠습니까?')) {
                return;
            }
        }

        selectedMode = newMode;

        // Toggle button active classes
        if (selectedMode === 'video') {
            if (btnModeVideo) btnModeVideo.classList.add('active');
            if (btnModeImage) btnModeImage.classList.remove('active');
            if (appTitle) appTitle.textContent = 'AI Video Prompt Generator';
            if (appSubtitle) appSubtitle.textContent = '영상의 목적에 맞게 단계별 세부 요소를 입력하여 고품질 AI 영상 프롬프트를 완성하세요.';
            
            // Switch configs and default purpose
            currentConfigs = window.purposeConfigs;
            selectedPurpose = 'product';
            totalSteps = 10;
            formData = videoFormData;
        } else {
            if (btnModeVideo) btnModeVideo.classList.remove('active');
            if (btnModeImage) btnModeImage.classList.add('active');
            if (appTitle) appTitle.textContent = 'AI Image Prompt Generator';
            if (appSubtitle) appSubtitle.textContent = '이미지의 목적에 맞게 단계별 세부 요소를 입력하여 고품질 AI 이미지 프롬프트를 완성하세요.';

            // Switch configs and default purpose
            currentConfigs = window.imageConfigs;
            selectedPurpose = 'thumbnail_poster';
            totalSteps = 8;
            formData = imageFormData;
        }

        // Reset and pre-initialize current mode's form values
        const config = currentConfigs[selectedPurpose];
        Object.keys(config.fields).forEach(id => {
            formData[id] = '';
        });

        // Reset step
        currentStep = 1;

        if (selectedArtistStyleBox) {
            selectedArtistStyleBox.style.display = 'none';
        }
        if (artistStyleSelect) {
            artistStyleSelect.value = '';
        }

        // Re-render UI
        renderApp();
        renderPurposeSelector();
        updatePreview();
        updatePresetSelectOptions();
        goToStep(1);

        showToast(`제작 방식이 '${selectedMode === 'video' ? '비디오' : '이미지'}'(으)로 전환되었습니다.`, 'info');
    }

    if (btnModeVideo && btnModeImage) {
        btnModeVideo.addEventListener('click', () => switchMode('video'));
        btnModeImage.addEventListener('click', () => switchMode('image'));
    }

    // Preset Selection Change Event
    if (presetSelect) {
        presetSelect.addEventListener('change', (e) => {
            const index = e.target.value;
            if (index === '') return;
            
            const presets = window.presetsConfig[selectedPurpose];
            const selectedPreset = presets[index];
            if (selectedPreset) {
                // Populate formData with preset fields
                Object.keys(selectedPreset.fields).forEach(id => {
                    formData[id] = selectedPreset.fields[id];
                });
                
                // Re-render UI inputs to match the new formData values
                const config = currentConfigs[selectedPurpose];
                Object.keys(config.fields).forEach(id => {
                    const value = formData[id];
                    const el = document.getElementById(id);
                    if (el) {
                        el.value = value;
                    }
                    
                    const fieldContainer = document.querySelector(`.form-group[data-field-id="${id}"]`);
                    if (fieldContainer) {
                        const tags = fieldContainer.querySelectorAll('.tag');
                        tags.forEach(tag => {
                            const tagText = tag.getAttribute('data-tag-val') || tag.textContent.trim();
                            if (tagText === value) {
                                tag.classList.add('selected');
                            } else {
                                tag.classList.remove('selected');
                            }
                        });
                    }
                });
                
                // Re-update all nav step completed checkmarks
                Object.keys(config.fields).forEach(id => {
                    updateStepCompletedState(id);
                });
                
                updatePreview();
                goToStep(currentStep); // Refresh current step cards UI
                
                showToast(`'${selectedPreset.name}' 프리셋이 성공적으로 불러와졌습니다.`, 'success');
            }
        });
    }

    // Artist Style Selection Change Event
    if (artistStyleSelect) {
        artistStyleSelect.addEventListener('change', (e) => {
            const index = e.target.value;
            if (index === '') return;
            
            const artists = window.artistStylesConfig;
            const selectedArtist = artists[index];
            if (selectedArtist) {
                // Determine the correct style field based on selectedMode (video uses step6-style, image uses step4-style-type)
                const styleFieldId = (selectedMode === 'video') ? 'step6-style' : 'step4-style-type';
                
                const fieldsToUpdate = {
                    'step1-genre': `${selectedArtist.name} 스타일`,
                    'step1-mood': selectedArtist.keywords,
                    [styleFieldId]: selectedArtist.safeExpression
                };
                
                // Apply to formData and DOM elements if present
                Object.keys(fieldsToUpdate).forEach(id => {
                    const val = fieldsToUpdate[id];
                    formData[id] = val;
                    
                    const inputEl = document.getElementById(id);
                    if (inputEl) {
                        inputEl.value = val;
                    }
                });
                
                // Update completion states for these steps
                Object.keys(fieldsToUpdate).forEach(id => {
                    updateStepCompletedState(id);
                });
                
                updatePreview();
                goToStep(currentStep); // Refresh current step cards UI
                
                // Update and show Selected Artist Style Box in Sidebar
                if (selectedArtistStyleBox && artistStyleImg && artistStyleName) {
                    const id = Number(index) + 1;
                    artistStyleImg.src = `images/artist_${id}.png`;
                    artistStyleName.textContent = selectedArtist.name;
                    selectedArtistStyleBox.style.display = 'flex';
                }
                
                showToast(`'${selectedArtist.name}' 작가스타일 레퍼런스가 적용되었습니다.`, 'success');
            }
        });
    }

    // Artist Style Clear Button Event
    if (btnClearArtistStyle) {
        btnClearArtistStyle.addEventListener('click', () => {
            if (selectedArtistStyleBox) {
                selectedArtistStyleBox.style.display = 'none';
            }
            if (artistStyleSelect) {
                artistStyleSelect.value = '';
            }
        });
    }

    function populateArtistStyleOptions() {
        if (!artistStyleSelect) return;
        artistStyleSelect.innerHTML = '<option value="">-- 작가스타일을 선택하여 스타일 관련 필드에 적용 --</option>';
        
        if (window.artistStylesConfig && window.artistStylesConfig.length > 0) {
            window.artistStylesConfig.forEach((artist, index) => {
                const option = document.createElement('option');
                option.value = index;
                // Show artist name and a short preview of keywords
                const shortKeyword = artist.keywords.split(',')[0];
                option.textContent = `${index + 1}. ${artist.name} (${shortKeyword} 등)`;
                artistStyleSelect.appendChild(option);
            });
        }
    }
    // --- First Application Boot ---
    // Pre-initialize empty values
    const initialConfig = currentConfigs[selectedPurpose];
    Object.keys(initialConfig.fields).forEach(id => {
        formData[id] = '';
    });
    
    renderApp();
    renderPurposeSelector();
    updatePreview();
    updatePresetSelectOptions();
    populateArtistStyleOptions();
});
