// scripts/creblack.js

// CreBlack 콘텐츠 전송
async function sendCreBlackContent(content, files, responseArea, sendBtn) {
    console.log('CreBlack 콘텐츠 전송 시작');
    
    try {
        // CreBlack Webhook URL 확인
        const webhookUrl = webhookSettings.creblack;
        
        if (!webhookUrl) {
            throw new Error('CreBlack Webhook URL이 설정되지 않았습니다.');
        }
        
        console.log('CreBlack Webhook URL:', webhookUrl);
        
        // CreBlack 전용 콘텐츠 최적화
        const optimizedContent = optimizeCreBlackContent(content);
        
        // FormData 생성
        const formData = new FormData();
        formData.append('content', optimizedContent);
        formData.append('platform', 'creblack');
        formData.append('timestamp', new Date().toISOString());
        formData.append('source', 'AI_Content_Uploader');
        formData.append('tab', 'creblack');
        formData.append('contentType', 'creative');
        
        // 파일 추가
        files.forEach((file, index) => {
            formData.append(`image_${index}`, file);
        });
        
        console.log('CreBlack FormData 생성 완료, 웹훅 전송 시도...');
        
        // 실제 웹훅 전송
        const response = await fetch(webhookUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Platform': 'CreBlack',
                'X-Source': 'AI-Content-Uploader'
            }
        });
        
        console.log('CreBlack 웹훅 응답 상태:', response.status, response.statusText);
        
        let result;
        try {
            result = await response.json();
        } catch (e) {
            result = {
                success: response.ok,
                message: await response.text() || response.statusText,
                status: response.status
            };
        }
        
        if (response.ok) {
            const successResponse = {
                success: true,
                platform: 'creblack',
                result: result,
                timestamp: new Date().toISOString(),
                content: optimizedContent,
                fileCount: files.length,
                contentAnalysis: analyzeCreBlackContent(optimizedContent)
            };
            
            handleResponse(successResponse, responseArea, sendBtn, 'CreBlack 전송 완료');
        } else {
            throw new Error(`CreBlack 웹훅 전송 실패: ${response.status} ${response.statusText}`);
        }
        
    } catch (error) {
        console.error('CreBlack 전송 오류:', error);
        
        const errorResponse = {
            success: false,
            platform: 'creblack',
            error: error.message,
            timestamp: new Date().toISOString()
        };
        
        handleResponse(errorResponse, responseArea, sendBtn);
    }
}

// CreBlack 콘텐츠 최적화
function optimizeCreBlackContent(content) {
    let optimized = content;
    
    // CreBlack 플랫폼 특성에 맞는 최적화
    // 1. 창작자 중심의 콘텐츠 포맷팅
    if (!content.includes('[창작자]') && !content.includes('[Creator]')) {
        optimized = '[창작자 콘텐츠]\n\n' + optimized;
    }
    
    // 2. 태그 정규화
    optimized = normalizeCreBlackTags(optimized);
    
    // 3. 길이 최적화 (5000자 제한)
    if (optimized.length > 5000) {
        optimized = optimized.substring(0, 4980) + '...\n\n[더 보기]';
    }
    
    // 4. 포맷팅 개선
    optimized = improveCreBlackFormatting(optimized);
    
    return optimized;
}

// CreBlack 태그 정규화
function normalizeCreBlackTags(content) {
    // 일반적인 해시태그를 CreBlack 스타일로 변환
    let normalized = content;
    
    // 기본 크리에이터 태그 추가
    const creatorTags = ['#창작', '#아트', '#디자인', '#크리에이터'];
    const hasCreatorTag = creatorTags.some(tag => content.includes(tag));
    
    if (!hasCreatorTag) {
        normalized += '\n\n#창작 #크리에이터';
    }
    
    return normalized;
}

// CreBlack 포맷팅 개선
function improveCreBlackFormatting(content) {
    let formatted = content;
    
    // 1. 단락 구분 개선
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    
    // 2. 특수 문자 정규화
    formatted = formatted.replace(/[""]/g, '"');
    formatted = formatted.replace(/['']/g, "'");
    
    // 3. CreBlack 전용 이모지 추가 (선택적)
    if (!formatted.includes('🎨') && !formatted.includes('✨')) {
        formatted = '🎨 ' + formatted;
    }
    
    return formatted;
}

// CreBlack 특화 기능들
function analyzeCreBlackContent(content) {
    const analysis = {
        wordCount: content.split(/\s+/).length,
        hashtagCount: (content.match(/#\w+/g) || []).length,
        hasCreativeElements: /[🎨✨🎭🎪🎯]/.test(content),
        isOptimized: content.includes('[창작자') || content.includes('#창작')
    };
    
    console.log('CreBlack 콘텐츠 분석:', analysis);
    return analysis;
}

// CreBlack 콘텐츠 미리보기
function previewCreBlackContent(content) {
    const preview = {
        original: content,
        optimized: optimizeCreBlackContent(content),
        analysis: analyzeCreBlackContent(content)
    };
    
    console.log('CreBlack 미리보기:', preview);
    return preview;
}

// CreBlack 특화 이벤트 리스너들
document.addEventListener('DOMContentLoaded', function() {
    console.log('CreBlack 모듈 초기화');
    
    // CreBlack 콘텐츠 실시간 분석
    const creblackTextarea = document.getElementById('creblack-content');
    if (creblackTextarea) {
        let analysisTimeout;
        
        creblackTextarea.addEventListener('input', function() {
            clearTimeout(analysisTimeout);
            
            // 500ms 디바운스
            analysisTimeout = setTimeout(() => {
                const content = this.value;
                if (content.length > 10) {
                    const analysis = analyzeCreBlackContent(content);
                    
                    // 실시간 피드백 표시 (선택적)
                    if (!analysis.isOptimized && content.length > 100) {
                        console.log('CreBlack 최적화 제안: 창작자 태그를 추가하세요.');
                    }
                }
            }, 500);
        });
        
        // 포커스 시 플레이스홀더 변경
        creblackTextarea.addEventListener('focus', function() {
            if (this.placeholder === '본문 내용을 입력하세요...') {
                this.placeholder = '창작자의 이야기를 들려주세요... 🎨';
            }
        });
        
        creblackTextarea.addEventListener('blur', function() {
            if (this.placeholder === '창작자의 이야기를 들려주세요... 🎨') {
                this.placeholder = '본문 내용을 입력하세요...';
            }
        });
    }
    
    // CreBlack 전용 키보드 단축키
    document.addEventListener('keydown', function(e) {
        if (currentTab !== 'creblack') return;
        
        // Ctrl+Enter로 전송
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            sendContent('creblack');
        }
        
        // Ctrl+P로 미리보기
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            const content = document.getElementById('creblack-content').value;
            if (content) {
                const preview = previewCreBlackContent(content);
                console.log('CreBlack 미리보기 결과:', preview);
                if (typeof showNotification === 'function') {
                    showNotification('콘솔에서 미리보기 결과를 확인하세요.', 'info');
                }
            }
        }
    });
    
    // CreBlack 탭 활성화 시 특별 효과
    const creblackTab = document.querySelector('[onclick="switchTab(\'creblack\')"]');
    if (creblackTab) {
        creblackTab.addEventListener('click', function() {
            setTimeout(() => {
                console.log('CreBlack 모드 활성화 - 창작자 중심 모드');
            }, 100);
        });
    }
    
    console.log('CreBlack 모듈 초기화 완료');
});

console.log('creblack.js 로드 완료');