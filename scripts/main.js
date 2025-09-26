// scripts/main.js

// 전역 변수
let currentTab = 'if24';
let uploadedFiles = {
    if24: null,      // 단일 파일로 변경
    creblack: null,  // 단일 파일로 변경
    dudu: null       // 단일 파일로 변경
};

// 웹훅 설정 (수정된 구조)
let webhookSettings = {
    if24: '',        // 통합된 IF24 웹훅 URL
    creblack: '',
    dudu: ''
};

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadSettings();
    setupFileUploads();
});

// 앱 초기화
function initializeApp() {
    console.log('AI 콘텐츠 업로더 초기화 시작');
    
    // 탭 버튼에 이벤트 리스너 추가
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            switchTab(tabName);
        });
    });

    // 모달 외부 클릭 시 닫기
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
    
    // 이전 탭 비활성화
    const activeTabBtn = document.querySelector('.tab-btn.active');
    const activeTabContent = document.querySelector('.tab-content.active');
    
    if (activeTabBtn) activeTabBtn.classList.remove('active');
    if (activeTabContent) activeTabContent.classList.remove('active');
    
    // 새 탭 활성화
    const newTabBtn = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
    const newTabContent = document.getElementById(`${tabName}-tab`);
    
    if (newTabBtn) newTabBtn.classList.add('active');
    if (newTabContent) newTabContent.classList.add('active');
    
    currentTab = tabName;
    console.log(`현재 탭: ${currentTab}`);
}

// 탭 초기화 함수 (새로 추가)
function resetTab(tabName) {
    console.log(`탭 초기화: ${tabName}`);
    
    // 확인 메시지
    if (!confirm('현재 탭의 모든 내용을 초기화하시겠습니까?')) {
        return;
    }
    
    // 텍스트 입력 초기화
    const contentTextarea = document.getElementById(`${tabName}-content`);
    if (contentTextarea) {
        contentTextarea.value = '';
    }
    
    // 파일 초기화
    removeFile(tabName);
    
    // IF24 탭의 경우 플랫폼 선택도 초기화
    if (tabName === 'if24') {
        const checkboxes = ['instagram-check', 'threads-check', 'x-check'];
        checkboxes.forEach(checkboxId => {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.checked = false;
            }
        });
    }
    
    // 응답 영역 초기화
    const responseArea = document.getElementById(`${tabName}-response`);
    if (responseArea) {
        responseArea.innerHTML = '응답 결과가 여기에 표시됩니다...';
        responseArea.className = 'response-area'; // 클래스 초기화
    }
    
    // 알림 표시
    showNotification(`${tabName.toUpperCase()} 탭이 초기화되었습니다.`, 'success');
}

// 설정 모달 열기
function openSettings() {
    console.log('설정 모달 열기');
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.add('show');
        
        // 현재 설정값 로드 (localStorage에서 불러온 값 포함)
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

// 설정 저장
function saveSettings() {
    console.log('설정 저장 시작');
    
    const if24Input = document.getElementById('if24-webhook');
    const creblackInput = document.getElementById('creblack-webhook');
    const duduInput = document.getElementById('dudu-webhook');
    
    if (if24Input) webhookSettings.if24 = if24Input.value;
    if (creblackInput) webhookSettings.creblack = creblackInput.value;
    if (duduInput) webhookSettings.dudu = duduInput.value;
    
    // localStorage에 설정 저장
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
    
    // localStorage에서 설정 불러오기
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
        
        // 클릭 이벤트
        uploadArea.addEventListener('click', (e) => {
            // 삭제 버튼 클릭 시에는 파일 선택기 열지 않음
            if (e.target.classList.contains('file-remove')) {
                return;
            }
            fileInput.click();
        });
        
        // 파일 선택 이벤트
        fileInput.addEventListener('change', (e) => {
            handleFileSelect(e.target.files, tabName);
        });
        
        // 드래그 앤 드롭 이벤트
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

// 파일 선택 처리 (단일 파일로 수정)
function handleFileSelect(files, tabName) {
    console.log(`파일 선택 - 탭: ${tabName}, 파일 수: ${files.length}`);
    
    if (files.length === 0) return;
    
    const file = files[0]; // 첫 번째 파일만 선택
    const fileList = document.getElementById(`${tabName}-file-list`);
    if (!fileList) return;
    
    // 이미지 파일만 허용
    if (!file.type.startsWith('image/')) {
        showNotification('이미지 파일만 업로드 가능합니다.', 'error');
        return;
    }
    
    // 파일 크기 체크 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('파일 크기는 10MB 이하여야 합니다.', 'error');
        return;
    }
    
    // 기존 파일 제거
    uploadedFiles[tabName] = file;
    
    // 파일 목록 초기화
    fileList.innerHTML = '';
    
    // 이미지 미리보기와 파일 정보 생성
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <button class="file-remove" onclick="removeFile('${tabName}', event)">✕ 삭제</button>
            <div class="file-preview">
                <img src="${e.target.result}" alt="업로드된 이미지" class="preview-image">
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

// 파일 제거 (이벤트 버블링 방지 추가)
function removeFile(tabName, event) {
    // 이벤트 버블링 방지
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    console.log(`파일 제거 - 탭: ${tabName}`);
    
    uploadedFiles[tabName] = null;
    
    // 파일 목록 초기화
    const fileList = document.getElementById(`${tabName}-file-list`);
    if (fileList) {
        fileList.innerHTML = '';
    }
    
    // 파일 입력 초기화
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
    // 기존 알림 제거
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 새 알림 생성
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
    
    // 타입별 색상 설정
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
    
    // 3초 후 자동 제거
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

// 공통 전송 함수 (단일 파일로 수정 + 1분 타임아웃 추가)
function sendContent(tabName) {
    console.log(`콘텐츠 전송 시작 - 탭: ${tabName}`);
    
    const content = document.getElementById(`${tabName}-content`).value;
    const file = uploadedFiles[tabName]; // 단일 파일
    const responseArea = document.getElementById(`${tabName}-response`);
    const sendBtn = document.querySelector(`#${tabName}-tab .send-btn`);
    
    if (!content || !responseArea || !sendBtn) {
        console.error('필수 요소를 찾을 수 없습니다:', tabName);
        showNotification('오류가 발생했습니다.', 'error');
        return;
    }
    
    // 입력 검증
    if (!content.trim() && !file) {
        showNotification('본문 내용 또는 이미지를 입력해주세요.', 'warning');
        return;
    }
    
    // 버튼 상태 변경
    sendBtn.classList.add('loading');
    sendBtn.disabled = true;
    sendBtn.textContent = '전송 중...';
    
    // 응답 영역 로그 시작 메시지 추가
    const timestamp = new Date().toLocaleString('ko-KR');
    const startLogEntry = document.createElement('div');
    startLogEntry.className = 'log-entry';
    startLogEntry.innerHTML = `
        <div class="log-header">
            <span class="log-time">[${timestamp}]</span>
            <span class="log-status pending">⏳ 전송 시작...</span>
        </div>
    `;
    
    // 응답 영역 초기화 및 로그 형식으로 변경
    if (!responseArea.classList.contains('response-log')) {
        responseArea.innerHTML = '';
        responseArea.classList.remove('response-area');
        responseArea.classList.add('response-log');
    }
    
    responseArea.appendChild(startLogEntry);
    responseArea.scrollTop = responseArea.scrollHeight;
    
    // 파일 배열로 변환 (기존 함수들과의 호환성을 위해)
    const filesArray = file ? [file] : [];
    
    // 1분 타임아웃 설정
    const timeoutId = setTimeout(() => {
        resetSendButton(sendBtn);
        const timeoutResponse = {
            success: false,
            error: '전송 시간이 초과되었습니다. (최대 1분)',
            timestamp: new Date().toISOString(),
            timeout: true
        };
        handleResponse(timeoutResponse, responseArea, sendBtn);
    }, 60000); // 60초
    
    // 성공/실패 응답 처리 함수 래핑
    const handleResponseWithTimeout = (response, successMessage) => {
        clearTimeout(timeoutId); // 타임아웃 제거
        handleResponse(response, responseArea, sendBtn, successMessage);
    };
    
    // 탭별 전송 로직 호출
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

// 유틸리티 함수: FormData 생성
function createFormData(content, files, additionalData = {}) {
    const formData = new FormData();
    formData.append('content', content);
    
    files.forEach((file, index) => {
        formData.append(`image_${index}`, file);
    });
    
    Object.keys(additionalData).forEach(key => {
        formData.append(key, JSON.stringify(additionalData[key]));
    });
    
    return formData;
}

// 유틸리티 함수: 응답 처리 (스크롤 방식으로 변경)
function handleResponse(response, responseArea, sendBtn, successMessage = '전송 완료') {
    resetSendButton(sendBtn);
    
    // 현재 시간 추가
    const timestamp = new Date().toLocaleString('ko-KR');
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    
    if (response.success) {
        logEntry.classList.add('success');
        logEntry.innerHTML = `
            <div class="log-header">
                <span class="log-time">[${timestamp}]</span>
                <span class="log-status success">✅ ${successMessage}</span>
            </div>
            <div class="log-content">
                <pre>${JSON.stringify(response, null, 2)}</pre>
            </div>
        `;
        showNotification(successMessage, 'success');
    } else {
        logEntry.classList.add('error');
        logEntry.innerHTML = `
            <div class="log-header">
                <span class="log-time">[${timestamp}]</span>
                <span class="log-status error">❌ 전송 실패</span>
            </div>
            <div class="log-content">
                <pre>오류: ${response.error || '알 수 없는 오류'}</pre>
            </div>
        `;
        showNotification('전송 실패', 'error');
    }
    
    // 기존 "전송 중..." 텍스트 제거하고 로그 추가
    if (responseArea.textContent === '전송 중...') {
        responseArea.innerHTML = '';
        responseArea.classList.remove('response-area');
        responseArea.classList.add('response-log');
    }
    
    responseArea.appendChild(logEntry);
    
    // 스크롤을 맨 아래로
    responseArea.scrollTop = responseArea.scrollHeight;
}

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    /* 이미지 미리보기 스타일 */
    .file-preview {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
    }
    
    .preview-image {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 4px;
        border: 1px solid #dee2e6;
    }
    
    .file-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .file-info .file-name {
        font-weight: 500;
    }
    
    .file-info .file-size {
        font-size: 0.8rem;
        color: #6c757d;
    }
    
    .file-item {
        align-items: center;
        padding: 12px;
    }
`;
document.head.appendChild(style);

// 설정 초기화 (추가 기능)
function resetSettings() {
    console.log('설정 초기화');
    
    if (confirm('모든 Webhook URL 설정을 초기화하시겠습니까?')) {
        webhookSettings = {
            if24: '',
            creblack: '',
            dudu: ''
        };
        
        // localStorage에서도 제거
        try {
            localStorage.removeItem('webhookSettings');
            console.log('localStorage에서 설정 제거 완료');
        } catch (error) {
            console.error('localStorage 제거 실패:', error);
        }
        
        // 모달의 입력 필드도 초기화
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