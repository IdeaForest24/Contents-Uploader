// scripts/dudu.js

// Dudu 탭 전용 함수들

// Dudu 콘텐츠 전송
async function sendDuduContent(content, files, responseArea, sendBtn) {
    console.log('Dudu 콘텐츠 전송 시작');
    
    try {
        // Dudu Webhook URL 확인
        const webhookUrl = webhookSettings.dudu;
        
        if (!webhookUrl) {
            throw new Error('Dudu Webhook URL이 설정되지 않았습니다.');
        }
        
        console.log('Dudu Webhook URL:', webhookUrl);
        
        // Dudu 전용 콘텐츠 최적화
        const optimizedContent = optimizeDuduContent(content);
        
        // FormData 생성
        const formData = createFormData(optimizedContent, files, {
            platform: 'dudu',
            timestamp: new Date().toISOString(),
            source: 'AI_Content_Uploader',
            contentType: 'social',
            mood: analyzeDuduMood(content)
        });
        
        // 전송 시도
        const result = await sendDuduRequest(formData, webhookUrl);
        
        const response = {
            success: true,
            platform: 'dudu',
            result: result,
            timestamp: new Date().toISOString(),
            content: optimizedContent,
            fileCount: files.length,
            contentAnalysis: analyzeDuduContent(content)
        };
        
        handleResponse(response, responseArea, sendBtn, 'Dudu 전송 완료');
        
    } catch (error) {
        console.error('Dudu 전송 오류:', error);
        
        const errorResponse = {
            success: false,
            platform: 'dudu',
            error: error.message,
            timestamp: new Date().toISOString()
        };
        
        handleResponse(errorResponse, responseArea, sendBtn);
    }
}

// Dudu 콘텐츠 최적화
function optimizeDuduContent(content) {
    let optimized = content;
    
    // Dudu 플랫폼 특성에 맞는 최적화
    // 1. 친근하고 캐주얼한 톤 조정
    optimized = makeDuduFriendly(optimized);
    
    // 2. 이모지 최적화
    optimized = optimizeDuduEmojis(optimized);
    
    // 3. 길이 최적화 (3000자 제한)
    if (optimized.length > 3000) {
        optimized = optimized.substring(0, 2980) + '... 😊';
    }
    
    // 4. Dudu 스타일 해시태그 추가
    optimized = addDuduHashtags(optimized);
    
    return optimized;
}

// Dudu 친근한 톤 조정
function makeDuduFriendly(content) {
    let friendly = content;
    
    // 격식체를 반말로 변환 (간단한 패턴)
    friendly = friendly.replace(/습니다\./g, '해요!');
    friendly = friendly.replace(/입니다\./g, '이에요!');
    friendly = friendly.replace(/했습니다\./g, '했어요!');
    
    // 시작 부분에 친근한 인사 추가
    if (!friendly.match(/^(안녕|하이|헬로|hi)/i)) {
        const greetings = ['안녕하세요! 😊', '하이! 👋', '반가워요! ✨'];
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        friendly = randomGreeting + '\n\n' + friendly;
    }
    
    return friendly;
}

// Dudu 이모지 최적화
function optimizeDuduEmojis(content) {
    let optimized = content;
    
    // 이모지가 부족하면 추가
    const emojiCount = (content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length;
    
    if (emojiCount < 2) {
        const duduEmojis = ['😊', '💖', '✨', '🌟', '🎉', '💝', '🤗', '😄'];
        const randomEmoji = duduEmojis[Math.floor(Math.random() * duduEmojis.length)];
        optimized += ' ' + randomEmoji;
    }
    
    return optimized;
}

// Dudu 해시태그 추가
function addDuduHashtags(content) {
    let tagged = content;
    
    // 기본 Dudu 해시태그가 없으면 추가
    const duduTags = ['#dudu', '#일상', '#소통'];
    const hasDuduTag = duduTags.some(tag => content.toLowerCase().includes(tag.toLowerCase()));
    
    if (!hasDuduTag) {
        tagged += '\n\n#dudu #일상 #좋은하루';
    }
    
    return tagged;
}

// Dudu 무드 분석
function analyzeDuduMood(content) {
    const positiveWords = ['좋', '행복', '기쁨', '즐거', '사랑', '감사', '완벽', '최고'];
    const negativeWords = ['슬프', '힘들', '어렵', '걱정', '불안', '스트레스'];
    
    let positiveScore = 0;
    let negativeScore = 0;
    
    positiveWords.forEach(word => {
        const matches = content.match(new RegExp(word, 'g'));
        if (matches) positiveScore += matches.length;
    });
    
    negativeWords.forEach(word => {
        const matches = content.match(new RegExp(word, 'g'));
        if (matches) negativeScore += matches.length;
    });
    
    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
}

// Dudu 콘텐츠 분석
function analyzeDuduContent(content) {
    return {
        wordCount: content.split(/\s+/).length,
        emojiCount: (content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length,
        hashtagCount: (content.match(/#\w+/g) || []).length,
        mood: analyzeDuduMood(content),
        readabilityScore: calculateDuduReadability(content),
        friendlinessScore: calculateDuduFriendliness(content)
    };
}

// Dudu 가독성 점수 계산
function calculateDuduReadability(content) {
    const avgWordsPerSentence = content.split(/[.!?]/).reduce((acc, sentence) => {
        const words = sentence.trim().split(/\s+/).length;
        return acc + words;
    }, 0) / content.split(/[.!?]/).length;
    
    // 15단어 이하면 좋은 가독성
    return Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 15) * 5));
}

// Dudu 친근함 점수 계산
function calculateDuduFriendliness(content) {
    let score = 50; // 기본 점수
    
    // 이모지 사용
    const emojiCount = (content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length;
    score += Math.min(20, emojiCount * 5);
    
    // 반말 사용
    if (content.includes('해요') || content.includes('이에요')) score += 15;
    
    // 친근한 표현
    const friendlyExpressions = ['안녕', '반가', '고마워', '감사해'];
    friendlyExpressions.forEach(expr => {
        if (content.includes(expr)) score += 5;
    });
    
    return Math.min(100, score);
}

// Dudu 요청 전송
async function sendDuduRequest(formData, webhookUrl) {
    console.log('Dudu 요청 전송 시작');
    
    // 실제 환경에서는 실제 API 호출
    /*
    const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Platform': 'Dudu',
            'X-Source': 'AI-Content-Uploader',
            'X-Content-Type': 'social'
        }
    });
    
    if (!response.ok) {
        throw new Error(`Dudu API 오류: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
    */
    
    // 데모용 Mock 응답
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // 95% 확률로 성공 (Dudu는 관대한 플랫폼으로 설정)
            if (Math.random() > 0.05) {
                resolve({
                    success: true,
                    platform: 'dudu',
                    postId: `dudu_${Date.now()}`,
                    url: `https://dudu.com/post/${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    message: 'Dudu에 성공적으로 게시되었습니다! 😊',
                    engagement: {
                        expectedLikes: Math.floor(Math.random() * 50) + 10,
                        expectedComments: Math.floor(Math.random() * 20) + 5,
                        friendlinessScore: Math.floor(Math.random() * 30) + 70
                    }
                });
            } else {
                reject(new Error('Dudu API 오류: 네트워크 연결 문제'));
            }
        }, 800 + Math.random() * 1500); // 0.8-2.3초 지연 (빠른 플랫폼)
    });
}

// Dudu 콘텐츠 제안
function suggestDuduImprovements(content) {
    const analysis = analyzeDuduContent(content);
    const suggestions = [];
    
    if (analysis.emojiCount < 2) {
        suggestions.push('이모지를 더 추가해보세요! 😊✨');
    }
    
    if (analysis.friendlinessScore < 70) {
        suggestions.push('더 친근한 톤으로 작성해보세요!');
    }
    
    if (analysis.readabilityScore < 60) {
        suggestions.push('문장을 더 짧고 간단하게 만들어보세요.');
    }
    
    if (analysis.mood === 'negative') {
        suggestions.push('좀 더 긍정적인 표현을 사용해보세요! 💖');
    }
    
    return suggestions;
}

// Dudu 특화 이벤트 리스너들
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dudu 모듈 초기화');
    
    // Dudu 콘텐츠 실시간 분석 및 제안
    const duduTextarea = document.getElementById('dudu-content');
    if (duduTextarea) {
        let suggestionTimeout;
        
        duduTextarea.addEventListener('input', function() {
            clearTimeout(suggestionTimeout);
            
            // 1초 디바운스
            suggestionTimeout = setTimeout(() => {
                const content = this.value;
                if (content.length > 20) {
                    const suggestions = suggestDuduImprovements(content);
                    if (suggestions.length > 0) {
                        console.log('Dudu 개선 제안:', suggestions);
                    }
                }
            }, 1000);
        });
        
        // 포커스 시 친근한 플레이스홀더
        duduTextarea.addEventListener('focus', function() {
            if (this.placeholder === '본문 내용을 입력하세요...') {
                this.placeholder = '오늘 있었던 일을 친구에게 이야기하듯 써보세요! 😊';
            }
        });
        
        duduTextarea.addEventListener('blur', function() {
            if (this.placeholder === '오늘 있었던 일을 친구에게 이야기하듯 써보세요! 😊') {
                this.placeholder = '본문 내용을 입력하세요...';
            }
        });
    }
    
    // Dudu 전용 키보드 단축키
    document.addEventListener('keydown', function(e) {
        if (currentTab !== 'dudu') return;
        
        // Ctrl+Enter로 전송
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            sendContent('dudu');
        }
        
        // Ctrl+H로 도움말 표시
        if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            showDuduHelp();
        }
        
        // Ctrl+S로 제안 보기
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            const content = document.getElementById('dudu-content').value;
            if (content) {
                const suggestions = suggestDuduImprovements(content);
                if (suggestions.length > 0) {
                    showNotification(suggestions.join(' '), 'info');
                } else {
                    showNotification('완벽해요! 👍', 'success');
                }
            }
        }
    });
    
    // Dudu 탭 활성화 시 특별 효과
    const duduTab = document.querySelector('[onclick="switchTab(\'dudu\')"]');
    if (duduTab) {
        duduTab.addEventListener('click', function() {
            setTimeout(() => {
                console.log('Dudu 모드 활성화 - 친근하고 따뜻한 소통 모드 😊');
            }, 100);
        });
    }
    
    console.log('Dudu 모듈 초기화 완료');
});

// Dudu 도움말 표시
function showDuduHelp() {
    const helpMessage = `
Dudu 작성 팁! 😊
• 친근하고 자연스러운 말투 사용
• 이모지 적극 활용 ✨
• 짧고 간단한 문장 구성
• 긍정적인 표현 사용 💖
• 일상적인 이야기 공유

단축키:
• Ctrl+Enter: 전송
• Ctrl+S: 개선 제안 보기
• Ctrl+H: 도움말 (지금 이거!)
    `;
    
    showNotification(helpMessage, 'info');
}

console.log('dudu.js 로드 완료');