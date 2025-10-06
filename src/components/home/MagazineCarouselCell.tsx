'use client';

import { MagazinePublishCard } from '@/types';

/**
 * MagazineCarouselCell 컴포넌트
 */

interface MagazineCarouselCellProps {
  magazine?: MagazinePublishCard; // magazine이 없을 수도 있음
  isCenter: boolean;
  onClick?: (magazine: MagazinePublishCard) => void;
  onBrandClick?: (magazine: MagazinePublishCard) => void;
}

const MagazineCarouselCell: React.FC<MagazineCarouselCellProps> = ({
  magazine,
  isCenter,
  onClick,
  onBrandClick
}) => {
  // magazine이 undefined인 경우 빈 셀 렌더링
  if (!magazine) {
    return (
      <li className="magazine-carousel3d__cell magazine-carousel3d__cell--empty">
        <div className="magazine-carousel3d__image-area magazine-carousel3d__image-area--empty" />
      </li>
    );
  }

  // 개선된 클릭 핸들러 (이벤트 전파 제어)
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 부모의 마우스 이벤트와 충돌 방지
    
    console.log(`[DEBUG] Cell clicked: ${magazine.title} (Center: ${isCenter})`);
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

  // 키보드 접근성 핸들러
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation(); // 키보드 이벤트도 전파 방지
      onClick?.(magazine);
    }
  };

  // 이미지 유효성 검증
  const hasValidImage = magazine.thumbnail?.imageUrl && 
                       magazine.thumbnail.imageUrl.trim() !== '';

  const cellClasses = [
    'magazine-carousel3d__cell',
    isCenter && 'magazine-carousel3d__cell--center',
    hasValidImage ? 'magazine-carousel3d__cell--has-image' : 'magazine-carousel3d__cell--no-image'
  ].filter(Boolean).join(' ');

  return (
    <li className={cellClasses}>
      <div 
        className="magazine-carousel3d__image-area"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        style={{
          backgroundImage: hasValidImage ? `url(${magazine.thumbnail.imageUrl})` : 'none'
        }}
        role="button"
        tabIndex={0}
        aria-label={`매거진: ${magazine.title} - ${magazine.brandName}${isCenter ? ' (중앙)' : ''}`} // 🔧 brandTitle → brandName
      >
        {/* 중앙 셀 표시자 (접근성) */}
        {isCenter && (
          <div className="magazine-carousel3d__center-indicator" aria-hidden="true">
            {/* CSS로 시각적 표시 */}
          </div>
        )}
      </div>
      
      {/* 중앙 셀만 제목/브랜드 표시 + 브랜드 클릭 기능 */}
      <div className={`magazine-carousel3d__info ${!isCenter ? 'magazine-carousel3d__info--hidden' : ''}`}>
        <div className="magazine-carousel3d__info-title">{magazine.title}</div>
        
        {magazine.brandUrl ? (
          <button
            className="magazine-carousel3d__info-brand magazine-carousel3d__info-brand--link"
            onClick={handleBrandClick}
            aria-label={`${magazine.brandName} 브랜드 사이트 방문`}
          >
            {magazine.brandName}
          </button>
        ) : (
          <div className="magazine-carousel3d__info-brand">
            {magazine.brandName}
          </div>
        )}
      </div>
    </li>
  );
};

export default MagazineCarouselCell;