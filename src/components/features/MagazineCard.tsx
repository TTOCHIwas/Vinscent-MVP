'use client';

import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { MagazinePublishCard } from '@/types';
import {formatDate} from '../../utils/formatDate';
import {formatRelativeTime} from '../../utils/formatRelativeTime';
import { Eye } from 'lucide-react';

// ===== Props 타입 정의 =====
export interface MagazineCardProps {
  magazine: MagazinePublishCard;
  onImageClick?: (magazine: MagazinePublishCard) => void;
  onLinkClick?: (magazine: MagazinePublishCard) => void;
  onBrandClick?: (magazine: MagazinePublishCard) => void;
  loading?: boolean;
  className?: string;
  showBrand?: boolean;
  showDate?: boolean;
  showViews?: boolean;
  layout?: 'vertical' | 'horizontal';
  useRelativeTime?: boolean;
}

const MagazineCardRoot: React.FC<MagazineCardProps> = ({
  magazine,
  onImageClick,
  onLinkClick,
  onBrandClick,
  loading = false,
  className = '',
  showBrand = true,
  showDate = true,
  showViews = true,
  layout = 'vertical',
  useRelativeTime = true,
}) => {
  // 이미지 클릭 핸들러
  const handleImageClick = () => {
    if (!loading && onImageClick) {
      onImageClick(magazine);
    }
  };

  // 링크 클릭 핸들러
  const handleLinkClick = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!loading && onLinkClick) {
      onLinkClick(magazine);
    }
  };

  // 브랜드 클릭 핸들러
  const handleBrandClick = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!loading && magazine.brandUrl) {
      // brandUrl이 있으면 새 탭에서 열기
      window.open(magazine.brandUrl, '_blank', 'noopener,noreferrer');
      console.log(`[DEBUG] Brand clicked: ${magazine.brandName} -> ${magazine.brandUrl}`);
    } else if (onBrandClick) {
      // 커스텀 핸들러가 있으면 실행
      onBrandClick(magazine);
    }
  };

  // 키보드 접근성 지원
  const handleImageKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleImageClick();
    }
  };

  const handleLinkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleLinkClick(e);
    }
  };

  const handleBrandKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleBrandClick(e);
    }
  };

  // 로딩 스켈레톤
  if (loading) {
    return (
      <Card 
        type="magazine"
        horizontal={layout === 'horizontal'}
        className={`card--magazine magazine-card--${layout} is-loading ${className}`}
      >
        <div className="magazine-card__image-clickable" />
        <div className="magazine-card__content-static">
          <div className="magazine-card__meta" />
          <div className="magazine-card__title" />
          <div className="magazine-card__subtitle" />
        </div>
      </Card>
    );
  }

  // 썸네일 이미지 URL
  const thumbnailImageUrl = magazine.thumbnail?.imageUrl;

  return (
    <Card 
      type="magazine"
      horizontal={layout === 'horizontal'}
      className={`card--magazine card--${layout} ${className}`}
    >
      {/* 이미지 영역 - 호버 가능 */}
      <div
        className="card__media card__media--hoverable"
        onClick={handleImageClick}
        onKeyDown={handleImageKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`${magazine.title} 매거진 보기`}
      >
        {thumbnailImageUrl ? (
          <img
            src={thumbnailImageUrl}
            alt={magazine.title}
            loading="lazy"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.remove();
              const parent = img.parentElement;
              if (parent) {
                parent.insertAdjacentHTML(
                  'beforeend',
                  `<div class="card__no-image"><span>매거진</span></div>`
                );
              }
            }}
          />
        ) : (
          <div className="card__no-image">
            <span>매거진 이미지</span>
          </div>
        )}

        {/* 호버 시 나타나는 콘텐츠 오버레이 */}
        <div className="card__content-overlay">
          {/* 상단 그룹: 브랜드명 + 날짜 */}
          <div className="card__overlay-group card__overlay-group--top">
            {(showBrand || showDate) && (
              <div className="card__meta">
                {showBrand && magazine.brandName && (
                  <>
                    {magazine.brandUrl ? (
                      <button
                        className="card__brand card__brand--link"
                        onClick={handleBrandClick}
                        onKeyDown={handleBrandKeyDown}
                        aria-label={`${magazine.brandName} 브랜드 사이트 방문`}
                      >
                        {magazine.brandName}
                      </button>
                    ) : (
                      <span className="card__brand">
                        {magazine.brandName}
                      </span>
                    )}
                  </>
                )}

                {/* 날짜 정보 */}
                {showDate && (magazine.publishedDate || magazine.createdDate) && (
                  <span className="card__date">
                    {useRelativeTime 
                      ? formatRelativeTime(magazine.publishedDate || magazine.createdDate)
                      : formatDate(magazine.publishedDate || magazine.createdDate)
                    }
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 중단 그룹: 제목 + 부제목 */}
          <div className="card__overlay-group card__overlay-group--middle">
            {/* 매거진 제목 */}
            <h3 className="card__title">
              {magazine.title}
            </h3>

            {/* 매거진 부제목 */}
            {magazine.subtitle && (
              <p className="card__subtitle card__subtitle--truncate">
                {magazine.subtitle}
              </p>
            )}
          </div>

          {/* 하단 그룹: 조회수 + MORE 버튼 */}
          <div className="card__overlay-group card__overlay-group--bottom">
            <div className="card__overlay-bottom-content">
              {/* 조회수 표시 */}
              {showViews && (
                <div className="card__views">
                  <Eye className="card__views-icon" size={16} />
                  <span>{magazine.viewCount.toLocaleString()}</span>
                </div>
              )}

              {/* MORE 버튼 */}
              <Button
                as="a"
                variant="link"
                size="xxs"
                className="card__link"
                href="#"
                onClick={handleLinkClick}
                onKeyDown={handleLinkKeyDown}
                aria-label={`${magazine.title} 매거진 자세히 보기`}
              >
                MORE
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일/태블릿용 기존 콘텐츠 영역 (데스크톱에서 숨김) */}
      <div className="card__content-static card__content-static--mobile-only">
        {/* 메타 정보 */}
        {(showBrand || showDate) && (
          <div className="card__meta">
            {showBrand && magazine.brandName && (
              <>
                {magazine.brandUrl ? (
                  <button
                    className="card__brand card__brand--link"
                    onClick={handleBrandClick}
                    onKeyDown={handleBrandKeyDown}
                    aria-label={`${magazine.brandName} 브랜드 사이트 방문`}
                  >
                    {magazine.brandName}
                  </button>
                ) : (
                  <span className="card__brand">
                    {magazine.brandName}
                  </span>
                )}
              </>
            )}

            {/* 날짜 정보 */}
            {showDate && (magazine.publishedDate || magazine.createdDate) && (
              <span className="card__date">
                {useRelativeTime 
                  ? formatRelativeTime(magazine.publishedDate || magazine.createdDate)
                  : formatDate(magazine.publishedDate || magazine.createdDate)
                }
              </span>
            )}
          </div>
        )}

        {/* 매거진 제목 */}
        <h3 className="card__title">
          {magazine.title}
        </h3>

        {/* 매거진 부제목 */}
        {magazine.subtitle && (
          <p className="card__subtitle">
            {magazine.subtitle}
          </p>
        )}

        {/* 조회수 표시 */}
        {showViews && (
          <div className="card__views">
            <Eye className="card__views-icon" size={16} />
            <span>{magazine.viewCount.toLocaleString()}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

// ===== 스켈레톤 컴포넌트 =====
interface MagazineCardSkeletonProps {
  className?: string;
  layout?: 'vertical' | 'horizontal';
}

const MagazineCardSkeleton: React.FC<MagazineCardSkeletonProps> = ({ 
  className = '', 
  layout = 'vertical'
}) => (
  <MagazineCardRoot
    magazine={{
      id: 0,
      title: '',
      subtitle: '',
      brandName: '',
      brandUrl: null,
      viewCount: 0,
      category: 'official',
      publishedDate: new Date(),
      createdDate: new Date(),
      updatedDate: new Date(),
      thumbnail: {
        id: 0,
        imageUrl: '',
        imageOrder: 1,
        magazineId: 0,
      }
    } as MagazinePublishCard}
    loading={true}
    className={className}
    layout={layout}
  />
);

// ===== 매거진 카드 그리드 =====
interface MagazineCardGridProps {
  magazines: MagazinePublishCard[];
  onMagazineImageClick?: (magazine: MagazinePublishCard) => void;
  onMagazineLinkClick?: (magazine: MagazinePublishCard) => void;
  onBrandClick?: (magazine: MagazinePublishCard) => void;
  loading?: boolean;
  loadingCount?: number;
  layout?: 'vertical' | 'horizontal';
  className?: string;
  showBrand?: boolean;
  showDate?: boolean;
  showViews?: boolean;
}

const MagazineCardGrid: React.FC<MagazineCardGridProps> = ({
  magazines,
  onMagazineImageClick,
  onMagazineLinkClick,
  onBrandClick, 
  loading = false,
  loadingCount = 9,
  layout = 'vertical',
  className = '',
  showBrand = true,
  showDate = true,
  showViews = true,
}) => {
  if (loading) {
    return (
      <Card.Grid className={className}>
        {[...Array(loadingCount)].map((_, index) => (
          <MagazineCardSkeleton key={index} layout={layout} />
        ))}
      </Card.Grid>
    );
  }

  return (
    <Card.Grid className={className}>
      {magazines.map((magazine) => (
        <MagazineCard
          key={magazine.id}
          magazine={magazine}
          onImageClick={onMagazineImageClick}
          onLinkClick={onMagazineLinkClick}
          onBrandClick={onBrandClick}
          layout={layout}
          showBrand={showBrand}
          showDate={showDate}
          showViews={showViews}
        />
      ))}
    </Card.Grid>
  );
};

// ===== 매거진 피드 =====
interface MagazineFeedProps {
  magazines: MagazinePublishCard[];
  onMagazineImageClick?: (magazine: MagazinePublishCard) => void;
  onMagazineLinkClick?: (magazine: MagazinePublishCard) => void;
  onBrandClick?: (magazine: MagazinePublishCard) => void;
  loading?: boolean;
  className?: string;
  showBrand?: boolean;
  showDate?: boolean;
  showViews?: boolean;
}

const MagazineFeed: React.FC<MagazineFeedProps> = ({
  magazines,
  onMagazineImageClick,
  onMagazineLinkClick,
  onBrandClick,
  loading = false,
  className = '',
  showBrand = true,
  showDate = true,
  showViews = true,
}) => {
  if (loading) {
    return (
      <div className={`magazine-feed ${className}`}>
        {[...Array(3)].map((_, index) => (
          <MagazineCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className={`magazine-feed ${className}`}>
      {magazines.map((magazine) => (
        <MagazineCard
          key={magazine.id}
          magazine={magazine}
          onImageClick={onMagazineImageClick}
          onLinkClick={onMagazineLinkClick}
          onBrandClick={onBrandClick}
          useRelativeTime
          showBrand={showBrand}
          showDate={showDate}
          showViews={showViews}
        />
      ))}
    </div>
  );
};

// ===== Compound Component 구성 =====
const MagazineCard = Object.assign(MagazineCardRoot, {
  Skeleton: MagazineCardSkeleton,
  Grid: MagazineCardGrid,
  Feed: MagazineFeed,
});

export default MagazineCard;