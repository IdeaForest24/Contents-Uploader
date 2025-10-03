// scripts/creblack.js

// CreBlack 콘텐츠 전송
async function sendCreBlackContent(content, files, responseArea, sendBtn, responseCallback) {
    console.log('CreBlack 콘텐츠 전송 시작');
    
    try {
        const webhookUrl = webhookSettings.creblack;
        
        if (!webhookUrl) {
            throw new Error('CreBlack Webhook URL이 설정되지 않았습니다.');
        }
        
        console.log('CreBlack Webhook URL:', webhookUrl);
        
        const optimizedContent = optimizeCreBlackContent(content);
        
        const formData = new FormData();
        formData.append('content', optimizedContent);
        formData.append('platform', 'creblack');
        formData.append('timestamp', new Date().toISOString());
        formData.append('source', 'AI_Content_Uploader');
        formData.append('tab', 'creblack');
        formData.append('contentType', 'creative');
        
        if (files && files.length > 0) {
            formData.append('image_0', files[0]);
        }
        
        console.log('CreBlack FormData 생성 완료, 웹훅 전송 시도...');
        
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
            // JSON으로 직접 파싱
            result = await response.json();
            console.log('JSON 응답:', result);
        } catch (jsonError) {
            console.error('JSON 파싱 실패:', jsonError);
            result = {
                success: response.ok,
                message: response.statusText || 'JSON 파싱 실패',
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
                fileCount: files ? files.length : 0,
                contentAnalysis: analyzeCreBlackContent(optimizedContent)
            };
            
            responseCallback(successResponse, 'CreBlack 전송 완료');
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
        
        responseCallback(errorResponse);
    }
}

// CreBlack 콘텐츠 최적화
function optimizeCreBlackContent(content) {
    let optimized = content;
    
    if (!content.includes('[창작자]') && !content.includes('[Creator]')) {
        optimized = '[창작자 콘텐츠]\n\n' + optimized;
    }
    
    optimized = normalizeCreBlackTags(optimized);
    
    if (optimized.length > 5000) {
        optimized = optimized.substring(0, 4980) + '...\n\n[더 보기]';
    }
    
    optimized = improveCreBlackFormatting(optimized);
    
    return optimized;
}

// CreBlack 태그 정규화
function normalizeCreBlackTags(content) {
    let normalized = content;
    
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
    
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    formatted = formatted.replace(/[""]/g, '"');
    formatted = formatted.replace(/['']/g, "'");
    
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
    
    const creblackTextarea = document.getElementById('creblack-content');
    if (creblackTextarea) {
        let analysisTimeout;
        
        creblackTextarea.addEventListener('input', function() {
            clearTimeout(analysisTimeout);
            
            analysisTimeout = setTimeout(() => {
                const content = this.value;
                if (content.length > 10) {
                    const analysis = analyzeCreBlackContent(content);
                    
                    if (!analysis.isOptimized && content.length > 100) {
                        console.log('CreBlack 최적화 제안: 창작자 태그를 추가하세요.');
                    }
                }
            }, 500);
        });
        
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
    
    document.addEventListener('keydown', function(e) {
        if (currentTab !== 'creblack') return;
        
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            sendContent('creblack');
        }
        
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