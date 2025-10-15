// scripts/dudu.js

// Dudu 콘텐츠 전송
async function sendDuduContent(content, files, responseArea, sendBtn, responseCallback) {
    console.log('Dudu 콘텐츠 전송 시작');
    
    try {
        const webhookUrl = webhookSettings.dudu;
        
        if (!webhookUrl) {
            throw new Error('Dudu Webhook URL이 설정되지 않았습니다.');
        }
        
        console.log('Dudu Webhook URL:', webhookUrl);
        
        const optimizedContent = optimizeDuduContent(content);
        
        const formData = new FormData();
        formData.append('content', optimizedContent);
        formData.append('platform', 'dudu');
        formData.append('timestamp', new Date().toISOString());
        formData.append('source', 'AI_Content_Uploader');
        formData.append('tab', 'dudu');
        formData.append('contentType', 'social');
        formData.append('mood', analyzeDuduMood(content));
        
        if (files && files.length > 0) {
            formData.append('image_0', files[0]);
        }
        
        console.log('Dudu FormData 생성 완료, 웹훅 전송 시도...');
        
        const response = await fetch(webhookUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Platform': 'Dudu',
                'X-Source': 'AI-Content-Uploader',
                'X-Content-Type': 'social'
            }
        });
        
        console.log('Dudu 웹훅 응답 상태:', response.status, response.statusText);
        
        // ✅ 개선: 공통 응답 처리 함수 사용
        const result = await parseWebhookResponse(response);
        console.log('파싱된 응답:', result);
        
        if (response.ok) {
            const successResponse = {
                success: true,
                platform: 'dudu',
                result: result,
                timestamp: new Date().toISOString(),
                content: optimizedContent,
                fileCount: files ? files.length : 0,
                contentAnalysis: analyzeDuduContent(optimizedContent)
            };
            
            responseCallback(successResponse, 'Dudu 전송 완료');
        } else {
            throw new Error(`Dudu 웹훅 전송 실패: ${response.status} ${response.statusText}`);
        }
        
    } catch (error) {
        console.error('Dudu 전송 오류:', error);
        
        const errorResponse = {
            success: false,
            platform: 'dudu',
            error: error.message,
            timestamp: new Date().toISOString()
        };
        
        responseCallback(errorResponse);
    }
}

// Dudu 콘텐츠 최적화
function optimizeDuduContent(content) {
    let optimized = content;
    
    optimized = makeDuduFriendly(optimized);
    optimized = optimizeDuduEmojis(optimized);
    
    if (optimized.length > 3000) {
        optimized = optimized.substring(0, 2980) + '... 😊';
    }
    
    optimized = addDuduHashtags(optimized);
    
    return optimized;
}

// Dudu 친근한 톤 조정
function makeDuduFriendly(content) {
    let friendly = content;
    
    friendly = friendly.replace(/습니다\./g, '해요!');
    friendly = friendly.replace(/입니다\./g, '이에요!');
    friendly = friendly.replace(/했습니다\./g, '했어요!');
    
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
    
    const emojiCount = (content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length;
    
    if (emojiCount < 2) {
        const duduEmojis = ['😊', '💖', '✨', '🌟', '🎉', '👍', '🤗', '😄'];
        const randomEmoji = duduEmojis[Math.floor(Math.random() * duduEmojis.length)];
        optimized += ' ' + randomEmoji;
    }
    
    return optimized;
}

// Dudu 해시태그 추가
function addDuduHashtags(content) {
    let tagged = content;
    
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
    const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 50;
    
    const avgWordsPerSentence = sentences.reduce((acc, sentence) => {
        const words = sentence.trim().split(/\s+/).length;
        return acc + words;
    }, 0) / sentences.length;
    
    return Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 15) * 5));
}

// Dudu 친근함 점수 계산
function calculateDuduFriendliness(content) {
    let score = 50;
    
    const emojiCount = (content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length;
    score += Math.min(20, emojiCount * 5);
    
    if (content.includes('해요') || content.includes('이에요')) score += 15;
    
    const friendlyExpressions = ['안녕', '반가', '고마워', '감사해'];
    friendlyExpressions.forEach(expr => {
        if (content.includes(expr)) score += 5;
    });
    
    return Math.min(100, score);
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
    
    const duduTextarea = document.getElementById('dudu-content');
    if (duduTextarea) {
        let suggestionTimeout;
        
        duduTextarea.addEventListener('input', function() {
            clearTimeout(suggestionTimeout);
            
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
    
    document.addEventListener('keydown', function(e) {
        if (currentTab !== 'dudu') return;
        
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            sendContent('dudu');
        }
        
        if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            showDuduHelp();
        }
        
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            const content = document.getElementById('dudu-content').value;
            if (content) {
                const suggestions = suggestDuduImprovements(content);
                if (suggestions.length > 0) {
                    if (typeof showNotification === 'function') {
                        showNotification(suggestions.join(' '), 'info');
                    }
                } else {
                    if (typeof showNotification === 'function') {
                        showNotification('완벽해요! 👍', 'success');
                    }
                }
            }
        }
    });
    
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
- 친근하고 자연스러운 말투 사용
- 이모지 적극 활용 ✨
- 짧고 간단한 문장 구성
- 긍정적인 표현 사용 💖
- 일상적인 이야기 공유

단축키:
- Ctrl+Enter: 전송
- Ctrl+S: 개선 제안 보기
- Ctrl+H: 도움말 (지금 이거!)
    `;
    
    if (typeof showNotification === 'function') {
        showNotification(helpMessage, 'info');
    } else {
        alert(helpMessage);
    }
}

console.log('dudu.js 로드 완료');
