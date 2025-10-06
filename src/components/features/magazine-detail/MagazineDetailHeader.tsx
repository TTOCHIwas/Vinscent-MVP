'use client';

import React from 'react';

/**
 * 매거진 상세 페이지 헤더 컴포넌트 (클라이언트 컴포넌트)
 * @description 카테고리, 제목, 부제목, 메타정보(작성자, 날짜, 조회수)를 표시합니다.
 */

interface MagazineDetailHeaderProps {
  title: string;
  subtitle?: string | null;
  category: 'official' | 'unofficial';
  authorName: string;
  authorUrl?: string | null;
  publishedDate?: Date | string | null;  // Date 객체 또는 문자열로 올 수 있음
  viewCount: number;
  className?: string;
}

const MagazineDetailHeader: React.FC<MagazineDetailHeaderProps> = ({
  title,
  subtitle,
  category,
  authorName,
  authorUrl,
  publishedDate,
  viewCount,
  className = ''
}) => {
  // 날짜 형식 안전 처리
  const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return '';
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return dateObj.toLocaleDateString('ko-KR');
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  //브랜드 URL 클릭 핸들러 (클라이언트 컴포넌트에서만 사용)
  const handleBrandClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!authorUrl) {
      e.preventDefault();
      return;
    }
    console.log(`[DEBUG] Brand URL clicked: ${authorUrl}`);
    // 외부 링크는 자동으로 새 탭에서 열림 (target="_blank")
  };
  
  return (
    <header className={`magazine-detail__header ${className}`}>
      <div className="magazine-detail__category">
        {category.toUpperCase()}
      </div>
      
      <h1 className="magazine-detail__title">
        {title}
      </h1>
      
      {subtitle && (
        <p className="magazine-detail__subtitle">
          {subtitle}
        </p>
      )}
      
      <div className="magazine-detail__meta">
        <div className="magazine-detail__author">
          {/* 브랜드 URL이 있으면 링크로, 없으면 일반 텍스트로 */}
          {authorUrl ? (
            <a 
              href={authorUrl} 
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleBrandClick}
              className="magazine-detail__author-link"
            >
              by {authorName}
            </a>
          ) : (
            <span>by {authorName}</span>
          )}
        </div>
        <div className="magazine-detail__date">
          <span>{formatDate(publishedDate)}</span>
        </div>
        <div className="magazine-detail__views">
          <span>조회수 {viewCount.toLocaleString()}</span>
        </div>
      </div>
    </header>
  );
};

export default MagazineDetailHeader;