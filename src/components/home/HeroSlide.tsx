'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MagazinePublishCard } from '@/types';
import Button from '../ui/Button';
import { useSlideCarousel } from '@/hooks/useSlideTimer';

interface HeroSlideProps {
  magazines: MagazinePublishCard[];
  onSlideClick?: (magazine: MagazinePublishCard) => void;
  onBrandClick?: (magazine: MagazinePublishCard) => void;
  autoSlideInterval?: number; // milliseconds
  className?: string;
  loading?: boolean;
}

export const HeroSlide: React.FC<HeroSlideProps> = ({
  magazines,
  onSlideClick,
  onBrandClick,
  autoSlideInterval = 8000,
  className = '',
  loading = false,
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState<boolean[]>([]);
  
  const SLIDE_CONFIG = {
    SWIPE_THRESHOLD: 50
  } as const;
  
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const navigationRef = useRef<HTMLDivElement>(null);
  
  const carousel = useSlideCarousel({
    slidesCount: magazines.length,
    interval: autoSlideInterval,
    onSlideChange: () => {},
    autoStart: true,
    enabled: !loading && magazines.length > 1,
  });

  const currentMagazine = magazines[carousel.currentIndex] || magazines[0];

  useEffect(() => {
    if (magazines.length > 0) {
      setIsImageLoaded(new Array(magazines.length).fill(false));
    }
  }, [magazines]);
  
  const handleImageLoad = (index: number) => {
    setIsImageLoaded(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };
  
  const handleLeftClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    carousel.goToPrev();
  }, [carousel]);
  
  const handleRightClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    carousel.goToNext();
  }, [carousel]);
  
  // 브랜드 클릭 핸들러
  const handleBrandClick = useCallback((e: React.MouseEvent, magazine: MagazinePublishCard) => {
    e.preventDefault();
    e.stopPropagation(); // 슬라이드 네비게이션과 충돌 방지
    
    if (magazine.brandUrl) {
      // brandUrl이 있으면 새 탭에서 열기
      window.open(magazine.brandUrl, '_blank', 'noopener,noreferrer');
      console.log(`[DEBUG] HeroSlide brand clicked: ${magazine.brandName} -> ${magazine.brandUrl}`);
    } else if (onBrandClick) {
      // 커스텀 핸들러가 있으면 실행
      onBrandClick(magazine);
    }
  }, [onBrandClick]);

  const handleMouseEnter = useCallback(() => {
    carousel.actions.pause();
  }, [carousel.actions]);

  const handleMouseLeave = useCallback(() => {
    carousel.actions.resume();
  }, [carousel.actions]);
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);
  
  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > SLIDE_CONFIG.SWIPE_THRESHOLD;
    const isRightSwipe = distance < -SLIDE_CONFIG.SWIPE_THRESHOLD;
    
    if (isLeftSwipe) {
      carousel.goToNext();
    } else if (isRightSwipe) {
      carousel.goToPrev();
    }
    
    // 초기화
    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, carousel, SLIDE_CONFIG.SWIPE_THRESHOLD]);

  const renderProgressBar = () => {
    if (magazines.length <= 1) return null;
    const slideWidth = 100 / magazines.length;
    const currentPosition = carousel.currentIndex * slideWidth;
    
    return (
      <div className="hero-slide__progress-container">
        <div className="hero-slide__progress-track">
          <div className="hero-slide__progress-background" />
          
          <div 
            className="hero-slide__progress-bar"
            style={{
              width: `${slideWidth}%`,
              left: `${currentPosition}%`,
            }}
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`hero-slide hero-slide--loading ${className}`}>
        <div className="hero-slide__container">
          <div className="hero-slide__slide">
            <div className="hero-slide__image-skeleton" />
            <div className="hero-slide__content">
              <div className="hero-slide__brand-skeleton" />
              <div className="hero-slide__title-skeleton" />
              <div className="hero-slide__subtitle-skeleton" />
            </div>
          </div>
        </div>
        
        <div className="hero-slide__section-gap" />
        
        <div className="hero-slide__progress-section">
        </div>
      </div>
    );
  }
  
  if (!magazines || magazines.length === 0) {
    return (
      <div className={`hero-slide hero-slide--empty ${className}`}>
        <div className="hero-slide__container">
          <div className="hero-slide__empty-message">
            <h3>매거진을 준비 중입니다</h3>
            <p>곧 새로운 콘텐츠로 찾아뵙겠습니다.</p>
          </div>
        </div>
        
        <div className="hero-slide__section-gap" />
        
        <div className="hero-slide__progress-section">
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`hero-slide ${className}`}
      tabIndex={0}
      role="region"
      aria-label="매거진 슬라이드"
      aria-live="polite"
    >
      <div className="hero-slide__container">
        <div className="hero-slide__slides">
          {magazines.map((magazine, index) => (
            <div
              key={magazine.id}
              className={`hero-slide__slide ${
                index === carousel.currentIndex ? 'hero-slide__slide--active' : ''
              } ${
                isImageLoaded[index] ? 'hero-slide__slide--loaded' : ''
              }`}
              role="presentation"
            >
              <img
                src={magazine.thumbnail.imageUrl}
                alt={magazine.title}
                className="hero-slide__image"
                loading={index === 0 ? "eager" : "lazy"}
                onLoad={() => handleImageLoad(index)}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = 'https://i.pinimg.com/736x/be/3d/c7/be3dc7398dcbbf4f296c92aa9f540575.jpg';
                }}
              />
              
              <div className="hero-slide__overlay" />
              <div 
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="hero-slide__content"
              >
                <div className="hero-slide__content-inner">
                  {magazine.brandUrl ? (
                    <button
                      className="hero-slide__brand hero-slide__brand--link"
                      onClick={(e) => handleBrandClick(e, magazine)}
                      aria-label={`${magazine.brandName} 브랜드 사이트 방문`}
                    >
                      {magazine.brandName}
                    </button>
                  ) : (
                    <div className="hero-slide__brand">
                      {magazine.brandName}
                    </div>
                  )}
                  
                  <h2 className="hero-slide__title">
                    {magazine.title}
                  </h2>
                  
                  {magazine.subtitle && (
                    <p className="hero-slide__subtitle">
                      {magazine.subtitle}
                    </p>
                  )}
                  <Button
                    as="a"
                    variant="link"
                    size="sm"
                    className="hero-slide__cta"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSlideClick?.(currentMagazine);
                    }}
                    aria-label={`${magazine.title} 매거진 자세히 보기`}
                  >
                    MORE
                  </Button>
                </div>
              </div>

              <div 
                ref={navigationRef}
                className="hero-slide__navigation"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <button
                  className="hero-slide__nav-left"
                  onClick={handleLeftClick}
                  aria-label="이전 슬라이드"
                  type="button"
                />
                
                <button
                  className="hero-slide__nav-right"
                  onClick={handleRightClick}
                  aria-label="다음 슬라이드"
                  type="button"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="hero-slide__progress-section">
        {renderProgressBar()}
      </div>
    </div>
  );
};

interface HeroSlideSkeletonProps {
  className?: string;
}

export const HeroSlideSkeleton: React.FC<HeroSlideSkeletonProps> = ({
  className = ''
}) => (
  <HeroSlide
    magazines={[]}
    loading={true}
    className={className}
  />
);

export default HeroSlide;