'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMagazineCards } from '@/lib/queries/magazines';
import { useMagazineListNavigation } from '@/hooks/useMagazineNavigation';
import MagazineCard from '@/components/features/MagazineCard';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';
import { MagazinePublishCard } from '@/types';

/**
 * 카테고리 필터의 타입 정의
 */
type CategoryFilter = 'all' | 'official' | 'unofficial';

/**
 * 카테고리 필터 버튼 컴포넌트
 */
interface CategoryFilterProps {
  currentCategory: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
  loading?: boolean;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  currentCategory,
  onCategoryChange,
  loading = false,
}) => {
  const categories = [
    { key: 'all' as const, label: '전체', description: '모든 매거진' },
    { key: 'official' as const, label: '공식', description: '공식 매거진' },
    { key: 'unofficial' as const, label: '비공식', description: '비공식 매거진' },
  ];

  return (
    <div 
      className="magazine-filter"
      role="group" 
      aria-label="매거진 카테고리 필터"
    >
      <div className="magazine-filter__buttons">
        {categories.map((category) => (
          <Button
            key={category.key}
            variant={currentCategory === category.key ? 'primary' : 'ghost'}
            size="md"
            disabled={loading}
            onClick={() => onCategoryChange(category.key)}
            aria-label={`${category.description} 보기`}
            aria-pressed={currentCategory === category.key}
            className={`magazine-filter__button ${
              currentCategory === category.key ? 'magazine-filter__button--active' : ''
            }`}
          >
            {category.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

/**
 * 매거진 리스트의 헤더 섹션 컴포넌트
 */
interface MagazineHeaderProps {
  currentCategory: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
  loading?: boolean;
  totalCount?: number;
}

const MagazineHeader: React.FC<MagazineHeaderProps> = ({
  currentCategory,
  onCategoryChange,
  loading = false,
  totalCount,
}) => {
  return (
    <header className="magazine-header">
      <div className="magazine-header__title-section">
        <h1 className="magazine-header__title">MAGAZINE</h1>
        {totalCount !== undefined && (
          <p className="magazine-header__subtitle">
            {loading ? '매거진을 불러오는 중...' : `총 ${totalCount.toLocaleString()}개의 매거진`}
          </p>
        )}
      </div>

      <div className="magazine-header__filter-section">
        <CategoryFilter
          currentCategory={currentCategory}
          onCategoryChange={onCategoryChange}
          loading={loading}
        />
      </div>
    </header>
  );
};

/**
 * 매거진 그리드 섹션 컴포넌트
 */
interface MagazineGridProps {
  magazines: MagazinePublishCard[];
  loading?: boolean;
  onMagazineClick?: (magazine: MagazinePublishCard) => void;
}

const MagazineGrid: React.FC<MagazineGridProps> = ({
  magazines,
  loading = false,
  onMagazineClick,
}) => {
  // 로딩 상태
  if (loading) {
    return (
      <div className="magazine-grid-section">
        <MagazineCard.Grid
          magazines={[]}
          loading={true}
          loadingCount={9}
          onMagazineImageClick={onMagazineClick}
          onMagazineLinkClick={onMagazineClick}
        />
      </div>
    );
  }

  // 빈 상태
  if (magazines.length === 0) {
    return (
      <div className="magazine-grid-section">
        <div className="magazine-empty-state">
          <div className="magazine-empty-state__content">
            <h3 className="magazine-empty-state__title">
              매거진이 없습니다
            </h3>
            <p className="magazine-empty-state__description">
              아직 등록된 매거진이 없어요. 다른 카테고리를 확인해보세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 매거진 표시
  return (
    <div className="magazine-grid-section">
      <MagazineCard.Grid
        magazines={magazines}
        loading={false}
        onMagazineImageClick={onMagazineClick}
        onMagazineLinkClick={onMagazineClick}
        showViews={false}
      />
    </div>
  );
};

/**
 * URL 파라미터에서 안전하게 값을 추출하는 유틸리티 함수들
 */
const parsePageFromURL = (searchParams: URLSearchParams): number => {
  const page = searchParams.get('page');
  const parsed = page ? parseInt(page, 10) : 1;
  return parsed > 0 ? parsed : 1;
};

const parseCategoryFromURL = (searchParams: URLSearchParams): CategoryFilter => {
  const category = searchParams.get('category') as CategoryFilter;
  return ['all', 'official', 'unofficial'].includes(category) ? category : 'all';
};

/**
 * URL을 업데이트하는 유틸리티 함수
 */
const updateURL = (
  router: ReturnType<typeof useRouter>,
  page: number,
  category: CategoryFilter
) => {
  const params = new URLSearchParams();
  
  if (page > 1) {
    params.set('page', page.toString());
  }
  
  if (category !== 'all') {
    params.set('category', category);
  }

  const queryString = params.toString();
  const newPath = queryString ? `/magazine?${queryString}` : '/magazine';
  
  router.push(newPath, { scroll: false });
};

/**
 * 매거진 리스트 컨텐츠 컴포넌트 (클라이언트 전용)
 */
export default function MagazineListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 공통 네비게이션 훅 사용
  const { navigateFromCard } = useMagazineListNavigation();

  // URL에서 초기 상태 파싱
  const [currentPage, setCurrentPage] = useState(() => parsePageFromURL(searchParams));
  const [currentCategory, setCurrentCategory] = useState<CategoryFilter>(() => 
    parseCategoryFromURL(searchParams)
  );

  // URL 파라미터 변경 감지 및 상태 동기화
  useEffect(() => {
    const newPage = parsePageFromURL(searchParams);
    const newCategory = parseCategoryFromURL(searchParams);
    
    setCurrentPage(newPage);
    setCurrentCategory(newCategory);
  }, [searchParams]);

  // API 데이터 페칭
  const { data, isLoading, error } = useMagazineCards({
    page: currentPage,
    limit: 9,
    category: currentCategory === 'all' ? undefined : currentCategory,
  });

  /**
   * 페이지 변경 핸들러
   */
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    updateURL(router, page, currentCategory);
  }, [router, currentCategory]);

  /**
   * 카테고리 변경 핸들러
   */
  const handleCategoryChange = useCallback((category: CategoryFilter) => {
    setCurrentCategory(category);
    setCurrentPage(1);
    updateURL(router, 1, category);
  }, [router]);

  // 에러 상태 처리
  if (error) {
    return (
      <div className="magazine-page">
        <div className="magazine-error-state">
          <div className="magazine-error-state__content">
            <h2 className="magazine-error-state__title">
              매거진을 불러올 수 없습니다
            </h2>
            <p className="magazine-error-state__description">
              네트워크 연결을 확인하고 다시 시도해주세요.
            </p>
            <Button
              variant="primary"
              onClick={() => window.location.reload()}
              className="magazine-error-state__retry"
            >
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 데이터 추출
  const magazines = data?.data || [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const totalItems = pagination?.total;

  return (
    <div className="magazine-page">
      <MagazineHeader
        currentCategory={currentCategory}
        onCategoryChange={handleCategoryChange}
        loading={isLoading}
        totalCount={totalItems}
      />

      <main className="magazine-content">
        <MagazineGrid
          magazines={magazines}
          loading={isLoading}
          onMagazineClick={navigateFromCard}
        />

        {totalPages > 1 && (
          <div className="magazine-pagination">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              loading={isLoading}
              showInfo={true}
              size="md"
            />
          </div>
        )}
      </main>
    </div>
  );
}
