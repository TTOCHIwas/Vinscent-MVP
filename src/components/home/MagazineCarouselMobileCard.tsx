'use client';

import { useMemo } from 'react';
import { MagazinePublishCard } from '@/types';


interface MagazineCarouselMobileCardProps {
  magazine: MagazinePublishCard; 
  onClick?: (magazine: MagazinePublishCard) => void;
  onBrandClick?: (magazine: MagazinePublishCard) => void; 
}

const MagazineCarouselMobileCard: React.FC<MagazineCarouselMobileCardProps> = ({
  magazine,
  onClick,
  onBrandClick 
}) => {
  const formattedDate = useMemo(() => {
    const targetDate = magazine.publishedDate || magazine.createdDate;
    const now = new Date();
    const diffTime = now.getTime() - new Date(targetDate).getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    return `${Math.floor(diffDays / 30)}개월 전`;
  }, [magazine.publishedDate, magazine.createdDate]);

  //  Content Preview 생성 (클라이언트 사이드)
  const contentPreview = useMemo(() => {
    // brandTitle → brandName으로 변경
    const baseText = `${magazine.brandName}의 새로운 매거진을 확인해보세요. ${magazine.title}에 대한 자세한 내용과 다양한 이야기를 만나보실 수 있습니다.`;
    return baseText.length > 100 ? baseText.substring(0, 97) + '...' : baseText;
  }, [magazine.title, magazine.brandName]); //brandTitle → brandName

  const handleClick = () => {
    onClick?.(magazine);
  };

  // 브랜드 클릭 핸들러
  const handleBrandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (magazine.brandUrl) {
      // brandUrl이 있으면 새 탭에서 열기
      window.open(magazine.brandUrl, '_blank', 'noopener,noreferrer');
      console.log(`[DEBUG] Brand clicked: ${magazine.brandName} -> ${magazine.brandUrl}`);
    } else if (onBrandClick) {
      // 커스텀 핸들러가 있으면 실행
      onBrandClick(magazine);
    }
  };

  // 이미지 유효성 검증
  const hasValidImage = magazine.thumbnail?.imageUrl && 
                       magazine.thumbnail.imageUrl.trim() !== '';

  return (
    <li className="magazine-carousel-mobile__card">
      <div 
        className="magazine-carousel-mobile__image"
        onClick={handleClick}
        style={{
          backgroundImage: hasValidImage ? `url(${magazine.thumbnail.imageUrl})` : 'none'
        }}
        role="button"
        tabIndex={0}
        aria-label={`매거진: ${magazine.title} - ${magazine.brandName}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      />
      
      {/*  정보 영역 - 사용자 요구사항 레이아웃 */}
      <div className="magazine-carousel-mobile__info">
        {/* 브랜드 + 날짜 (한 줄) */}
        <div className="magazine-carousel-mobile__header">
          {/* 브랜드를 클릭 가능하게 변경 */}
          {magazine.brandUrl ? (
            <button
              className="magazine-carousel-mobile__brand magazine-carousel-mobile__brand--link"
              onClick={handleBrandClick}
              aria-label={`${magazine.brandName} 브랜드 사이트 방문`}
            >
              {magazine.brandName}
            </button>
          ) : (
            <span className="magazine-carousel-mobile__brand">
              {magazine.brandName}
            </span>
          )}
          <span className="magazine-carousel-mobile__date">{formattedDate}</span>
        </div>
        
        {/* 제목 */}
        <div className="magazine-carousel-mobile__title">{magazine.title}</div>
        
        {/* 미리보기 */}
        <div className="magazine-carousel-mobile__preview">
          {contentPreview}
        </div>
      </div>
    </li>
  );
};

export default MagazineCarouselMobileCard;