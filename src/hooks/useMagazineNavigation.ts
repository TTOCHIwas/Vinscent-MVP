'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useIncrementMagazineView } from '@/lib/queries/magazines';
import { MagazinePublishCard } from '@/types';

interface UseMagazineNavigationOptions {
  /** 클릭 이벤트 추적을 위한 소스 식별자 */
  source?: string;
  /** 조회수 증가 여부 (기본: true) */
  trackView?: boolean;
  /** 에러 시 알림 표시 여부 (기본: true) */
  showAlert?: boolean;
  /** 커스텀 에러 핸들러 */
  onError?: (error: Error, magazine: MagazinePublishCard) => void;
  /** 성공 시 콜백 */
  onSuccess?: (magazine: MagazinePublishCard) => void;
}

export const useMagazineNavigation = (options: UseMagazineNavigationOptions = {}) => {
  const {
    source = 'unknown',
    trackView = true,
    showAlert = true,
    onError,
    onSuccess
  } = options;

  const router = useRouter();
  const incrementViewMutation = useIncrementMagazineView();

  const navigateToMagazine = useCallback(async (
    magazine: MagazinePublishCard,
    event?: React.MouseEvent | React.KeyboardEvent
  ) => {
    try {
      // 1. 이벤트 기본 동작 방지 (선택사항)
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      // 2. 데이터 유효성 검증
      if (!magazine || !magazine.id || typeof magazine.id !== 'number') {
        const error = new Error('매거진 정보가 올바르지 않습니다.');
        console.error('Invalid magazine data:', magazine);
        
        if (onError) {
          onError(error, magazine);
        } else if (showAlert) {
          alert(error.message);
        }
        return;
      }

      // 3. 개발 모드 로그 (디버깅용)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[MagazineNavigation] ${source}:`, {
          id: magazine.id,
          title: magazine.title,
          trackView
        });
      }

      // 4. 조회수 증가 (백그라운드 처리)
      if (trackView) {
        incrementViewMutation.mutate(magazine.id, {
          onError: (viewError) => {
            // 조회수 증가 실패해도 페이지 이동은 진행
            console.error(`[MagazineNavigation] Failed to increment view for magazine ${magazine.id}:`, viewError);
          }
        });
      }

      // 5. 매거진 상세 페이지로 이동
      router.push(`/magazine/${magazine.id}`);

      // 6. 성공 콜백 실행
      if (onSuccess) {
        onSuccess(magazine);
      }

    } catch (error) {
      console.error(`[MagazineNavigation] Error from ${source}:`, error);
      
      if (onError) {
        onError(error as Error, magazine);
      } else if (showAlert) {
        alert('매거진을 여는 중 오류가 발생했습니다.');
      }
    }
  }, [router, incrementViewMutation, source, trackView, showAlert, onError, onSuccess]);

  const navigateFromHeroSlide = useCallback((magazine: MagazinePublishCard) => {
    return navigateToMagazine(magazine);
  }, [navigateToMagazine]);


  const navigateFromCarousel = useCallback((magazine: MagazinePublishCard) => {
    return navigateToMagazine(magazine);
  }, [navigateToMagazine]);

  const navigateFromCard = useCallback((magazine: MagazinePublishCard) => {
    return navigateToMagazine(magazine);
  }, [navigateToMagazine]);

  const navigateFromRecommendation = useCallback((magazine: MagazinePublishCard) => {
    return navigateToMagazine(magazine);
  }, [navigateToMagazine]);

  const handleKeyboardNavigation = useCallback((
    magazine: MagazinePublishCard,
    event: React.KeyboardEvent
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      return navigateToMagazine(magazine, event);
    }
  }, [navigateToMagazine]);

  const prefetchMagazine = useCallback((magazineId: number) => {
    router.prefetch(`/magazine/${magazineId}`);
  }, [router]);

  return {
    // 메인 네비게이션 함수
    navigateToMagazine,
    
    // 특화 핸들러들
    navigateFromHeroSlide,
    navigateFromCarousel,
    navigateFromCard,
    navigateFromRecommendation,
    
    // 접근성 및 최적화
    handleKeyboardNavigation,
    prefetchMagazine,
    
    // 상태 정보
    isNavigating: incrementViewMutation.isPending,
    
    // 에러 정보
    navigationError: incrementViewMutation.error,
  };
};

export const useHeroSlideNavigation = () => {
  return useMagazineNavigation({
    source: 'HeroSlide',
    trackView: true,
    showAlert: true
  });
};

export const useCarouselNavigation = () => {
  return useMagazineNavigation({
    source: 'Carousel3D',
    trackView: true,
    showAlert: true
  });
};

export const useMagazineListNavigation = () => {
  return useMagazineNavigation({
    source: 'MagazineList',
    trackView: true,
    showAlert: true
  });
};

export const useMagazineRecommendationNavigation = () => {
  return useMagazineNavigation({
    source: 'Recommendation',
    trackView: true,
    showAlert: true
  });
};

export default useMagazineNavigation;