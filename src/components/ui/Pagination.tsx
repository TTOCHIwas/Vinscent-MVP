import React, { HTMLAttributes, forwardRef, useCallback, useMemo } from 'react';
import Button from './Button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react';

/**
 * 페이지네이션 컴포넌트의 핵심 타입 정의
 * 
 * 이 인터페이스는 페이지네이션의 모든 필수 정보와 
 * 사용자 상호작용을 처리하기 위한 콜백들을 정의합니다.
 */
export interface PaginationProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** 현재 활성 페이지 (1부터 시작) */
  currentPage: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 페이지 변경 시 호출되는 콜백 함수 */
  onPageChange: (page: number) => void;
  /** 로딩 상태 - true일 때 모든 버튼이 비활성화됩니다 */
  loading?: boolean;
  /** 처음/마지막 페이지로 이동하는 버튼 표시 여부 */
  showFirstLast?: boolean;
  /** 중간 페이지 생략 표시(...) 사용 여부 */
  showEllipsis?: boolean;
  /** 페이지 정보 텍스트 표시 여부 */
  showInfo?: boolean;
  /** 한 번에 표시할 페이지 번호의 최대 개수 */
  siblingCount?: number;
  /** 컴포넌트 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 추가 CSS 클래스명 */
  className?: string;
  /** 접근성을 위한 라벨 커스터마이징 */
  labels?: {
    previous?: string;
    next?: string;
    first?: string;
    last?: string;
    page?: string;
    current?: string;
    info?: string;
  };
}

/**
 * 페이지 버튼의 타입을 정의합니다.
 * 이는 내부적으로 사용되며, 각 버튼의 역할을 명확히 구분합니다.
 */
type PageButtonType = 'page' | 'ellipsis' | 'first' | 'previous' | 'next' | 'last';

interface PageButtonItem {
  type: PageButtonType;
  value: number | null;
  disabled: boolean;
  active: boolean;
  label: string;
  ariaLabel: string;
}

/**
 * 페이지네이션의 핵심 로직을 담당하는 커스텀 훅입니다.
 * 
 * 이 훅은 복잡한 페이지네이션 로직을 캡슐화하여 
 * 컴포넌트의 렌더링 로직과 분리합니다.
 * 
 * @param currentPage - 현재 페이지
 * @param totalPages - 전체 페이지 수
 * @param siblingCount - 현재 페이지 주변에 표시할 페이지 수
 * @param showFirstLast - 첫/마지막 페이지 버튼 표시 여부
 * @param showEllipsis - 생략 표시(...) 사용 여부
 * @param labels - 접근성을 위한 라벨들
 * @returns 렌더링에 필요한 버튼 정보 배열
 */
const usePaginationLogic = (
  currentPage: number,
  totalPages: number,
  siblingCount: number,
  showFirstLast: boolean,
  showEllipsis: boolean,
  labels: Required<NonNullable<PaginationProps['labels']>>
): PageButtonItem[] => {
  return useMemo(() => {
    const items: PageButtonItem[] = [];

    // 페이지가 1개 이하인 경우 빈 배열 반환
    if (totalPages <= 1) return items;

    // 첫 페이지 버튼 (선택적)
    if (showFirstLast) {
      items.push({
        type: 'first',
        value: 1,
        disabled: currentPage === 1,
        active: false,
        label: labels.first,
        ariaLabel: `${labels.first} ${labels.page}`,
      });
    }

    // 이전 페이지 버튼
    items.push({
      type: 'previous',
      value: Math.max(1, currentPage - 1),
      disabled: currentPage === 1,
      active: false,
      label: labels.previous,
      ariaLabel: `${labels.previous} ${labels.page}`,
    });

    // 페이지 번호 버튼들을 계산하는 복잡한 로직
    // 이 부분이 페이지네이션의 핵심입니다.
    if (showEllipsis && totalPages > 7) {
      // 페이지가 많을 때의 스마트한 표시 로직
      
      if (currentPage <= 3) {
        // 현재 페이지가 앞쪽에 있을 때: [1] [2] [3] [4] [...] [10]
        for (let i = 1; i <= Math.min(4, totalPages); i++) {
          items.push({
            type: 'page',
            value: i,
            disabled: false,
            active: i === currentPage,
            label: i.toString(),
            ariaLabel: `${labels.page} ${i}${i === currentPage ? `, ${labels.current}` : ''}`,
          });
        }
        
        if (totalPages > 4) {
          items.push({
            type: 'ellipsis',
            value: null,
            disabled: true,
            active: false,
            label: '...',
            ariaLabel: '더 많은 페이지',
          });
          
          items.push({
            type: 'page',
            value: totalPages,
            disabled: false,
            active: false,
            label: totalPages.toString(),
            ariaLabel: `${labels.page} ${totalPages}`,
          });
        }
      } else if (currentPage >= totalPages - 2) {
        // 현재 페이지가 뒤쪽에 있을 때: [1] [...] [7] [8] [9] [10]
        items.push({
          type: 'page',
          value: 1,
          disabled: false,
          active: false,
          label: '1',
          ariaLabel: `${labels.page} 1`,
        });
        
        items.push({
          type: 'ellipsis',
          value: null,
          disabled: true,
          active: false,
          label: '...',
          ariaLabel: '더 많은 페이지',
        });
        
        for (let i = Math.max(1, totalPages - 3); i <= totalPages; i++) {
          items.push({
            type: 'page',
            value: i,
            disabled: false,
            active: i === currentPage,
            label: i.toString(),
            ariaLabel: `${labels.page} ${i}${i === currentPage ? `, ${labels.current}` : ''}`,
          });
        }
      } else {
        // 현재 페이지가 가운데 있을 때: [1] [...] [4] [5] [6] [...] [10]
        items.push({
          type: 'page',
          value: 1,
          disabled: false,
          active: false,
          label: '1',
          ariaLabel: `${labels.page} 1`,
        });
        
        items.push({
          type: 'ellipsis',
          value: null,
          disabled: true,
          active: false,
          label: '...',
          ariaLabel: '더 많은 페이지',
        });
        
        for (let i = currentPage - siblingCount; i <= currentPage + siblingCount; i++) {
          if (i > 1 && i < totalPages) {
            items.push({
              type: 'page',
              value: i,
              disabled: false,
              active: i === currentPage,
              label: i.toString(),
              ariaLabel: `${labels.page} ${i}${i === currentPage ? `, ${labels.current}` : ''}`,
            });
          }
        }
        
        items.push({
          type: 'ellipsis',
          value: null,
          disabled: true,
          active: false,
          label: '...',
          ariaLabel: '더 많은 페이지',
        });
        
        items.push({
          type: 'page',
          value: totalPages,
          disabled: false,
          active: false,
          label: totalPages.toString(),
          ariaLabel: `${labels.page} ${totalPages}`,
        });
      }
    } else {
      // 페이지가 적거나 생략 표시를 사용하지 않을 때의 단순한 로직
      for (let i = 1; i <= totalPages; i++) {
        items.push({
          type: 'page',
          value: i,
          disabled: false,
          active: i === currentPage,
          label: i.toString(),
          ariaLabel: `${labels.page} ${i}${i === currentPage ? `, ${labels.current}` : ''}`,
        });
      }
    }

    // 다음 페이지 버튼
    items.push({
      type: 'next',
      value: Math.min(totalPages, currentPage + 1),
      disabled: currentPage === totalPages,
      active: false,
      label: labels.next,
      ariaLabel: `${labels.next} ${labels.page}`,
    });

    // 마지막 페이지 버튼 (선택적)
    if (showFirstLast) {
      items.push({
        type: 'last',
        value: totalPages,
        disabled: currentPage === totalPages,
        active: false,
        label: labels.last,
        ariaLabel: `${labels.last} ${labels.page}`,
      });
    }

    return items;
  }, [currentPage, totalPages, siblingCount, showFirstLast, showEllipsis, labels]);
};

const PaginationRoot = forwardRef<HTMLDivElement, PaginationProps>(
  ({
    currentPage,
    totalPages,
    onPageChange,
    loading = false,
    showFirstLast = true,
    showEllipsis = true,
    showInfo = true,
    siblingCount = 1,
    size = 'md',
    className = '',
    labels = {},
    ...props
  }, ref) => {
    // 기본 라벨 설정
    const defaultLabels: Required<NonNullable<PaginationProps['labels']>> = {
      previous: '이전',
      next: '다음',
      first: '처음',
      last: '마지막',
      page: '페이지',
      current: '현재 페이지',
      info: '페이지 정보',
    };
    
    const mergedLabels: Required<NonNullable<PaginationProps['labels']>> = { 
      ...defaultLabels, 
      ...labels 
    };

    // 페이지네이션 로직 계산
    const paginationItems = usePaginationLogic(
      currentPage,
      totalPages,
      siblingCount,
      showFirstLast,
      showEllipsis,
      mergedLabels
    );

    // 페이지 변경 핸들러 - useCallback으로 최적화
    const handlePageChange = useCallback((page: number | null) => {
      if (!loading && page !== null && page !== currentPage && page >= 1 && page <= totalPages) {
        onPageChange(page);
      }
    }, [loading, currentPage, totalPages, onPageChange]);

    // 키보드 이벤트 핸들러
    const handleKeyDown = useCallback((event: React.KeyboardEvent, page: number | null) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handlePageChange(page);
      }
    }, [handlePageChange]);

    // 아이콘 매핑 - 각 버튼 타입에 맞는 아이콘
    const getIcon = (type: PageButtonType, buttonSize: number) => {
      const iconProps = { size: buttonSize };
      switch (type) {
        case 'first':
          return <ChevronsLeft {...iconProps} />;
        case 'previous':
          return <ChevronLeft {...iconProps} />;
        case 'next':
          return <ChevronRight {...iconProps} />;
        case 'last':
          return <ChevronsRight {...iconProps} />;
        case 'ellipsis':
          return <MoreHorizontal {...iconProps} />;
        default:
          return null;
      }
    };

    // 버튼 크기 계산
    const buttonSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;
    const buttonSizeClass = size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm';

    // CSS 클래스 조합
    const paginationClasses = [
      'pagination',
      `pagination--size-${size}`,
      loading && 'pagination--loading',
      className
    ].filter(Boolean).join(' ');

    // 페이지가 1개 이하인 경우 렌더링하지 않음
    if (totalPages <= 1) {
      return null;
    }

    return (
      <nav
        ref={ref}
        className={paginationClasses}
        role="navigation"
        aria-label="페이지네이션"
        {...props}
      >
        {/* 페이지네이션 버튼들 */}
        <div className="pagination__controls" role="group" aria-label="페이지 네비게이션">
          {paginationItems.map((item, index) => {
            const key = `${item.type}-${item.value || index}`;
            
            if (item.type === 'ellipsis') {
              return (
                <span
                  key={key}
                  className="pagination__ellipsis"
                  aria-hidden="true"
                >
                  {getIcon('ellipsis', buttonSize)}
                </span>
              );
            }

            const isIconButton = item.type !== 'page';
            
            return (
              <Button
                key={key}
                size={buttonSizeClass as 'xs' | 'sm' | 'md'}
                variant={item.active ? 'primary' : 'ghost'}
                disabled={item.disabled || loading}
                className={`pagination__button pagination__button--${item.type} ${
                  item.active ? 'pagination__button--active' : ''
                }`}
                onClick={() => handlePageChange(item.value)}
                onKeyDown={(e) => handleKeyDown(e, item.value)}
                aria-label={item.ariaLabel}
                aria-current={item.active ? 'page' : undefined}
                iconOnly={isIconButton}
              >
                {isIconButton ? getIcon(item.type, buttonSize) : item.label}
              </Button>
            );
          })}
        </div>

        {/* 페이지 정보 표시 */}
        {showInfo && (
          <div 
            className="pagination__info"
            aria-label={mergedLabels.info}
            role="status"
            aria-live="polite"
          >
            <span className="pagination__info-text">
              {currentPage} / {totalPages}
            </span>
          </div>
        )}
      </nav>
    );
  }
);

PaginationRoot.displayName = 'Pagination';

/**
 * 간단한 페이지네이션 정보만 표시하는 컴포넌트
 * 모바일에서 사용하거나 공간이 제한적일 때 유용합니다.
 */
interface PaginationInfoProps extends HTMLAttributes<HTMLDivElement> {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  className?: string;
}

const PaginationInfo: React.FC<PaginationInfoProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  className = '',
  ...props
}) => {
  const startItem = itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : null;
  const endItem = itemsPerPage && totalItems ? 
    Math.min(currentPage * itemsPerPage, totalItems) : null;

  return (
    <div 
      className={`pagination-info ${className}`}
      role="status"
      aria-live="polite"
      {...props}
    >
      {totalItems && itemsPerPage ? (
        <span>
          {startItem}-{endItem} / {totalItems.toLocaleString()}개
        </span>
      ) : (
        <span>
          {currentPage} / {totalPages}
        </span>
      )}
    </div>
  );
};

/**
 * Compound Component 패턴으로 구성된 완전한 Pagination 컴포넌트
 * 
 * 사용 예시:
 * ```tsx
 * <Pagination 
 *   currentPage={page} 
 *   totalPages={10} 
 *   onPageChange={setPage} 
 * />
 * 
 * <Pagination.Info 
 *   currentPage={page} 
 *   totalPages={10} 
 *   totalItems={95}
 *   itemsPerPage={9}
 * />
 * ```
 */
const Pagination = Object.assign(PaginationRoot, {
  Info: PaginationInfo,
});

export default Pagination;