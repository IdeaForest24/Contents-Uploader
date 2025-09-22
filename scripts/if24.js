// scripts/if24.js

// IF24 탭 전용 함수들

// IF24 콘텐츠 전송
async function sendIF24Content(content, files, responseArea, sendBtn) {
    console.log('IF24 콘텐츠 전송 시작');
    
    try {
        // 선택된 플랫폼 확인
        const selectedPlatforms = getSelectedPlatforms();
        
        if (selectedPlatforms.length === 0) {
            throw new Error('최소 하나의 플랫폼을 선택해주세요.');
        }
        
        console.log('선택된 플랫폼:', selectedPlatforms);
        
        // 플랫폼별로 순차 전송
        const results = {};
        
        for (const platform of selectedPlatforms) {
            console.log(`${platform} 플랫폼 전송 시작`);
            
            const webhookUrl = getWebhookUrl(platform);
            if (!webhookUrl) {
                results[platform] = {
                    success: false,
                    error: 'Webhook URL이 설정되지 않았습니다.'
                };
                continue;
            }
            
            try {
                const result = await sendToPlatform(platform, content, files, webhookUrl);
                results[platform] = result;
                console.log(`${platform} 전송 결과:`, result);
            } catch (error) {
                console.error(`${platform} 전송 오류:`, error);
                results[platform] = {
                    success: false,
                    error: error.message
                };
            }
        }
        
        // 전체 결과 처리
        const overallSuccess = Object.values(results).some(result => result.success);
        
        const response = {
            success: overallSuccess,
            timestamp: new Date().toISOString(),
            platforms: results,
            content: content,
            fileCount: files.length
        };
        
        handleResponse(response, responseArea, sendBtn, 'IF24 전송 완료');
        
    } catch (error) {
        console.error('IF24 전송 오류:', error);
        
        const errorResponse = {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };
        
        handleResponse(errorResponse, responseArea, sendBtn);
    }
}

// 선택된 플랫폼 가져오기
function getSelectedPlatforms() {
    const platforms = [];
    
    if (document.getElementById('instagram-check').checked) {
        platforms.push('instagram');
    }
    if (document.getElementById('thread-check').checked) {
        platforms.push('thread');
    }
    if (document.getElementById('x-check').checked) {
        platforms.push('x');
    }
    
    return platforms;
}

// 플랫폼별 Webhook URL 가져오기
function getWebhookUrl(platform) {
    switch(platform) {
        case 'instagram':
            return webhookSettings.instagram;
        case 'thread':
            return webhookSettings.thread;
        case 'x':
            return webhookSettings.x;
        default:
            return null;
    }
}

// 플랫폼별 전송
async function sendToPlatform(platform, content, files, webhookUrl) {
    console.log(`${platform} 플랫폼으로 전송 시작`);
    
    // 플랫폼별 콘텐츠 최적화
    const optimizedContent = optimizeContentForPlatform(content, platform);
    
    // FormData 생성
    const formData = createFormData(optimizedContent, files, {
        platform: platform,
        timestamp: new Date().toISOString(),
        source: 'AI_Content_Uploader'
    });
    
    try {
        // 실제 환경에서는 실제 Webhook URL로 전송
        // 데모용으로 Mock 응답 생성
        const mockResponse = await sendMockRequest(platform, formData, webhookUrl);
        
        return {
            success: true,
            platform: platform,
            response: mockResponse,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        throw new Error(`${platform} 전송 실패: ${error.message}`);
    }
}

// 플랫폼별 콘텐츠 최적화
function optimizeContentForPlatform(content, platform) {
    let optimized = content;
    
    switch(platform) {
        case 'instagram':
            // 인스타그램: 해시태그 최적화, 길이 제한
            optimized = addInstagramOptimization(content);
            break;
            
        case 'thread':
            // 스레드: 스레드 형식 최적화
            optimized = addThreadOptimization(content);
            break;
            
        case 'x':
            // X(트위터): 280자 제한, 해시태그 최적화
            optimized = addXOptimization(content);
            break;
    }
    
    return optimized;
}

// 인스타그램 최적화
function addInstagramOptimization(content) {
    // 해시태그 추가 및 최적화
    let optimized = content;
    
    // 기본 해시태그가 없으면 추가
    if (!content.includes('#')) {
        optimized += '\n\n#instagram #daily #photo';
    }
    
    // 2200자 제한
    if (optimized.length > 2200) {
        optimized = optimized.substring(0, 2200) + '...';
    }
    
    return optimized;
}

// 스레드 최적화
function addThreadOptimization(content) {
    // 스레드 형식 최적화
    let optimized = content;
    
    // 500자 단위로 분할 (스레드 특성상)
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
        
        // 스레드 번호 업데이트
        const totalParts = parts.length;
        optimized = parts.map((part, index) => 
            part.replace('(1/n)', `(${index + 1}/${totalParts})`)
        ).join('\n\n---THREAD_SPLIT---\n\n');
    }
    
    return optimized;
}

// X(트위터) 최적화
function addXOptimization(content) {
    let optimized = content;
    
    // 280자 제한
    if (optimized.length > 280) {
        optimized = optimized.substring(0, 270) + '... (1/n)';
    }
    
    // 해시태그 최적화 (최대 2개)
    const hashtagCount = (optimized.match(/#/g) || []).length;
    if (hashtagCount === 0) {
        optimized += ' #twitter';
    }
    
    return optimized;
}

// Mock 요청 전송 (데모용)
async function sendMockRequest(platform, formData, webhookUrl) {
    console.log(`Mock 요청 전송 - 플랫폼: ${platform}, URL: ${webhookUrl}`);
    
    // 실제 환경에서는 다음과 같이 실제 요청을 보냄:
    /*
    const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
    */
    
    // 데모용 Mock 응답
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // 90% 확률로 성공
            if (Math.random() > 0.1) {
                resolve({
                    success: true,
                    platform: platform,
                    postId: `${platform}_${Date.now()}`,
                    url: `https://${platform}.com/post/${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    message: `${platform}에 성공적으로 게시되었습니다.`
                });
            } else {
                reject(new Error(`${platform} API 오류: 일시적인 서버 오류`));
            }
        }, 1000 + Math.random() * 2000); // 1-3초 랜덤 지연
    });
}

// IF24 특화 이벤트 리스너들
document.addEventListener('DOMContentLoaded', function() {
    console.log('IF24 모듈 초기화');
    
    // 플랫폼 선택 체크박스 이벤트
    const checkboxes = ['instagram-check', 'thread-check', 'x-check'];
    
    checkboxes.forEach(checkboxId => {
        const checkbox = document.getElementById(checkboxId);
        if (checkbox) {
            checkbox.addEventListener('change', function() {
                console.log(`${checkboxId} 상태 변경:`, this.checked);
                
                // 최소 하나는 선택되어야 함 (선택사항)
                const selectedCount = getSelectedPlatforms().length;
                console.log(`선택된 플랫폼 수: ${selectedCount}`);
                
                // 체크박스 애니메이션 효과
                if (this.checked) {
                    this.parentElement.style.transform = 'scale(1.05)';
                    setTimeout(() => {
                        this.parentElement.style.transform = 'scale(1)';
                    }, 200);
                }
            });
        }
    });
    
    // IF24 전용 키보드 단축키
    document.addEventListener('keydown', function(e) {
        // 현재 탭이 IF24일 때만 작동
        if (currentTab !== 'if24') return;
        
        // Ctrl+Enter로 전송
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            sendContent('if24');
        }
        
        // Ctrl+1,2,3으로 플랫폼 토글
        if (e.ctrlKey && ['1', '2', '3'].includes(e.key)) {
            e.preventDefault();
            const checkboxes = ['instagram-check', 'thread-check', 'x-check'];
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