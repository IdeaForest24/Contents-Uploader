// scripts/if24.js

// IF24 콘텐츠 전송 (실제 webhook 전송)
async function sendIF24Content(content, files, responseArea, sendBtn, responseCallback) {
    console.log('IF24 콘텐츠 전송 시작');
    
    try {
        // 선택된 플랫폼 확인
        const selectedPlatforms = getSelectedPlatforms();
        
        if (selectedPlatforms.length === 0) {
            throw new Error('최소 하나의 플랫폼을 선택해주세요.');
        }
        
        // IF24 통합 웹훅 URL 확인
        const webhookUrl = webhookSettings.if24;
        if (!webhookUrl) {
            throw new Error('IF24 Webhook URL이 설정되지 않았습니다.');
        }
        
        console.log('선택된 플랫폼:', selectedPlatforms);
        console.log('IF24 Webhook URL:', webhookUrl);
        
        // FormData 생성
        const formData = new FormData();
        formData.append('content', content);
        formData.append('platforms', JSON.stringify(selectedPlatforms));
        formData.append('timestamp', new Date().toISOString());
        formData.append('source', 'AI_Content_Uploader');
        formData.append('tab', 'if24');
        
        // 파일 추가 (단일 파일)
        if (files && files.length > 0) {
            formData.append('image_0', files[0]);
        }
        
        console.log('FormData 생성 완료, 웹훅 전송 시도...');
        
        // 실제 웹훅 전송
        const response = await fetch(webhookUrl, {
            method: 'POST',
            body: formData
        });
        
        console.log('웹훅 응답 상태:', response.status, response.statusText);
        
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
                platform: 'if24',
                platforms: selectedPlatforms,
                result: result,
                timestamp: new Date().toISOString(),
                content: content,
                fileCount: files ? files.length : 0
            };
            
            responseCallback(successResponse, 'IF24 전송 완료');
        } else {
            throw new Error(`웹훅 전송 실패: ${response.status} ${response.statusText}`);
        }
        
    } catch (error) {
        console.error('IF24 전송 오류:', error);
        
        const errorResponse = {
            success: false,
            platform: 'if24',
            error: error.message,
            timestamp: new Date().toISOString()
        };
        
        responseCallback(errorResponse);
    }
}

// 선택된 플랫폼 가져오기
function getSelectedPlatforms() {
    const platforms = [];
    
    const instagramCheck = document.getElementById('instagram-check');
    const threadsCheck = document.getElementById('threads-check');
    const xCheck = document.getElementById('x-check');
    
    if (instagramCheck && instagramCheck.checked) {
        platforms.push('instagram');
    }
    if (threadsCheck && threadsCheck.checked) {
        platforms.push('threads');
    }
    if (xCheck && xCheck.checked) {
        platforms.push('x');
    }
    
    return platforms;
}

// 플랫폼별 콘텐츠 최적화
function optimizeContentForPlatform(content, platform) {
    let optimized = content;
    
    switch(platform) {
        case 'instagram':
            optimized = addInstagramOptimization(content);
            break;
            
        case 'threads':
            optimized = addThreadsOptimization(content);
            break;
            
        case 'x':
            optimized = addXOptimization(content);
            break;
    }
    
    return optimized;
}

// 인스타그램 최적화
function addInstagramOptimization(content) {
    let optimized = content;
    
    if (!content.includes('#')) {
        optimized += '\n\n#instagram #daily #photo';
    }
    
    if (optimized.length > 2200) {
        optimized = optimized.substring(0, 2200) + '...';
    }
    
    return optimized;
}

// 스레드 최적화
function addThreadsOptimization(content) {
    let optimized = content;
    
    if (optimized.length > 500) {
        const parts = [];
        let currentPart = '';
        const words = optimized.split(' ');
        
        for (const word of words) {
            if ((currentPart + ' ' + word).length > 500) {
                parts.push(currentPart + ' (1/n)');
                currentPart = word;
            } else {
                currentPart += (currentPart ? ' ' : '') + word;
            }
        }
        
        if (currentPart) {
            parts.push(currentPart);
        }
        
        const totalParts = parts.length;
        optimized = parts.map((part, index) => 
            part.replace('(1/n)', `(${index + 1}/${totalParts})`)
        ).join('\n\n---THREADS_SPLIT---\n\n');
    }
    
    return optimized;
}

// X(트위터) 최적화
function addXOptimization(content) {
    let optimized = content;
    
    if (optimized.length > 280) {
        optimized = optimized.substring(0, 270) + '... (1/n)';
    }
    
    const hashtagCount = (optimized.match(/#/g) || []).length;
    if (hashtagCount === 0) {
        optimized += ' #twitter';
    }
    
    return optimized;
}

// IF24 특화 이벤트 리스너들
document.addEventListener('DOMContentLoaded', function() {
    console.log('IF24 모듈 초기화');
    
    const checkboxes = ['instagram-check', 'threads-check', 'x-check'];
    
    checkboxes.forEach(checkboxId => {
        const checkbox = document.getElementById(checkboxId);
        if (checkbox) {
            checkbox.addEventListener('change', function() {
                console.log(`${checkboxId} 상태 변경:`, this.checked);
                
                const selectedCount = getSelectedPlatforms().length;
                console.log(`선택된 플랫폼 수: ${selectedCount}`);
                
                if (this.checked) {
                    this.parentElement.style.transform = 'scale(1.05)';
                    setTimeout(() => {
                        this.parentElement.style.transform = 'scale(1)';
                    }, 200);
                }
            });
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (currentTab !== 'if24') return;
        
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            sendContent('if24');
        }
        
        if (e.ctrlKey && ['1', '2', '3'].includes(e.key)) {
            e.preventDefault();
            const checkboxes = ['instagram-check', 'threads-check', 'x-check'];
            const targetCheckbox = document.getElementById(checkboxes[parseInt(e.key) - 1]);
            if (targetCheckbox) {
                targetCheckbox.checked = !targetCheckbox.checked;
                targetCheckbox.dispatchEvent(new Event('change'));
            }
        }
    });
    
    console.log('IF24 모듈 초기화 완료');
});

console.log('if24.js 로드 완료');