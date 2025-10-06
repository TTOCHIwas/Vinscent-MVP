import { QueryClient } from "@tanstack/react-query";

/**
 * Creates and configures a new TanStack Query client with optimized defaults
 * 
 * @returns QueryClient instance with configured caching, retry, and refetch options
 */
export const createQueryClient = () => {
    return new QueryClient({
        defaultOptions:
        {
            queries:
            {
                // 캐싱 정량: 5분간 데이터를 fresh로 간주
                staleTime: 1000 * 60 * 5,
                //캐시 유지 시간 : 10분
                gcTime: 1000 * 60 * 10,
                //에러 발생 시 재시도 횟수
                retry: 3,
                //재시도 간격
                retryDelay: (attemptIndex) => Math.min(1000* 2 ** attemptIndex, 30000),
                //윈도우 포커스 시 자동 refetch
                refetchOnWindowFocus: false,
                //마운트 시 자동 refetch
                refetchOnMount: true,
                //네트워크 재연결 시 refetch
                refetchOnReconnect: true,
                //백그라운드에서 자동 reftech 간격 
                refetchInterval: false,
            },
            mutations:
            {
                //Mutation 에러 시 재시도 횟수 최소화
                retry: 1,
                //Mutation 재시도 간격 1초
                retryDelay: 1000,
            },
        },
    })
}

/**
 * Centralized query key factory for consistent cache key generation
 * Provides hierarchical key structure for brands, products, and magazines
 */
export const queryKeys = {
    /**
     * Query keys for brand-related queries
     */
    brands: 
    {
        all: ['brands'] as const,
        lists: () => [...queryKeys.brands.all, 'list'] as const,
        list: (filters?: Record<string, unknown>) => [...queryKeys.brands.lists(), filters] as const,
        details: () => [...queryKeys.brands.all, 'detail'] as const,
        detail: (id: number) => [...queryKeys.brands.details(), id] as const,
        count: () => [...queryKeys.brands.all, 'count'] as const,
    },

    /**
     * Query keys for product-related queries
     */
    products: 
    {
        all: ['products'] as const,
        lists: () => [...queryKeys.products.all, 'list'] as const,
        list: (filters?: Record<string, unknown>) => [...queryKeys.products.lists(), filters] as const,
        details: () => [...queryKeys.products.all, 'detail'] as const,
        detail: (id: number) => [...queryKeys.products.details(), id] as const,
        byBrand: (brandId: number) => [...queryKeys.products.all, 'brand', brandId] as const,
        count: () => [...queryKeys.products.all, 'count'] as const,
    },
    
    //  매거진 Query Keys (성능 최적화)
    magazines: 
    {
        all: ['magazines'] as const,
        
        // 어드민용 (전체 데이터)
        adminLists: () => [...queryKeys.magazines.all, 'admin', 'list'] as const,
        adminList: (token: string, filters?: Record<string, unknown>) => [...queryKeys.magazines.adminLists(), token, filters] as const,
        
        // 공개용 (카드 데이터 - 성능 최적화)
        publishedCards: (filters?: Record<string, unknown>) => [...queryKeys.magazines.all, 'published', 'cards', filters] as const,
        publishedCard: (id: number) => [...queryKeys.magazines.all, 'published', 'card', id] as const,
        
        // 상세 정보 (전체 데이터)
        details: () => [...queryKeys.magazines.all, 'detail'] as const,
        detail: (id: number) => [...queryKeys.magazines.details(), id] as const,
        
        // 기존 호환성
        lists: () => [...queryKeys.magazines.all, 'list'] as const,
        list: (filters?: Record<string, unknown>) => [...queryKeys.magazines.lists(), filters] as const,
        byBrand: (brandId: number) => [...queryKeys.magazines.all, 'brand', brandId] as const,
        count: (filters?: Record<string, unknown>) => [...queryKeys.magazines.all, 'count', filters] as const,
        
        // 통계
        stats: () => [...queryKeys.magazines.all, 'stats'] as const,
        views: (magazineId: number) => [...queryKeys.magazines.all, 'views', magazineId] as const,
    },

    //이미지 업로드
    upload: 
    {
        all: ['upload'] as const,
    },
}as const

//에러 핸들링 util
export const getErrorMessage = (error: unknown): string => {
    if(error instanceof Error)
    {
        if(error.message.includes('Failed to fetch'))
        {
            return '네트워크 연결을 확인해주세요.'
        }
        if(error.message.includes('404'))
        {
            return '요청하신 데이터를 찾을 수 없습니다.'
        }
        if(error.message.includes('401'))
        {
            return '인증이 필요합니다.'
        }
        if(error.message.includes('403'))
        {
            return '접근 권한이 없습니다.'
        }
        if(error.message.includes('500'))
        {
            return '서버 오류가 발생했습니다.'
        }
    }
    return '알 수 없는 오류가 발생했습니다.'
}

// 캐시 utils
export const cacheUtils = {
    //특정 Query Key의 캐시 무효화
    invalidateQueries: (queryClient: QueryClient, queryKey: readonly unknown[]) => {
        return queryClient.invalidateQueries({queryKey})
    },
    
    //모든 캐시 제거
    clearAll: (queryClient: QueryClient) => {
        return queryClient.clear()
    },

    //특정 Query Key의 캐시 제거
    removeQueries: (queryclient: QueryClient, queryKey: readonly unknown[]) => {
        return queryclient.removeQueries({queryKey})
    },

    //  매거진 관련 캐시 유틸리티 (성능 최적화)
    magazines: {
        // 발행된 매거진 카드 캐시만 무효화
        invalidatePublishedCards: (queryClient: QueryClient, filters?: Record<string, unknown>) => {
            return queryClient.invalidateQueries({
                queryKey: queryKeys.magazines.publishedCards(filters)
            });
        },
        
        // 특정 매거진의 모든 캐시 제거
        removeMagazine: (queryClient: QueryClient, id: number) => {
            queryClient.removeQueries({ queryKey: queryKeys.magazines.detail(id) });
            queryClient.removeQueries({ queryKey: queryKeys.magazines.publishedCard(id) });
        },
        
        // 매거진 조회수 업데이트 (낙관적 업데이트)
        updateViewCount: (queryClient: QueryClient, id: number, increment = 1) => {
            // 카드 데이터 업데이트
            queryClient.setQueryData(
                queryKeys.magazines.publishedCard(id),
                (oldData: unknown) => {
                    const data = oldData as { magazine?: { viewCount?: number } } | undefined;
                    return data ? {
                        ...data,
                        magazine: {
                            ...data.magazine,
                            viewCount: (data.magazine?.viewCount || 0) + increment
                        }
                    } : data;
                }
            );
            
            // 상세 데이터 업데이트
            queryClient.setQueryData(
                queryKeys.magazines.detail(id),
                (oldData: unknown) => {
                    const data = oldData as { magazine?: { viewCount?: number } } | undefined;
                    return data ? {
                        ...data,
                        magazine: {
                            ...data.magazine,
                            viewCount: (data.magazine?.viewCount || 0) + increment
                        }
                    } : data;
                }
            );
        },
    },
}

//  성능 최적화 설정 (환경별)
export const performanceConfig = {
    development: 
    {
        //개발 환경 : 빠른 피드백
        staleTime: 1000 * 30, // 30초
        gcTime: 1000 * 60 * 2, // 2분
        retry: 1,
    },
    production: {
        //프로덕션 환경: 성능 최적화
        staleTime: 1000 * 60 * 5, // 5분
        gcTime: 1000 * 60 * 10, // 10분
        retry: 3,
    },
    
    //   매거진별 캐시 전략
    magazines: {
        // 발행된 매거진 카드 (자주 조회, 캐시 오래 유지)
        publishedCards: {
            staleTime: 1000 * 60 * 10, // 10분
            gcTime: 1000 * 60 * 30, // 30분
        },
        
        // 매거진 상세 (자주 변경될 수 있음)
        detail: {
            staleTime: 1000 * 60 * 2, // 2분
            gcTime: 1000 * 60 * 10, // 10분
        },
        
        // 어드민 리스트 (실시간성 중요)
        adminList: {
            staleTime: 1000 * 30, // 30초
            gcTime: 1000 * 60 * 5, // 5분
        },
    },
}

//  Query 옵션 헬퍼 (편의성)
export const createQueryOptions = {
    // 매거진 카드용 옵션
    magazineCard: (id?: number) => ({
        staleTime: performanceConfig.magazines.publishedCards.staleTime,
        gcTime: performanceConfig.magazines.publishedCards.gcTime,
        enabled: !!id && id > 0,
    }),
    
    // 매거진 상세용 옵션
    magazineDetail: (id?: number) => ({
        staleTime: performanceConfig.magazines.detail.staleTime,
        gcTime: performanceConfig.magazines.detail.gcTime,
        enabled: !!id && id > 0,
    }),
    
    // 어드민용 옵션
    adminList: (token?: string) => ({
        staleTime: performanceConfig.magazines.adminList.staleTime,
        gcTime: performanceConfig.magazines.adminList.gcTime,
        enabled: !!token,
    }),
}