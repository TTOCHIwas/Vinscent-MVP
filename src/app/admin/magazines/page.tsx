'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/admin/AdminLayout';
import MagazineAdminList from '../../../components/admin/MagazineAdminList';
import Button from '../../../components/ui/Button';
import { useAdminMagazines, useAdminMagazineCount } from '../../../lib/queries/admin';

/**
 * Vinscent MVP 어드민 매거진 관리 페이지
 * 
 * 기능:
 * - 매거진 목록 조회 및 필터링
 * - 상태별/카테고리별 필터링
 * - 페이지네이션 지원
 * - CRUD 작업 (생성/수정/삭제)
 * - 통계 대시보드
 */

// 필터 옵션 타입
type StatusFilter = 'all' | 'draft' | 'published';
type CategoryFilter = 'all' | 'official' | 'unofficial';

const AdminMagazinesPage: React.FC = () => {
  const router = useRouter();
  
  // 필터 상태 관리
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // 쿼리 매개변수 준비
  const queryParams = {
    page: currentPage,
    limit: itemsPerPage,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
  };

  // API 호출 훅들
  const { 
    data: magazinesData, 
    isLoading: isLoadingMagazines,
    error: magazinesError,
    refetch: refetchMagazines 
  } = useAdminMagazines(queryParams);

  // 통계 데이터
  const { data: totalCount } = useAdminMagazineCount();
  const { data: draftCount } = useAdminMagazineCount({ status: 'draft' });
  const { data: publishedCount } = useAdminMagazineCount({ status: 'published' });

  // 이벤트 핸들러들
  const handleCreateMagazine = () => {
    router.push('/admin/magazines/new');
  };

  const handleEditMagazine = (id: number) => {
    router.push(`/admin/magazines/create?id=${id}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusFilterChange = (status: StatusFilter) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleCategoryFilterChange = (category: CategoryFilter) => {
    setCategoryFilter(category);
    setCurrentPage(1);
  };

  // 통계 정보 렌더링
  const renderStats = () => {
    return (
      <div className="admin-stats">
        <div className="admin-stats__grid">
          <div className="admin-stats__card">
            <h3 className="admin-stats__title">전체 매거진</h3>
            <div className="admin-stats__value">
              {totalCount?.data?.count || 0}개
            </div>
          </div>
          
          <div className="admin-stats__card">
            <h3 className="admin-stats__title">발행됨</h3>
            <div className="admin-stats__value admin-stats__value--published">
              {publishedCount?.data?.count || 0}개
            </div>
          </div>
          
          <div className="admin-stats__card">
            <h3 className="admin-stats__title">초안</h3>
            <div className="admin-stats__value admin-stats__value--draft">
              {draftCount?.data?.count || 0}개
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 필터 버튼 렌더링
  const renderFilters = () => {
    return (
      <div className="admin-filters">
        <div className="admin-filters__group">
          <span className="admin-filters__label">상태:</span>
          <Button.Group attached>
            <Button
              size="sm"
              variant={statusFilter === 'all' ? 'primary' : 'secondary'}
              onClick={() => handleStatusFilterChange('all')}
            >
              전체
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'published' ? 'primary' : 'secondary'}
              onClick={() => handleStatusFilterChange('published')}
            >
              발행됨
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'draft' ? 'primary' : 'secondary'}
              onClick={() => handleStatusFilterChange('draft')}
            >
              초안
            </Button>
          </Button.Group>
        </div>

        <div className="admin-filters__group">
          <span className="admin-filters__label">카테고리:</span>
          <Button.Group attached>
            <Button
              size="sm"
              variant={categoryFilter === 'all' ? 'primary' : 'secondary'}
              onClick={() => handleCategoryFilterChange('all')}
            >
              전체
            </Button>
            <Button
              size="sm"
              variant={categoryFilter === 'official' ? 'primary' : 'secondary'}
              onClick={() => handleCategoryFilterChange('official')}
            >
              공식
            </Button>
            <Button
              size="sm"
              variant={categoryFilter === 'unofficial' ? 'primary' : 'secondary'}
              onClick={() => handleCategoryFilterChange('unofficial')}
            >
              일반
            </Button>
          </Button.Group>
        </div>
      </div>
    );
  };

  // 액션 버튼 렌더링
  const renderActions = () => {
    return (
      <div className="admin-actions">
        <Button
          variant="primary"
          size="md"
          onClick={handleCreateMagazine}
          className="admin-actions__create"
        >
          + 새 매거진
        </Button>
        
        <Button
          variant="ghost"
          size="md"
          onClick={() => refetchMagazines()}
          disabled={isLoadingMagazines}
          className="admin-actions__refresh"
        >
          새로고침
        </Button>
      </div>
    );
  };

  return (
    <AdminLayout
      title="매거진 관리"
      description="Vinscent 매거진 콘텐츠 관리 시스템"
      requireAuth={true}
      allowedRoles={['developer', 'designer', 'marketing', 'pm']}
      showNavigation={true}
    >
      <div className="admin-page admin-magazines-page">
        {/* 페이지 헤더 */}
        <div className="admin-page__header">
          <div className="admin-page__title-section">
            <h1 className="admin-page__title">매거진 관리</h1>
            <p className="admin-page__description">
              브랜드 매거진 콘텐츠를 생성, 수정, 발행할 수 있습니다.
            </p>
          </div>
          
          {renderActions()}
        </div>

        {/* 통계 정보 */}
        {renderStats()}

        {/* 필터 */}
        {renderFilters()}

        {/* 매거진 목록 */}
        <div className="admin-page__content">
          {magazinesError ? (
            <div className="admin-error">
              <h3>데이터 로드 오류</h3>
              <p>{magazinesError instanceof Error ? magazinesError.message : '알 수 없는 오류가 발생했습니다.'}</p>
              <Button
                variant="primary"
                onClick={() => refetchMagazines()}
              >
                다시 시도
              </Button>
            </div>
          ) : (
            <MagazineAdminList
              magazines={magazinesData?.data || []}
              pagination={magazinesData?.pagination}
              loading={isLoadingMagazines}
              onEdit={handleEditMagazine}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMagazinesPage;