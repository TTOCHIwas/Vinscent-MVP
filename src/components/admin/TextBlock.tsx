import React, { useRef, useEffect } from 'react';
import { GripVertical, X } from 'lucide-react';

interface TextBlockProps {
  id: string;
  content: {
    markdown: string;
  };
  onContentChange: (id: string, content: { markdown: string }) => void;
  onDelete: (id: string) => void;
  // 🔧 onAddBlockAfter 제거: Enter 키 자동 블록 추가 기능 제거됨
}

/**
 * 텍스트 블록 컴포넌트
 * 
 * 마크다운 지원하는 텍스트 입력 블록
 */
const TextBlock: React.FC<TextBlockProps> = ({
  id,
  content,
  onContentChange,
  onDelete
  // 🔧 onAddBlockAfter 제거: 사용하지 않는 props 제거
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 자동 높이 조절
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(60, textarea.scrollHeight)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [content.markdown]);

  // 텍스트 변경 처리
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = { markdown: e.target.value };
    onContentChange(id, newContent);
  };

  // 키보드 이벤트 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 🔧 Enter 키 블록 추가 기능 제거 (ImageBlock과 일관성 유지)
    // Enter 키는 기본 동작(줄바꿈)만 수행
    
    // 빈 블록에서 Backspace로 삭제
    if (e.key === 'Backspace' && content.markdown === '') {
      e.preventDefault();
      onDelete(id);
    }
  };

  return (
    <div className="block-item">
      {/* 블록 핸들 (호버시 표시) */}
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

      {/* 텍스트 입력 영역 */}
      <div className="block-content">
        <textarea
          ref={textareaRef}
          value={content.markdown}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onInput={adjustHeight}
          placeholder="내용을 입력하세요... (마크다운 지원)"
          className="text-block-input"
          rows={1}
        />
      </div>

      {/* 마크다운 힌트 (포커스시 표시) */}
      <div className="block-hint">
        💡 **굵게**, *기울임*, # 제목, [링크](URL) 지원 | 마크다운 문법 사용 가능
      </div>
    </div>
  );
};

export default TextBlock;