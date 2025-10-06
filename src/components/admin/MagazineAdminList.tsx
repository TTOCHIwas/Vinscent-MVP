'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '../ui/Button';
import { MagazineWithImages, PaginatedResponse } from '@/types';
import { useMagazineMutations } from '@/lib/queries/admin';


interface MagazineAdminListProps {
  magazines: MagazineWithImages[];
  pagination?: PaginatedResponse<MagazineWithImages>['pagination'];
  loading?: boolean;
  onEdit?: (id: number) => void;
  onPageChange?: (page: number) => void;
}

const MagazineAdminList: React.FC<MagazineAdminListProps> = ({
  magazines,
  pagination,
  loading = false,
  onEdit,
  onPageChange
}) => {
  const router = useRouter();
  const { delete: deleteMutation } = useMagazineMutations();
  
  // 삭제 핸들러 (간단한 confirm() 사용)
  const handleDeleteClick = async (magazine: MagazineWithImages) => {
    console.log('[DEBUG] 삭제 버튼 클릭:', magazine);
    
    // 간단한 confirm 대화상자 사용
    const confirmed = confirm(
      `"매거진: ${magazine.title}"을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다. 매거진과 관련된 모든 이미지도 함께 삭제됩니다.`
    );
    
    if (!confirmed) {
      console.log('[DEBUG] 삭제 취소됨');
      return;
    }
    
    try {
      console.log('[DEBUG] 삭제 확인 - ID:', magazine.id);
      console.log('[DEBUG] deleteMutation.mutateAsync 호출 시작...');
      
      const result = await deleteMutation.mutateAsync(magazine.id);
      console.log('[DEBUG] 삭제 API 성공 응답:', result);
      
      alert('매거진이 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('[ERROR] 삭제 실패:', error);
      alert('매거진 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 미리보기 핸들러
  const handlePreview = (magazine: MagazineWithImages) => {
    if (magazine.status === 'published') {
      // 발행된 매거진은 일반 페이지로
      router.push(`/magazine/${magazine.id}`);
    } else {
      // 초안은 편집 페이지로 이동 후 미리보기 사용
      alert('초안 상태입니다. 편집 페이지에서 미리보기를 사용해주세요.');
      onEdit?.(magazine.id); // 편집 페이지로 이동
    }
  };

  // 상태 뱃지 렌더링
  const renderStatusBadge = (status: 'draft' | 'published') => {
    return (
      <span className={`magazine-status magazine-status--${status}`}>
        {status === 'published' ? '발행됨' : '초안'}
      </span>
    );
  };

  // 카테고리 뱃지 렌더링
  const renderCategoryBadge = (category: 'official' | 'unofficial') => {
    return (
      <span className={`magazine-category magazine-category--${category}`}>
        {category === 'official' ? '공식' : '일반'}
      </span>
    );
  };

  // 액션 버튼 렌더링
  const renderActions = (magazine: MagazineWithImages) => {
    console.log('[DEBUG] renderActions 호출됨 - 매거진:', magazine.id, magazine.title);
    
    return (
      <div className="magazine-actions">
        <Button
          size="xs"
          variant="ghost"
          onClick={() => {
            console.log('[DEBUG] 미리보기 버튼 클릭됨');
            handlePreview(magazine);
          }}
          className="magazine-actions__preview"
        >
          미리보기
        </Button>
        
        <Button
          size="xs"
          variant="secondary"
          onClick={() => {
            console.log('[DEBUG] 수정 버튼 클릭됨 - ID:', magazine.id);
            onEdit?.(magazine.id);
          }}
          className="magazine-actions__edit"
        >
          수정
        </Button>
        
        <Button
          size="xs"
          variant="danger"
          onClick={() => {
            console.log('[DEBUG] 삭제 버튼 onClick 실행됨 - ID:', magazine.id);
            handleDeleteClick(magazine);
          }}
          disabled={deleteMutation.isPending}
          className="magazine-actions__delete"
        >
          삭제
        </Button>
      </div>
    );
  };

  // 페이지네이션 렌더링
  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const { page, totalPages } = pagination;
    const pages = [];

    // 이전 버튼
    if (page > 1) {
      pages.push(
        <Button
          key="prev"
          size="sm"
          variant="secondary"
          onClick={() => onPageChange?.(page - 1)}
          className="pagination__button"
        >
          이전
        </Button>
      );
    }

    // 페이지 번호들
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          size="sm"
          variant={i === page ? 'primary' : 'secondary'}
          onClick={() => onPageChange?.(i)}
          className="pagination__button"
        >
          {i}
        </Button>
      );
    }

    // 다음 버튼
    if (page < totalPages) {
      pages.push(
        <Button
          key="next"
          size="sm"
          variant="secondary"
          onClick={() => onPageChange?.(page + 1)}
          className="pagination__button"
        >
          다음
        </Button>
      );
    }

    return (
      <div className="admin-pagination">
        <div className="admin-pagination__info">
          페이지 {page} / {totalPages} (전체 {pagination.total}개)
        </div>
        <div className="admin-pagination__buttons">
          {pages}
        </div>
      </div>
    );
  };



  // 로딩 상태 렌더링
  if (loading) {
    return (
      <div className="admin-list admin-list--loading">
        <div className="admin-list__loading">
          <div className="loading-spinner"></div>
          <p>매거진 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 빈 목록 렌더링
  if (!magazines || magazines.length === 0) {
    return (
      <div className="admin-list admin-list--empty">
        <div className="admin-list__empty">
          <h3>매거진이 없습니다</h3>
          <p>새로운 매거진을 생성해보세요.</p>
          <Button
            variant="primary"
            onClick={() => router.push('/admin/magazines/new')}
          >
            + 첫 번째 매거진 만들기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-list">
      {/* 매거진 테이블 */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead className="admin-table__header">
            <tr>
              <th className="admin-table__th admin-table__th--status">상태</th>
              <th className="admin-table__th admin-table__th--title">제목</th>
              <th className="admin-table__th admin-table__th--category">카테고리</th>
              <th className="admin-table__th admin-table__th--brand">브랜드</th>
              <th className="admin-table__th admin-table__th--views">조회수</th>
              <th className="admin-table__th admin-table__th--date">수정일</th>
              <th className="admin-table__th admin-table__th--actions">액션</th>
            </tr>
          </thead>
          
          <tbody className="admin-table__body">
            {magazines.map((magazine) => (
              <tr key={magazine.id} className="admin-table__row">
                <td className="admin-table__td admin-table__td--status">
                  {renderStatusBadge(magazine.status)}
                </td>
                
                <td className="admin-table__td admin-table__td--title">
                  <div className="magazine-title">
                    <h4 className="magazine-title__main">{magazine.title}</h4>
                    {magazine.subtitle && (
                      <p className="magazine-title__sub">{magazine.subtitle}</p>
                    )}
                  </div>
                </td>
                
                <td className="admin-table__td admin-table__td--category">
                  {renderCategoryBadge(magazine.category)}
                </td>
                
                <td className="admin-table__td admin-table__td--brand">
                  <div className="magazine-brand">
                    <span className="magazine-brand__name">{magazine.brandName}</span>
                    {magazine.brandUrl && (
                      <a
                        href={magazine.brandUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="magazine-brand__link"
                      >
                        🔗
                      </a>
                    )}
                  </div>
                </td>
                
                <td className="admin-table__td admin-table__td--views">
                  <span className="magazine-views">
                    {magazine.viewCount.toLocaleString()}
                  </span>
                </td>
                
                <td className="admin-table__td admin-table__td--date">
                  <span className="magazine-date">
                    {new Date(magazine.updatedDate).toLocaleString('ko-KR')}
                  </span>
                </td>
                
                <td className="admin-table__td admin-table__td--actions">
                  {renderActions(magazine)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {renderPagination()}
    </div>
  );
};

export default MagazineAdminList;