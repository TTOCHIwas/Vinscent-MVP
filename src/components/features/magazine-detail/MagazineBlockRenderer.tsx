'use client';

import React from 'react';
import { MagazineBlockDisplay } from '@/types';

interface MagazineBlockRendererProps {
  blocks: MagazineBlockDisplay[];
  magazineTitle: string;
}

const MagazineBlockRenderer: React.FC<MagazineBlockRendererProps> = ({
  blocks,
  magazineTitle
}) => {
  console.log('[DEBUG] Rendering blocks:', blocks.length, blocks);
  
  // 블록을 order 순서대로 정렬
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  // 간단한 마크다운 렌더링 함수
  const renderMarkdown = (text: string): string => {
    if (!text) return '';
    
    return text
      // **굵게** → <strong>굵게</strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // *기울임* → <em>기울임</em>
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // ### 소제목 → <h3>소제목</h3>
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      // ## 부제목 → <h2>부제목</h2>  
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      // # 제목 → <h1>제목</h1>
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // [링크텍스트](URL) → <a href="URL">링크텍스트</a>
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // \n → <br>
      .replace(/\n/g, '<br>');
  };

  return (
    <main className="magazine-detail__main">
      <div className="magazine-detail__content">
        
        {/* 블록을 순서대로 렌더링 */}
        {sortedBlocks.map((block) => {
          console.log('[DEBUG] Rendering block:', block.id, block.type, block.content);
          
          // 텍스트 블록 렌더링
          if (block.type === 'text' && block.content?.markdown) {
            return (
              <section 
                key={`text-${block.id}`}
                className="magazine-detail__section"
              >
                <div 
                  className="magazine-detail__section-content"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(block.content.markdown)
                  }}
                />
              </section>
            );
          }
          
          // 이미지 블록 렌더링  
          if (block.type === 'image' && block.content?.imageUrl) {
            return (
              <section 
                key={`image-${block.id}`}
                className="magazine-detail__section magazine-detail__section--image"
              >
                <figure className="magazine-detail__image-container">
                  <img
                    src={block.content.imageUrl}
                    alt={`${magazineTitle} 이미지`}
                    className="magazine-detail__image"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/magazine-fallback.jpg';
                    }}
                  />
                  {block.content.imageSource && (
                    <figcaption className="magazine-detail__image-caption">
                      <span className="magazine-detail__image-source">
                        출처: {block.content.imageSource}
                      </span>
                    </figcaption>
                  )}
                </figure>
              </section>
            );
          }
          
          // ⚠️ 알 수 없는 블록 타입 또는 빈 콘텐츠
          console.warn('[WARNING] Unknown or empty block:', block);
          return (
            <section 
              key={`unknown-${block.id}`}
              className="magazine-detail__section"
            >
              <div className="magazine-detail__section-content">
                <p style={{ color: '#999', fontStyle: 'italic' }}>
                  [알 수 없는 블록 타입: {block.type || 'undefined'}]
                </p>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
};

export default MagazineBlockRenderer;