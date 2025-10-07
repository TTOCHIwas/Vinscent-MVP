import React, { useState } from 'react';
import { GripVertical, X, Link } from 'lucide-react';

interface ImageBlockProps {
  id: string;
  content: {
    imageUrl: string;
    imageSource: string;
  };
  onContentChange: (id: string, content: { imageUrl: string; imageSource: string }) => void;
  onDelete: (id: string) => void;
  // 🔧 onAddBlockAfter 제거: Enter 키 자동 블록 추가 기능 제거됨
}

/**
 * 이미지 블록 컴포넌트
 * 
 * URL 입력 방식의 이미지 블록 (출처 정보만)
 */
const ImageBlock: React.FC<ImageBlockProps> = ({
  id,
  content,
  onContentChange,
  onDelete
  // 🔧 onAddBlockAfter 제거: 사용하지 않는 props 제거
}) => {
  const [isEditing, setIsEditing] = useState(!content.imageUrl);
  const [urlError, setUrlError] = useState('');

  // URL 유효성 검사
  const validateImageUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const hasValidExtension = validExtensions.some(ext => 
        urlObj.pathname.toLowerCase().includes(ext)
      );
      return hasValidExtension || url.includes('unsplash') || url.includes('cloudinary');
    } catch {
      return false;
    }
  };

  // 이미지 URL 적용
  const handleUrlSubmit = () => {
    if (!content.imageUrl.trim()) {
      setUrlError('이미지 URL을 입력해주세요');
      return;
    }

    if (!validateImageUrl(content.imageUrl)) {
      setUrlError('올바른 이미지 URL을 입력해주세요');
      return;
    }

    setUrlError('');
    setIsEditing(false);
    // ✅ 자동 블록 추가 제거 - 사용자가 수동으로 추가
  };

  // 이미지 URL 변경
  const handleUrlChange = (url: string) => {
    onContentChange(id, { ...content, imageUrl: url });
    setUrlError('');
  };

  // 출처 변경
  const handleSourceChange = (source: string) => {
    onContentChange(id, { ...content, imageSource: source });
  };

  // 엔터키 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUrlSubmit();
    }
  };

  return (
    <div className="block-item">
      {/* 블록 핸들 */}
      <div className="block-handle">
        <GripVertical size={16} className="block-handle-icon" />
        <button
          onClick={() => onDelete(id)}
          className="block-delete-btn"
          title="블록 삭제"
        >
          <X size={14} />
        </button>
      </div>

      <div className="block-content">
        {isEditing ? (
          /* URL 입력 모드 */
          <div className="image-block-edit">
            <div className="image-url-input-group">
              <div className="image-url-input-wrapper">
                <Link className="image-url-icon" size={16} />
                <input
                  type="url"
                  value={content.imageUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="이미지 URL을 입력하세요..."
                  className={`image-url-input ${urlError ? 'image-url-input--error' : ''}`}
                  autoFocus
                />
              </div>
              <button
                onClick={handleUrlSubmit}
                className="image-url-submit"
                disabled={!content.imageUrl.trim()}
              >
                확인
              </button>
            </div>
            
            {urlError && (
              <div className="image-url-error">{urlError}</div>
            )}
            
            <div className="image-block-hint">
              💡 JPG, PNG, GIF, WebP 형식 지원 | Unsplash, 브랜드 공식 이미지 추천
            </div>
          </div>
        ) : (
          /* 이미지 표시 모드 */
          <div className="image-block-display">
            {/* 이미지 */}
            <div className="image-preview">
              <img
                src={content.imageUrl}
                alt="매거진 이미지"
                className="image-preview-img"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzI4NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPumXtOuzgOugqOuTnOqwgeq4uEpvQWo0NzwvdGV4dD48L3N2Zz4=';
                }}
              />
              
              {/* 이미지 편집 버튼 */}
              <button
                onClick={() => setIsEditing(true)}
                className="image-edit-btn"
                title="이미지 변경"
              >
                <Link size={14} />
              </button>
            </div>

            {/* 출처 입력 */}
            <div className="image-source-section">
              <input
                type="text"
                value={content.imageSource}
                onChange={(e) => handleSourceChange(e.target.value)}
                placeholder="이미지 출처 (선택사항)"
                className="image-source-input"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageBlock;