'use client';

import React, { useMemo } from 'react';
import { useMagazineCards } from '@/lib/queries/magazines';
import { useMagazineRecommendationNavigation } from '@/hooks/useMagazineNavigation';
import MagazineCard from '@/components/features/MagazineCard';
import { MagazinePublishCard } from '@/types';

/**
 * 향상된 매거진 추천 컴포넌트
 * 
 * 기능:
 * - 실제 API 데이터 연동
 * - 현재 매거진 제외
 * - 로딩/에러 상태 처리
 * - publishedDate 기준 최신 3개
 * - 1000px 컨테이너에서 3개 카드 그리드
 * - 일관된 조회수 증가 + 네비게이션
 */

interface MagazineRecommendationsProps {
  /** 추천 섹션 제목 */
  title?: string;
  /** 현재 보고 있는 매거진 ID (추천에서 제외) */
  currentMagazineId?: number;
  /** 최대 표시 개수 (기본 3개) */
  maxItems?: number;
  /** 카테고리 필터 (선택사항) */
  category?: 'official' | 'unofficial';
  /** 추가 CSS 클래스 */
  className?: string;
  /** 매거진 클릭 시 콜백 (선택사항, 공통 훅 사용 권장) */
  onMagazineClick?: (magazine: MagazinePublishCard) => void;
}

const MagazineRecommendations: React.FC<MagazineRecommendationsProps> = ({
  title = "최신 매거진",
  currentMagazineId,
  maxItems = 3,
  category,
  className = '',
  onMagazineClick
}) => {
  // 공통 네비게이션 훅 사용
  const { navigateFromRecommendation } = useMagazineRecommendationNavigation();
  
  // API 데이터 페칭 - 충분한 여유분 요청 (현재 매거진 제외 고려)
  const { 
    data, 
    isLoading, 
    error 
  } = useMagazineCards({
    page: 1,
    limit: maxItems + 3, // 여유분 3개 추가 (현재 매거진 제외 대비)
    category
  });

  // 데이터 필터링 및 가공
  const filteredMagazines = useMemo(() => {
    console.log('[DEBUG] MagazineRecommendations data:', data?.data?.length, data?.data);
    
    if (!data?.data) return [];
    
    let magazines = data.data;
    
    if (currentMagazineId) {
      magazines = magazines.filter(magazine => magazine.id !== currentMagazineId);
    }
    
    // 최대 개수만큼 자르기
    const result = magazines.slice(0, maxItems);
    console.log('[DEBUG] Filtered magazines:', result.length, result);
    
    return result;
  }, [data?.data, currentMagazineId, maxItems]);

  // 매거진 클릭 핸들러 (공통 훅 우선, 외부 콜백 대안)
  const handleMagazineClick = (magazine: MagazinePublishCard) => {
    if (onMagazineClick) {
      onMagazineClick(magazine);
    } else {
      // 공통 훅으로 조회수 증가 + 네비게이션
      navigateFromRecommendation(magazine);
    }
  };

  // 에러 상태 - 매거진 리스트 페이지와 동일한 패턴
  if (error) {
    return (
      <section className={`magazine-detail__recommendations ${className}`}>
        <h3 className="magazine-detail__recommendations-title">
          {title}
        </h3>
        
        <div className="magazine-detail__recommendations-error">
          <div className="magazine-error-state__content">
            <p className="magazine-error-state__description">
              추천 매거진을 불러올 수 없습니다. 잠시 후 다시 시도해주세요.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // 로딩 상태 - MagazineCard.Grid 패턴 활용
  if (isLoading) {
    return (
      <section className={`magazine-detail__recommendations ${className}`}>
        <h3 className="magazine-detail__recommendations-title">
          {title}
        </h3>
        
        <div className="magazine-detail__recommendations-grid">
          <MagazineCard.Grid
            magazines={[]}
            loading={true}
            loadingCount={maxItems}
            showBrand={true}
            showDate={true}
            showViews={false}
          />
        </div>
      </section>
    );
  }

  // 빈 상태 - 추천할 매거진이 없을 때
  if (filteredMagazines.length === 0) {
    return (
      <section className={`magazine-detail__recommendations ${className}`}>
        <h3 className="magazine-detail__recommendations-title">
          {title}
        </h3>
        
        <div className="magazine-detail__recommendations-placeholder">
          <p>추천할 매거진을 준비중입니다.</p>
        </div>
      </section>
    );
  }

  // 정상 상태 - 추천 매거진 표시 (조회수 증가 포함)
  return (
    <section className={`magazine-detail__recommendations ${className}`}>
      <h3 className="magazine-detail__recommendations-title">
        {title}
      </h3>
      
      <div className="magazine-detail__recommendations-grid">
        <MagazineCard.Grid
          magazines={filteredMagazines}
          loading={false}
          onMagazineImageClick={handleMagazineClick}
          onMagazineLinkClick={handleMagazineClick}
          showBrand={true}
          showDate={true}
          showViews={false}
          layout="vertical"
        />
      </div>

      {/* 개발자를 위한 디버그 정보 (프로덕션에서는 제거) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          fontSize: '12px', 
          color: '#666', 
          marginTop: '8px',
          fontFamily: 'monospace' 
        }}>
          Debug: {filteredMagazines.length}/{data?.data?.length || 0} magazines 
          {currentMagazineId && ` (excluded: ${currentMagazineId})`}
        </div>
      )}
    </section>
  );
};

export default MagazineRecommendations;