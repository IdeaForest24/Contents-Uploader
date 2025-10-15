// scripts/main.js

// 전역 변수
let currentTab = 'if24';
let uploadedFiles = {
    if24: null,
    creblack: null,
    dudu: null
};

// 웹훅 설정
let webhookSettings = {
    if24: '',
    creblack: '',
    dudu: ''
};

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadSettings();
    setupFileUploads();
    setupImagePreviewModal();
});

// 앱 초기화
function initializeApp() {
    console.log('AI 콘텐츠 업로더 초기화 시작');
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            switchTab(tabName);
        });
    });

    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeSettings();
            }
        });
    }

    console.log('앱 초기화 완료');
}

// 탭 전환 함수
function switchTab(tabName) {
    console.log(`탭 전환: ${tabName}`);
    
    const activeTabBtn = document.querySelector('.tab-btn.active');
    const activeTabContent = document.querySelector('.tab-content.active');
    
    if (activeTabBtn) activeTabBtn.classList.remove('active');
    if (activeTabContent) activeTabContent.classList.remove('active');
    
    const newTabBtn = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
    const newTabContent = document.getElementById(`${tabName}-tab`);
    
    if (newTabBtn) newTabBtn.classList.add('active');
    if (newTabContent) newTabContent.classList.add('active');
    
    currentTab = tabName;
    console.log(`현재 탭: ${currentTab}`);
}

// 탭 초기화 함수
function resetTab(tabName) {
    console.log(`탭 초기화: ${tabName}`);
    
    if (!confirm('현재 탭의 모든 내용을 초기화하시겠습니까?')) {
        return;
    }
    
    const contentTextarea = document.getElementById(`${tabName}-content`);
    if (contentTextarea) {
        contentTextarea.value = '';
    }
    
    removeFile(tabName);
    
    if (tabName === 'if24') {
        const checkboxes = ['instagram-check', 'threads-check', 'x-check'];
        checkboxes.forEach(checkboxId => {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.checked = false;
            }
        });
    }
    
    // ✅ 수정 2: CreBlack 플랫폼 선택 초기화 추가
    if (tabName === 'creblack') {
        const checkboxes = ['creblack-instagram-check', 'creblack-threads-check'];
        checkboxes.forEach(checkboxId => {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.checked = false;
            }
        });
    }
    
    const responseArea = document.getElementById(`${tabName}-response`);
    if (responseArea) {
        responseArea.innerHTML = '응답 결과가 여기에 표시됩니다...';
        responseArea.className = 'response-area';
    }
    
    showNotification(`${tabName.toUpperCase()} 탭이 초기화되었습니다.`, 'success');
}

// 설정 모달 열기
function openSettings() {
    console.log('설정 모달 열기');
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.add('show');
        
        const if24Input = document.getElementById('if24-webhook');
        const creblackInput = document.getElementById('creblack-webhook');
        const duduInput = document.getElementById('dudu-webhook');
        
        if (if24Input) if24Input.value = webhookSettings.if24 || '';
        if (creblackInput) creblackInput.value = webhookSettings.creblack || '';
        if (duduInput) duduInput.value = webhookSettings.dudu || '';
        
        console.log('설정 모달에 현재 값 로드:', webhookSettings);
    }
}

// 설정 모달 닫기
function closeSettings() {
    console.log('설정 모달 닫기');
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// ✅ 수정 1: Dudu 웹훅 저장 버그 수정
function saveSettings() {
    console.log('설정 저장 시작');
    
    const if24Input = document.getElementById('if24-webhook');
    const creblackInput = document.getElementById('creblack-webhook');
    const duduInput = document.getElementById('dudu-webhook');
    
    if (if24Input) webhookSettings.if24 = if24Input.value;
    if (creblackInput) webhookSettings.creblack = creblackInput.value;
    if (duduInput) webhookSettings.dudu = duduInput.value;  // ✅ 수정: 올바르게 저장
    
    try {
        localStorage.setItem('webhookSettings', JSON.stringify(webhookSettings));
        console.log('localStorage에 설정 저장 완료:', webhookSettings);
    } catch (error) {
        console.error('localStorage 저장 실패:', error);
    }
    
    console.log('설정 저장 완료:', webhookSettings);
    showNotification('설정이 저장되었습니다.', 'success');
    closeSettings();
}

// 설정 로드
function loadSettings() {
    console.log('설정 로드 시작');
    
    try {
        const savedSettings = localStorage.getItem('webhookSettings');
        if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            webhookSettings = { ...webhookSettings, ...parsedSettings };
            console.log('localStorage에서 설정 로드 완료:', webhookSettings);
        } else {
            console.log('저장된 설정이 없습니다.');
        }
    } catch (error) {
        console.error('localStorage 로드 실패:', error);
    }
    
    console.log('설정 로드 완료');
}

// 파일 업로드 설정
function setupFileUploads() {
    console.log('파일 업로드 설정 시작');
    
    ['if24', 'creblack', 'dudu'].forEach(tabName => {
        const uploadArea = document.getElementById(`${tabName}-upload`);
        const fileInput = document.getElementById(`${tabName}-file-input`);
        const fileList = document.getElementById(`${tabName}-file-list`);
        
        if (!uploadArea || !fileInput || !fileList) {
            console.warn(`${tabName} 업로드 요소를 찾을 수 없습니다.`);
            return;
        }
        
        uploadArea.addEventListener('click', (e) => {
            if (e.target.classList.contains('file-remove') || 
                e.target.classList.contains('preview-image')) {
                return;
            }
            fileInput.click();
        });
        
        fileInput.addEventListener('change', (e) => {
            handleFileSelect(e.target.files, tabName);
        });
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            handleFileSelect(e.dataTransfer.files, tabName);
        });
    });
    
    console.log('파일 업로드 설정 완료');
}

// 파일 선택 처리
function handleFileSelect(files, tabName) {
    console.log(`파일 선택 - 탭: ${tabName}, 파일 수: ${files.length}`);
    
    if (files.length === 0) return;
    
    const file = files[0];
    const fileList = document.getElementById(`${tabName}-file-list`);
    if (!fileList) return;
    
    if (!file.type.startsWith('image/')) {
        showNotification('이미지 파일만 업로드 가능합니다.', 'error');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        showNotification('파일 크기는 10MB 이하여야 합니다.', 'error');
        return;
    }
    
    uploadedFiles[tabName] = file;
    
    fileList.innerHTML = '';
    
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
        const imageUrl = e.target.result;
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <button class="file-remove" onclick="removeFile('${tabName}', event)">✕ 삭제</button>
            <div class="file-preview">
                <img src="${imageUrl}" 
                     alt="업로드된 이미지" 
                     class="preview-image" 
                     onclick="openImagePreview('${imageUrl}', event)"
                     style="cursor: pointer;"
                     title="클릭하여 크게 보기">
                <div class="file-info">
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${formatFileSize(file.size)}</span>
                </div>
            </div>
        `;
        
        fileList.appendChild(fileItem);
    };
    
    fileReader.readAsDataURL(file);
    
    console.log(`업로드된 파일 (${tabName}):`, file.name);
}

// 이미지 미리보기 모달 설정
function setupImagePreviewModal() {
    const modalHTML = `
        <div id="image-preview-modal" class="image-modal">
            <div class="image-modal-content">
                <button class="image-modal-close" onclick="closeImagePreview()">✕</button>
                <img id="image-preview-img" src="" alt="미리보기">
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = document.getElementById('image-preview-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeImagePreview();
            }
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeImagePreview();
        }
    });
}

// 이미지 미리보기 열기
function openImagePreview(imageUrl, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    const modal = document.getElementById('image-preview-modal');
    const img = document.getElementById('image-preview-img');
    
    if (modal && img) {
        img.src = imageUrl;
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

// 이미지 미리보기 닫기
function closeImagePreview() {
    const modal = document.getElementById('image-preview-modal');
    
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// 파일 제거
function removeFile(tabName, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    console.log(`파일 제거 - 탭: ${tabName}`);
    
    uploadedFiles[tabName] = null;
    
    const fileList = document.getElementById(`${tabName}-file-list`);
    if (fileList) {
        fileList.innerHTML = '';
    }
    
    const fileInput = document.getElementById(`${tabName}-file-input`);
    if (fileInput) {
        fileInput.value = '';
    }
}

// 파일 크기 포맷팅
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 알림 표시
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    switch(type) {
        case 'success':
            notification.style.backgroundColor = '#38a169';
            break;
        case 'error':
            notification.style.backgroundColor = '#e53e3e';
            break;
        case 'warning':
            notification.style.backgroundColor = '#d69e2e';
            break;
        default:
            notification.style.backgroundColor = '#3182ce';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);
}

// 공통 웹훅 응답 처리 함수
function parseWebhookResponse(response) {
    return response.text().then(text => {
        console.log('원본 응답 텍스트:', text);
        
        try {
            const parsed = JSON.parse(text);
            console.log('JSON 파싱 성공:', parsed);
            return parsed;
        } catch (e) {
            console.log('JSON 파싱 실패, 텍스트 분석 시작');
            
            if (text.includes('"status":"success"') || text.includes('success')) {
                console.log('텍스트에서 success 감지');
                return { 
                    status: 'success', 
                    message: text 
                };
            }
            
            console.log('에러로 처리');
            return { 
                status: 'error', 
                message: text || 'JSON 파싱 실패' 
            };
        }
    });
}

// 공통 전송 함수
function sendContent(tabName) {
    console.log(`콘텐츠 전송 시작 - 탭: ${tabName}`);
    
    const content = document.getElementById(`${tabName}-content`).value;
    const file = uploadedFiles[tabName];
    const responseArea = document.getElementById(`${tabName}-response`);
    const sendBtn = document.querySelector(`#${tabName}-tab .send-btn`);
    
    if (!content || !responseArea || !sendBtn) {
        console.error('필수 요소를 찾을 수 없습니다:', tabName);
        showNotification('오류가 발생했습니다.', 'error');
        return;
    }
    
    if (!content.trim() && !file) {
        showNotification('본문 내용 또는 이미지를 입력해주세요.', 'warning');
        return;
    }
    
    sendBtn.classList.add('loading');
    sendBtn.disabled = true;
    sendBtn.textContent = '전송 중...';
    
    const timestamp = new Date().toLocaleString('ko-KR');
    const startLogEntry = document.createElement('div');
    startLogEntry.className = 'log-entry';
    startLogEntry.innerHTML = `
        <div class="log-header">
            <span class="log-time">[${timestamp}]</span>
            <span class="log-status pending">⏳ 전송 시작...</span>
        </div>
    `;
    
    if (!responseArea.classList.contains('response-log')) {
        responseArea.innerHTML = '';
        responseArea.classList.remove('response-area');
        responseArea.classList.add('response-log');
    }
    
    responseArea.appendChild(startLogEntry);
    responseArea.scrollTop = responseArea.scrollHeight;
    
    const filesArray = file ? [file] : [];
    
    const timeoutId = setTimeout(() => {
        resetSendButton(sendBtn);
        const timeoutResponse = {
            success: false,
            error: '전송 시간이 초과되었습니다. (최대 1분)',
            timestamp: new Date().toISOString(),
            timeout: true
        };
        handleResponse(timeoutResponse, responseArea, sendBtn);
    }, 60000);
    
    const handleResponseWithTimeout = (response, successMessage) => {
        clearTimeout(timeoutId);
        handleResponse(response, responseArea, sendBtn, successMessage);
    };
    
    switch(tabName) {
        case 'if24':
            if (typeof sendIF24Content === 'function') {
                sendIF24Content(content, filesArray, responseArea, sendBtn, handleResponseWithTimeout);
            } else {
                clearTimeout(timeoutId);
                console.error('sendIF24Content 함수를 찾을 수 없습니다.');
                resetSendButton(sendBtn);
                showNotification('IF24 모듈 로딩 오류', 'error');
            }
            break;
        case 'creblack':
            if (typeof sendCreBlackContent === 'function') {
                sendCreBlackContent(content, filesArray, responseArea, sendBtn, handleResponseWithTimeout);
            } else {
                clearTimeout(timeoutId);
                console.error('sendCreBlackContent 함수를 찾을 수 없습니다.');
                resetSendButton(sendBtn);
                showNotification('CreBlack 모듈 로딩 오류', 'error');
            }
            break;
        case 'dudu':
            if (typeof sendDuduContent === 'function') {
                sendDuduContent(content, filesArray, responseArea, sendBtn, handleResponseWithTimeout);
            } else {
                clearTimeout(timeoutId);
                console.error('sendDuduContent 함수를 찾을 수 없습니다.');
                resetSendButton(sendBtn);
                showNotification('Dudu 모듈 로딩 오류', 'error');
            }
            break;
        default:
            clearTimeout(timeoutId);
            console.error('알 수 없는 탭:', tabName);
            resetSendButton(sendBtn);
            showNotification('오류가 발생했습니다.', 'error');
    }
}

// 전송 버튼 리셋
function resetSendButton(sendBtn) {
    if (sendBtn) {
        sendBtn.classList.remove('loading');
        sendBtn.disabled = false;
        sendBtn.textContent = '전송';
    }
}

// 응답 처리 함수
function handleResponse(response, responseArea, sendBtn, successMessage = '전송 완료') {
    resetSendButton(sendBtn);
    
    console.log('=== handleResponse 시작 ===');
    console.log('전체 response:', response);
    
    const timestamp = new Date().toLocaleTimeString('ko-KR');
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    
    let makeStatus = null;
    let makeMessage = '';
    
    if (response.result) {
        console.log('response.result 존재:', response.result);
        
        if (response.result.status) {
            makeStatus = response.result.status;
            makeMessage = response.result.message || '';
            console.log('✓ result에서 직접 추출 - status:', makeStatus);
        }
        else if (response.result.message) {
            if (typeof response.result.message === 'object') {
                makeStatus = response.result.message.status;
                makeMessage = response.result.message.message || '';
                console.log('✓ message 객체에서 추출 - status:', makeStatus);
            }
            else if (typeof response.result.message === 'string') {
                try {
                    const parsed = JSON.parse(response.result.message);
                    makeStatus = parsed.status;
                    makeMessage = parsed.message || '';
                    console.log('✓ message 문자열 파싱 성공 - status:', makeStatus);
                } catch (e) {
                    console.log('✗ message 파싱 실패, 문자열 그대로 사용');
                    makeMessage = response.result.message;
                }
            }
        }
    }
    
    const isSuccess = response.success && 
                     makeStatus && 
                     makeStatus.toLowerCase() === 'success';
    
    console.log('최종 판단:');
    console.log('- response.success:', response.success);
    console.log('- makeStatus:', makeStatus);
    console.log('- makeMessage:', makeMessage);
    console.log('- isSuccess:', isSuccess);
    console.log('=== handleResponse 종료 ===');
    
    if (isSuccess) {
        logEntry.classList.add('success');
        logEntry.innerHTML = `
            <div class="log-header">
                <span class="log-time">[${timestamp}]</span>
                <span class="log-status success">✅ ${successMessage}</span>
            </div>
            <div class="log-content">
                <div class="simple-message">${makeMessage || '전송이 완료되었습니다.'}</div>
            </div>
        `;
        showNotification(successMessage, 'success');
    } else {
        logEntry.classList.add('error');
        const errorMessage = makeMessage || response.error || '알 수 없는 오류가 발생했습니다.';
        logEntry.innerHTML = `
            <div class="log-header">
                <span class="log-time">[${timestamp}]</span>
                <span class="log-status error">❌ 전송 실패</span>
            </div>
            <div class="log-content">
                <div class="simple-message">${errorMessage}</div>
            </div>
        `;
        showNotification('전송 실패', 'error');
    }
    
    if (responseArea.textContent === '전송 중...') {
        responseArea.innerHTML = '';
        responseArea.classList.remove('response-area');
        responseArea.classList.add('response-log');
    }
    
    responseArea.appendChild(logEntry);
    responseArea.scrollTop = responseArea.scrollHeight;
}

// 설정 초기화
function resetSettings() {
    console.log('설정 초기화');
    
    if (confirm('모든 Webhook URL 설정을 초기화하시겠습니까?')) {
        webhookSettings = {
            if24: '',
            creblack: '',
            dudu: ''
        };
        
        try {
            localStorage.removeItem('webhookSettings');
            console.log('localStorage에서 설정 제거 완료');
        } catch (error) {
            console.error('localStorage 제거 실패:', error);
        }
        
        const if24Input = document.getElementById('if24-webhook');
        const creblackInput = document.getElementById('creblack-webhook');
        const duduInput = document.getElementById('dudu-webhook');
        
        if (if24Input) if24Input.value = '';
        if (creblackInput) creblackInput.value = '';
        if (duduInput) duduInput.value = '';
        
        showNotification('설정이 초기화되었습니다.', 'success');
    }
}

console.log('main.js 로드 완료');
