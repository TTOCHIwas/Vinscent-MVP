'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import MagazineCarouselCell from './MagazineCarouselCell';
import MagazineCarouselMobileCard from './MagazineCarouselMobileCard';
import { MagazinePublishCard } from '@/types';

interface MagazineCarousel3DProps {
  magazines: MagazinePublishCard[];
  className?: string;
  onCellClick?: (magazine: MagazinePublishCard) => void;
  onBrandClick?: (magazine: MagazinePublishCard) => void;
}

/**
 * Hydration 안전 모바일 감지 Hook
 */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return isMobile;
};

const MagazineCarousel3D: React.FC<MagazineCarousel3DProps> = ({
  magazines,
  className = '',
  onCellClick,
  onBrandClick
}) => {
  const carouselRef = useRef<HTMLUListElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // 드래그/클릭 구분을 위한 상태
  const [dragState, setDragState] = useState({
    startX: 0,
    startTime: 0,
    isDragging: false,
  });

  const isMobile = useIsMobile();

  // 최단 경로 계산 함수 (완전히 새로운 접근!)
  const getShortestPath = (current: number, target: number) => {
    const directDistance = Math.abs(target - current);       // 직진 거리
    const reverseDistance = CAROUSEL_CONFIG.CELL_COUNT - directDistance; // 반대방향 거리
    
    if (directDistance <= reverseDistance) {
      // 직진이 더 가깝거나 같음
      return target;
    } else {
      // 반대방향이 더 가깝음
      if (target > current) {
        // target이 더 클 때: 역방향으로 가야 함
        return current - reverseDistance;
      } else {
        // target이 더 작을 때: 순방향으로 가야 함
        return current + reverseDistance;
      }
    }
  };
  const CAROUSEL_CONFIG = {
    CELL_COUNT: 16,
    CELL_WIDTH: 200,
    SCALE: 0.856,
    SWIPE_THRESHOLD: 30,
    CLICK_TIME_THRESHOLD: 200,
  } as const;

  const degY = 360 / CAROUSEL_CONFIG.CELL_COUNT;
  const normalizedIndex = ((selectedIndex % CAROUSEL_CONFIG.CELL_COUNT) + CAROUSEL_CONFIG.CELL_COUNT) % CAROUSEL_CONFIG.CELL_COUNT; 
  const centerIndex = normalizedIndex;

  // 중앙 셀인지 확인하는 함수
  const isCenterCell = (cellIndex: number): boolean => {
    return cellIndex === centerIndex;
  };

  // 셀 클릭 핸들러 (중앙 셀만 상세 페이지 이동)
  const handleCellClick = (magazine: MagazinePublishCard, cellIndex: number) => {
    // 드래그 중이었다면 클릭 무시
    if (dragState.isDragging) return;
    
    if (isCenterCell(cellIndex)) {
      // 중앙 셀 클릭: 상세 페이지로 이동
      console.log('[DEBUG] Center cell clicked:', magazine.title);
      onCellClick?.(magazine);
    } else {
      // 중앙이 아닌 셀 클릭: 최단 경로로 회전
      console.log('[DEBUG] Non-center cell clicked, rotating via shortest path');
      const shortestIndex = getShortestPath(selectedIndex, cellIndex);
      console.log(`[DEBUG] Current: ${selectedIndex}, Target: ${cellIndex}, Shortest: ${shortestIndex}`);
      
      setSelectedIndex(shortestIndex);
      
      if (carouselRef.current) {
        const angle = degY * shortestIndex;
        carouselRef.current.style.transform = `translateZ(var(--magazine-carousel3d-translate-z)) rotateY(${angle}deg)`;
      }
    }
  };

  // 브랜드 클릭 핸들러 (기본 동작: 새 탭에서 브랜드 사이트 열기)
  const handleBrandClick = (magazine: MagazinePublishCard) => {
    if (magazine.brandUrl) {
      window.open(magazine.brandUrl, '_blank', 'noopener,noreferrer');
      console.log(`[DEBUG] Carousel brand clicked: ${magazine.brandName} -> ${magazine.brandUrl}`);
    } else if (onBrandClick) {
      onBrandClick(magazine);
    }
  };

  // 3D 변환 설정 (데스크톱에서만)
  useEffect(() => {
    if (isMobile === null || isMobile || !carouselRef.current) return;

    const $carousel = carouselRef.current;
    const $cells = Array.from($carousel.children) as HTMLElement[];
    const tz = Math.round(
      (CAROUSEL_CONFIG.CELL_WIDTH / 2) /
      Math.tan(Math.PI / CAROUSEL_CONFIG.CELL_COUNT)
    );

    $cells.forEach(($cell, idx) => {
      $cell.style.transform = `translateY(-50%) rotateY(-${idx * degY}deg) translateZ(-${tz}px) scale(${CAROUSEL_CONFIG.SCALE})`;   
    });
  }, [degY, isMobile]);

  // 개선된 캐러셀 회전 함수
  const rotateCarousel = (direct: 'prev' | 'next') => {
    if (isMobile) return;

    const newIndex = direct === 'prev' ? selectedIndex - 1 : selectedIndex + 1;
    setSelectedIndex(newIndex);

    if (carouselRef.current) {
      const angle = degY * newIndex;
      carouselRef.current.style.transform = `translateZ(var(--magazine-carousel3d-translate-z)) rotateY(${angle}deg)`;
    }
  };

  // 마우스 다운 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return;

    setDragState({
      startX: e.clientX,
      startTime: Date.now(),
      isDragging: false,
    });

    if (carouselRef.current) {
      carouselRef.current.style.cursor = "grabbing";
    }
  };

  //  마우스 업 핸들러
  const handleMouseUp = (e: React.MouseEvent) => {
    if (isMobile) return;

    const endX = e.clientX;
    const endTime = Date.now();
    const deltaX = Math.abs(dragState.startX - endX);
    const deltaTime = endTime - dragState.startTime;

    // 드래그 판정: 이동 거리가 임계값 이상이고 충분한 시간 동안 드래그한 경우
    const isSwipe = deltaX >= CAROUSEL_CONFIG.SWIPE_THRESHOLD && deltaTime > CAROUSEL_CONFIG.CLICK_TIME_THRESHOLD;

    if (isSwipe) {
      console.log('[DEBUG] Swipe detected:', deltaX, 'px');
      const direction = dragState.startX > endX ? "next" : "prev";
      rotateCarousel(direction);
      
      setDragState(prev => ({ ...prev, isDragging: true }));
      
      // 드래그 상태를 잠시 후 리셋 (클릭 이벤트 차단용)
      setTimeout(() => {
        setDragState(prev => ({ ...prev, isDragging: false }));
      }, 100);
    } else {
      console.log('[DEBUG] Click detected (not swipe):', deltaX, 'px');
      setDragState(prev => ({ ...prev, isDragging: false }));
    }

    if (carouselRef.current) {
      carouselRef.current.style.cursor = "grab";
    }
  };

  // 네비게이션 버튼 클릭 핸들러
  const handleNavButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isMobile) return;
    
    e.stopPropagation(); // 이벤트 버블링 방지
    
    const button = e.currentTarget;
    const direction = button.dataset.direct as 'prev' | 'next';
    
    if (direction) {
      console.log('[DEBUG] Nav button clicked:', direction);
      rotateCarousel(direction);
    }
  };

  // 렌더링할 셀 결정
  const renderCells = () => {
    if (isMobile === null) {
      // SSR/초기 렌더링: 데스크톱 버전으로 렌더링
      return Array.from({ length: CAROUSEL_CONFIG.CELL_COUNT }, (_, idx) => {
        const magazine = magazines.length > 0 ? magazines[idx % magazines.length] : undefined;
        const isCenter = idx === centerIndex;

        return (
          <MagazineCarouselCell
            key={`cell-${idx}`}
            magazine={magazine}
            isCenter={isCenter}
            onClick={(mag) => handleCellClick(mag, idx)}
            onBrandClick={handleBrandClick} 
          />
        );
      });
    }

    if (isMobile) {
      // 모바일: 전용 컴포넌트로 확장 정보 표시
      return magazines.map((magazine) => (
        <MagazineCarouselMobileCard
          key={`mobile-${magazine.id}`}
          magazine={magazine}
          onClick={(mag) => onCellClick?.(mag)} // 모바일에서는 모든 카드에서 상세 페이지 이동
          onBrandClick={handleBrandClick} 
        />
      ));
    } else {
      // 데스크톱: 16개 고정 셀 렌더링 (개선된 클릭 로직)
      return Array.from({ length: CAROUSEL_CONFIG.CELL_COUNT }, (_, idx) => {
        const magazine = magazines.length > 0 ? magazines[idx % magazines.length] : undefined;
        const isCenter = idx === centerIndex;

        return (
          <MagazineCarouselCell
            key={`cell-${idx}`}
            magazine={magazine}
            isCenter={isCenter}
            onClick={(mag) => handleCellClick(mag, idx)} 
            onBrandClick={handleBrandClick} 
          />
        );
      });
    }
  };

  // 스테이지 props
  const getStageProps = () => {
    if (isMobile === null) {
      return {
        className: "magazine-carousel3d__stage",
        ref: carouselRef,
      };
    }

    return {
      className: "magazine-carousel3d__stage",
      ref: carouselRef,
      onMouseDown: isMobile ? undefined : handleMouseDown,
      onMouseUp: isMobile ? undefined : handleMouseUp,
      style: {
        cursor: isMobile ? 'default' : 'grab'
      }
    };
  };

  return (
    <div className="magazine-section">
      <h2 className="magazine-section__title">
        <Link href="/magazine" className="magazine-section__title-link">
          MAGAZINE
        </Link>
        <Link href="/magazine" className="magazine-section__title-link__arrow">
          →
        </Link>
      </h2>
      <div className="magazine-carousel3d__container">
        <div
          className={`magazine-carousel3d ${className}`}
          ref={sceneRef}
        >
          <ul {...getStageProps()}>
            {renderCells()}
          </ul>

          {isMobile !== true && (
            <div className="magazine-carousel3d__nav">
              <button 
                className="magazine-carousel3d__nav-button" 
                data-direct="prev"
                onClick={handleNavButtonClick}
                type="button"
              >
                ‹
              </button>
              <button 
                className="magazine-carousel3d__nav-button" 
                data-direct="next"
                onClick={handleNavButtonClick}
                type="button"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MagazineCarousel3D;