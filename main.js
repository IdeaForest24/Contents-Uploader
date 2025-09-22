// scripts/main.js

// 전역 변수
let currentTab = 'if24';
let uploadedFiles = {
    if24: [],
    creblack: [],
    dudu: []
};

// 웹훅 설정
let webhookSettings = {
    instagram: '',
    thread: '',
    x: '',
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
    document.getElementById('settings-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeSettings();
        }
    });

    console.log('앱 초기화 완료');
}

// 탭 전환 함수
function switchTab(tabName) {
    console.log(`탭 전환: ${tabName}`);
    
    // 이전 탭 비활성화
    document.querySelector('.tab-btn.active').classList.remove('active');
    document.querySelector('.tab-content.active').classList.remove('active');
    
    // 새 탭 활성화
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    currentTab = tabName;
    console.log(`현재 탭: ${currentTab}`);
}

// 설정 모달 열기
function openSettings() {
    console.log('설정 모달 열기');
    const modal = document.getElementById('settings-modal');
    modal.classList.add('show');
    
    // 현재 설정값 로드
    document.getElementById('instagram-webhook').value = webhookSettings.instagram;
    document.getElementById('thread-webhook').value = webhookSettings.thread;
    document.getElementById('x-webhook').value = webhookSettings.x;
    document.getElementById('creblack-webhook').value = webhookSettings.creblack;
    document.getElementById('dudu-webhook').value = webhookSettings.dudu;
}

// 설정 모달 닫기
function closeSettings() {
    console.log('설정 모달 닫기');
    const modal = document.getElementById('settings-modal');
    modal.classList.remove('show');
}

// 설정 저장
function saveSettings() {
    console.log('설정 저장 시작');
    
    webhookSettings.instagram = document.getElementById('instagram-webhook').value;
    webhookSettings.thread = document.getElementById('thread-webhook').value;
    webhookSettings.x = document.getElementById('x-webhook').value;
    webhookSettings.creblack = document.getElementById('creblack-webhook').value;
    webhookSettings.dudu = document.getElementById('dudu-webhook').value;
    
    // 로컬 스토리지에 저장 (실제 환경에서는 서버에 저장)
    try {
        const settings = JSON.stringify(webhookSettings);
        // localStorage는 Claude.ai 환경에서 지원되지 않으므로 메모리에만 저장
        console.log('설정 저장 완료:', webhookSettings);
        
        // 사용자에게 저장 완료 알림
        showNotification('설정이 저장되었습니다.', 'success');
        closeSettings();
    } catch (error) {
        console.error('설정 저장 오류:', error);
        showNotification('설정 저장 중 오류가 발생했습니다.', 'error');
    }
}

// 설정 로드
function loadSettings() {
    console.log('설정 로드 시작');
    try {
        // localStorage는 지원되지 않으므로 기본값 사용
        console.log('기본 설정 로드 완료');
    } catch (error) {
        console.error('설정 로드 오류:', error);
    }
}

// 파일 업로드 설정
function setupFileUploads() {
    console.log('파일 업로드 설정 시작');
    
    ['if24', 'creblack', 'dudu'].forEach(tabName => {
        const uploadArea = document.getElementById(`${tabName}-upload`);
        const fileInput = document.getElementById(`${tabName}-file-input`);
        const fileList = document.getElementById(`${tabName}-file-list`);
        
        // 클릭 이벤트
        uploadArea.addEventListener('click', () => {
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

// 파일 선택 처리
function handleFileSelect(files, tabName) {
    console.log(`파일 선택 - 탭: ${tabName}, 파일 수: ${files.length}`);
    
    const fileList = document.getElementById(`${tabName}-file-list`);
    
    Array.from(files).forEach(file => {
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
        
        uploadedFiles[tabName].push(file);
        
        // 파일 아이템 생성
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <span class="file-name">${file.name} (${formatFileSize(file.size)})</span>
            <button class="file-remove" onclick="removeFile('${tabName}', ${uploadedFiles[tabName].length - 1})">삭제</button>
        `;
        
        fileList.appendChild(fileItem);
    });
    
    console.log(`업로드된 파일 목록 (${tabName}):`, uploadedFiles[tabName].map(f => f.name));
}

// 파일 제거
function removeFile(tabName, index) {
    console.log(`파일 제거 - 탭: ${tabName}, 인덱스: ${index}`);
    
    uploadedFiles[tabName].splice(index, 1);
    
    // 파일 목록 다시 렌더링
    const fileList = document.getElementById(`${tabName}-file-list`);
    fileList.innerHTML = '';
    
    uploadedFiles[tabName].forEach((file, i) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <span class="file-name">${file.name} (${formatFileSize(file.size)})</span>
            <button class="file-remove" onclick="removeFile('${tabName}', ${i})">삭제</button>
        `;
        fileList.appendChild(fileItem);
    });
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
`;
document.head.appendChild(style);

// 공통 전송 함수
function sendContent(tabName) {
    console.log(`콘텐츠 전송 시작 - 탭: ${tabName}`);
    
    const content = document.getElementById(`${tabName}-content`).value;
    const files = uploadedFiles[tabName];
    const responseArea = document.getElementById(`${tabName}-response`);
    const sendBtn = document.querySelector(`#${tabName}-tab .send-btn`);
    
    // 입력 검증
    if (!content.trim() && files.length === 0) {
        showNotification('본문 내용 또는 이미지를 입력해주세요.', 'warning');
        return;
    }
    
    // 버튼 상태 변경
    sendBtn.classList.add('loading');
    sendBtn.disabled = true;
    sendBtn.textContent = '전송 중...';
    
    // 응답 영역 초기화
    responseArea.textContent = '전송 중...';
    responseArea.className = 'response-area';
    
    // 탭별 전송 로직 호출
    switch(tabName) {
        case 'if24':
            sendIF24Content(content, files, responseArea, sendBtn);
            break;
        case 'creblack':
            sendCreBlackContent(content, files, responseArea, sendBtn);
            break;
        case 'dudu':
            sendDuduContent(content, files, responseArea, sendBtn);
            break;
        default:
            console.error('알 수 없는 탭:', tabName);
            resetSendButton(sendBtn);
            showNotification('오류가 발생했습니다.', 'error');
    }
}

// 전송 버튼 리셋
function resetSendButton(sendBtn) {
    sendBtn.classList.remove('loading');
    sendBtn.disabled = false;
    sendBtn.textContent = '전송';
}

// 유틸리티 함수: FormData 생성
function createFormData(content, files, additionalData = {}) {
    const formData = new FormData();
    formData.append('content', content);
    
    files.forEach((file, index) => {
        formData.append(`image_${index}`, file);
    });
    
    Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
    });
    
    return formData;
}

// 유틸리티 함수: 응답 처리
function handleResponse(response, responseArea, sendBtn, successMessage = '전송 완료') {
    resetSendButton(sendBtn);
    
    if (response.success) {
        responseArea.textContent = JSON.stringify(response, null, 2);
        responseArea.classList.add('success');
        showNotification(successMessage, 'success');
    } else {
        responseArea.textContent = `오류: ${response.error || '알 수 없는 오류'}`;
        responseArea.classList.add('error');
        showNotification('전송 실패', 'error');
    }
}

console.log('main.js 로드 완료');
