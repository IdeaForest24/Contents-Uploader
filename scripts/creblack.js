/* styles/creblack.css */

/* CreBlack 탭 특화 스타일 - 보라색 테마로 통일 */
#creblack-tab {
    background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
    border-radius: 8px;
    padding: 20px;
}

/* ✅ 수정 2: CreBlack 플랫폼 선택 스타일 추가 */
#creblack-tab .platform-selection {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(102, 126, 234, 0.1);
    border-left: 4px solid #667eea;
    margin-bottom: 25px;
}

#creblack-tab .checkbox-label {
    background: #f8f9ff;
    border: 1px solid #e0e7ff;
    border-radius: 8px;
    padding: 12px 16px;
    transition: all 0.3s ease;
}

#creblack-tab .checkbox-label:hover {
    background: #f0f2ff;
    border-color: #667eea;
    transform: translateY(-1px);
}

#creblack-tab .checkbox-label input:checked + span {
    color: #667eea;
    font-weight: 600;
}

/* CreBlack 업로드 영역 */
#creblack-upload {
    border-color: #c7d2fe;
    background: linear-gradient(135deg, #f8faff 0%, #f0f2ff 100%);
}

#creblack-upload:hover,
#creblack-upload.dragover {
    border-color: #667eea;
    background: linear-gradient(135deg, #f0f2ff 0%, #e0e7ff 100%);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
}

#creblack-upload .upload-placeholder span {
    color: #667eea;
}

#creblack-upload .upload-placeholder p {
    color: #9ca3af;
}

/* CreBlack 파일 아이템 스타일 */
#creblack-file-list .file-item {
    border-left: 3px solid #667eea;
    background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
    color: #2d3748;
    border-color: #c7d2fe;
}

#creblack-file-list .file-name {
    color: #2d3748;
}

#creblack-file-list .file-remove {
    background: #dc3545;
    border: 1px solid #dc3545;
}

#creblack-file-list .file-remove:hover {
    background: #c82333;
}

/* CreBlack 텍스트 영역 */
#creblack-content {
    border: 2px solid #e0e7ff;
    background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
    color: #2d3748;
}

#creblack-content::placeholder {
    color: #9ca3af;
}

#creblack-content:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* CreBlack 응답 영역 */
#creblack-response {
    background: linear-gradient(135deg, #f8faff 0%, #f0f2ff 100%);
    border: 1px solid #e0e7ff;
    border-left: 4px solid #667eea;
    color: #2d3748;
}

/* CreBlack 전송 버튼 */
#creblack-tab .send-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
}

#creblack-tab .send-btn:hover {
    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
}

/* CreBlack 초기화 버튼 */
#creblack-tab .reset-btn {
    background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-right: 10px;
}

#creblack-tab .reset-btn:hover {
    background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(107, 114, 128, 0.3);
}

/* CreBlack 로딩 상태 */
#creblack-tab .send-btn.loading {
    background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
}

/* CreBlack 성공/에러 상태 */
#creblack-response.success {
    background: linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%);
    border-left-color: #38a169;
    color: #2d3748;
}

#creblack-response.error {
    background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
    border-left-color: #e53e3e;
    color: #2d3748;
}

/* CreBlack 특별 효과 */
#creblack-tab .upload-area::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(102, 126, 234, 0.1) 50%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
}

#creblack-tab .upload-area:hover::before {
    opacity: 1;
}

/* CreBlack 탭 활성화 효과 */
.tab-btn[onclick="switchTab('creblack')"].active {
    background: white;
    color: #495057;
    border-bottom-color: #667eea;
}

/* ✅ 수정 2: CreBlack 플랫폼 선택 상태 표시 */
#creblack-tab .checkbox-label input:checked {
    animation: checkPulse 0.3s ease-in-out;
}

@keyframes checkPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
}

/* CreBlack 애니메이션 */
#creblack-tab .send-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
}

#creblack-tab .send-btn:hover::before {
    left: 100%;
}