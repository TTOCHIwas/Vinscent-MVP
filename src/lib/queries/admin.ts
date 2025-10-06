import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  CreateMagazineData, 
  UpdateMagazineData, 
  MagazineWithImages, 
  PaginatedResponse,
  ApiResponse 
} from '@/types'

// 토큰 가져오기 유틸리티
const getAdminToken = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_token') || '';
  }
  return '';
};

// queryKeys 팩토리 (캐시 관리)
export const adminQueryKeys = {
  magazines: {
    all: ['admin', 'magazines'] as const,
    lists: () => [...adminQueryKeys.magazines.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => 
      [...adminQueryKeys.magazines.lists(), filters] as const,
    details: () => [...adminQueryKeys.magazines.all, 'detail'] as const,
    detail: (id: number) => [...adminQueryKeys.magazines.details(), id] as const,
    stats: () => [...adminQueryKeys.magazines.all, 'stats'] as const,
  },
  brands: {
    all: ['admin', 'brands'] as const,
    lists: () => [...adminQueryKeys.brands.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => 
      [...adminQueryKeys.brands.lists(), filters] as const,
    details: () => [...adminQueryKeys.brands.all, 'detail'] as const,
    detail: (id: number) => [...adminQueryKeys.brands.details(), id] as const,
  }
} as const;

// ===== API 호출 함수들 =====

const adminApi = {
  // 모든 매거진 조회 (어드민용 - 모든 상태 포함)
  getMagazines: async (params: {
    page?: number;
    limit?: number;
    status?: 'draft' | 'published';
    category?: 'official' | 'unofficial';
  } = {}): Promise<PaginatedResponse<MagazineWithImages>> => {
    const token = getAdminToken();
    const searchParams = new URLSearchParams({ token });
    
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.status) searchParams.set('status', params.status);
    if (params.category) searchParams.set('category', params.category);
    
    const response = await fetch(`/api/control/magazines?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error(`어드민 매거진 조회 실패: ${response.status}`);
    }
    return response.json();
  },

  // 매거진 개수 조회
  getMagazineCount: async (params: {
    status?: 'draft' | 'published';
    category?: 'official' | 'unofficial';
  } = {}): Promise<ApiResponse<{ count: number }>> => {
    const token = getAdminToken();
    const searchParams = new URLSearchParams({ token, count: 'true' });
    
    if (params.status) searchParams.set('status', params.status);
    if (params.category) searchParams.set('category', params.category);
    
    const response = await fetch(`/api/control/magazines?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error(`매거진 개수 조회 실패: ${response.status}`);
    }
    return response.json();
  },

  // 특정 매거진 조회 (어드민용)
  getMagazineById: async (id: number): Promise<ApiResponse<MagazineWithImages>> => {
    const token = getAdminToken();
    const response = await fetch(`/api/control/magazines/${id}?token=${token}`);
    if (!response.ok) {
      throw new Error(`매거진 상세 조회 실패: ${response.status}`);
    }
    return response.json();
  },

  // 매거진 생성
  createMagazine: async (data: CreateMagazineData): Promise<ApiResponse<MagazineWithImages>> => {
    const token = getAdminToken();
    const response = await fetch(`/api/control/magazines?token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`매거진 생성 실패: ${response.status}`);
    }
    return response.json();
  },

  // 매거진 수정
  updateMagazine: async (params: { 
    id: number; 
    data: UpdateMagazineData 
  }): Promise<ApiResponse<MagazineWithImages>> => {
    const token = getAdminToken();
    const { id, data } = params;
    
    const response = await fetch(`/api/control/magazines/${id}?token=${token}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`매거진 수정 실패: ${response.status}`);
    }
    return response.json();
  },

  // 매거진 삭제
  deleteMagazine: async (id: number): Promise<ApiResponse<{ deletedId: number }>> => {
    const token = getAdminToken();
    const response = await fetch(`/api/control/magazines/${id}?token=${token}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`매거진 삭제 실패: ${response.status}`);
    }
    return response.json();
  },
};

// ===== React Query Hooks =====

/**
 * 어드민 매거진 목록 조회 훅
 */
export const useAdminMagazines = (params: {
  page?: number;
  limit?: number;
  status?: 'draft' | 'published';
  category?: 'official' | 'unofficial';
} = {}) => {
  return useQuery({
    queryKey: adminQueryKeys.magazines.list(params),
    queryFn: () => adminApi.getMagazines(params),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    refetchOnWindowFocus: false,
  });
};

/**
 * 매거진 개수 조회 훅
 */
export const useAdminMagazineCount = (params: {
  status?: 'draft' | 'published';
  category?: 'official' | 'unofficial';
} = {}) => {
  return useQuery({
    queryKey: [...adminQueryKeys.magazines.stats(), 'count', params],
    queryFn: () => adminApi.getMagazineCount(params),
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분
  });
};

/**
 * 특정 매거진 상세 조회 훅
 */
export const useAdminMagazine = (id: number) => {
  return useQuery({
    queryKey: adminQueryKeys.magazines.detail(id),
    queryFn: () => adminApi.getMagazineById(id),
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 10 * 60 * 1000, // 10분
    enabled: !!id && id > 0,
  });
};

/**
 * 매거진 CRUD Mutations
 */
export const useMagazineMutations = () => {
  const queryClient = useQueryClient();

  // 매거진 생성 Mutation
  const createMutation = useMutation({
    mutationFn: adminApi.createMagazine,
    onSuccess: (response) => {
      if (response.success && response.data) {
        // 모든 매거진 목록 쿼리 무효화
        queryClient.invalidateQueries({
          queryKey: adminQueryKeys.magazines.lists()
        });
        
        // 통계 쿼리 무효화
        queryClient.invalidateQueries({
          queryKey: adminQueryKeys.magazines.stats()
        });
      }
    },
  });

  // 매거진 수정 Mutation
  const updateMutation = useMutation({
    mutationFn: adminApi.updateMagazine,
    onSuccess: (response, variables) => {
      if (response.success && response.data) {
        const { id } = variables;
        
        // 해당 매거진 상세 캐시 업데이트
        queryClient.setQueryData(
          adminQueryKeys.magazines.detail(id),
          response
        );
        
        // 매거진 목록 쿼리 무효화
        queryClient.invalidateQueries({
          queryKey: adminQueryKeys.magazines.lists()
        });
      }
    },
  });

  // 매거진 삭제 Mutation (낙관적 업데이트)
  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteMagazine,
    onMutate: async (deletingId) => {
      // 진행 중인 쿼리들 취소
      await queryClient.cancelQueries({
        queryKey: adminQueryKeys.magazines.lists()
      });

      // 이전 데이터 스냅샷 저장
      const previousMagazines = queryClient.getQueriesData({
        queryKey: adminQueryKeys.magazines.lists()
      });

      // 낙관적 업데이트: 매거진 목록에서 제거
      queryClient.setQueriesData(
        { queryKey: adminQueryKeys.magazines.lists() },
        (old: unknown) => {
          const prev = old as PaginatedResponse<MagazineWithImages> | undefined;
          if (!prev?.data) return prev;
          
          return {
            ...prev,
            data: prev.data.filter((m) => m.id !== deletingId)
          };
        }
      );

      return { previousMagazines };
    },
    onError: (err, deletingId, context) => {
      // 실패 시 이전 상태로 복원
      if (context?.previousMagazines) {
        context.previousMagazines.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: (response, error, deletingId) => {
      // 성공/실패 관계없이 관련 쿼리들 리페치
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.magazines.lists()
      });
      
      // 삭제된 매거진의 상세 캐시 제거
      queryClient.removeQueries({
        queryKey: adminQueryKeys.magazines.detail(deletingId)
      });
      
      // 통계 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.magazines.stats()
      });
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
  };
};

// 캐시 유틸리티 함수들
export const adminCacheUtils = {
  // 매거진 목록 캐시 무효화
  invalidateMagazinesList: (queryClient: ReturnType<typeof useQueryClient>) => {
    queryClient.invalidateQueries({
      queryKey: adminQueryKeys.magazines.lists()
    });
  },

  // 특정 매거진 캐시 제거
  removeMagazine: (queryClient: ReturnType<typeof useQueryClient>, id: number) => {
    queryClient.removeQueries({
      queryKey: adminQueryKeys.magazines.detail(id)
    });
  },

  // 모든 매거진 관련 캐시 제거
  clearMagazinesCache: (queryClient: ReturnType<typeof useQueryClient>) => {
    queryClient.removeQueries({
      queryKey: adminQueryKeys.magazines.all
    });
  },
};

export default {
  useAdminMagazines,
  useAdminMagazineCount,
  useAdminMagazine,
  useMagazineMutations,
  adminCacheUtils,
};