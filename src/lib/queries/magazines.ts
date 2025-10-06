import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CreateMagazineData, UpdateMagazineData, MagazineWithImages, MagazinePublishCard } from '@/types'

const magazinesApi = {
  // NEW: 메인 페이지 전용 API
  getHomeMagazines: async (): Promise<{
    success: boolean;
    data: {
      topMagazines: MagazinePublishCard[];
      latestMagazines: MagazinePublishCard[];
    };
    meta: {
      topCount: number;
      latestCount: number;
      cacheHint: string;
    };
    error?: string;
  }> => {
    const response = await fetch('/api/magazines/home')
    if (!response.ok) throw new Error('Failed to fetch home magazines')
    return response.json()
  },

  // 모든 매거진 조회
  getAll: async (): Promise<{ success: boolean; data: MagazineWithImages[]; error?: string }> => {
    const response = await fetch('/api/magazines')
    if (!response.ok) throw new Error('Failed to fetch magazines')
    return response.json()
  },

  // 브랜드별 매거진 조회
  getByBrand: async (brandId: number): Promise<{ success: boolean; data: MagazineWithImages[]; error?: string }> => {
    const response = await fetch(`/api/magazines?brandId=${brandId}`)
    if (!response.ok) throw new Error('Failed to fetch magazines by brand')
    return response.json()
  },

  // 특정 매거진 조회 (이미지 포함)
  getById: async (id: number): Promise<{ success: boolean; data: MagazineWithImages; error?: string }> => {
    const response = await fetch(`/api/magazines/${id}`)
    if (!response.ok) throw new Error('Failed to fetch magazine')
    return response.json()
  },

  // 발행된 매거진 카드 조회 (성능 최적화)
  getPublishedCards: async (params: {
    page?: number;
    limit?: number;
    category?: 'official' | 'unofficial';
  } = {}): Promise<{
    success: boolean;
    data: MagazinePublishCard[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    error?: string;
  }> => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.category) searchParams.set('category', params.category);
    
    const response = await fetch(`/api/magazines/cards?${searchParams.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch magazine cards');
    return response.json();
  },

  // 매거진 생성 (다중 이미지)
  create: async (data: CreateMagazineData): Promise<{ success: boolean; data: MagazineWithImages; error?: string }> => {
    const response = await fetch('/api/magazines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create magazine')
    return response.json()
  },

  // 매거진 수정 (타입 에러 수정) - 명확한 매개변수 타입 정의
  update: async (params: { id: number; data: UpdateMagazineData }): Promise<{ 
    success: boolean; 
    data: MagazineWithImages; 
    error?: string 
  }> => {
    const { id, data } = params;
    const response = await fetch(`/api/magazines/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update magazine')
    return response.json()
  },

  // 매거진 삭제 (타입 에러 수정) - 명확한 매개변수 타입 정의
  delete: async (id: number): Promise<{ success: boolean; data: { id: number; deleted: boolean }; error?: string }> => {
    const response = await fetch(`/api/magazines/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete magazine')
    return response.json()
  },

  // 조회수 증가
  incrementView: async (id: number): Promise<{ success: boolean; data?: { viewCount: number }; error?: string }> => {
    const response = await fetch(`/api/magazines/${id}/view`, {
      method: 'POST',
    })
    if (!response.ok) throw new Error('Failed to increment view count')
    return response.json()
  },

  // 매거진 개수 조회
  getCount: async (): Promise<{ success: boolean; data: { count: number }; error?: string }> => {
    const response = await fetch('/api/magazines?count=true')
    if (!response.ok) throw new Error('Failed to fetch magazine count')
    return response.json()
  },

  // 어드민 API - 토큰 기반 접근
  admin: {
    // 전체 매거진 조회 (어드민용)
    getAll: async (token: string): Promise<{ success: boolean; data: MagazineWithImages[]; error?: string }> => {
      const response = await fetch(`/api/control/magazines?token=${token}`)
      if (!response.ok) throw new Error('Failed to fetch admin magazines')
      return response.json()
    },

    // 매거진 생성 (어드민용)
    create: async (params: { data: CreateMagazineData; token: string }): Promise<{ 
      success: boolean; 
      data: MagazineWithImages; 
      error?: string 
    }> => {
      const { data, token } = params;
      const response = await fetch(`/api/control/magazines?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create admin magazine')
      return response.json()
    },

    // 매거진 수정 (어드민용)
    update: async (params: { id: number; data: UpdateMagazineData; token: string }): Promise<{ 
      success: boolean; 
      data: MagazineWithImages; 
      error?: string 
    }> => {
      const { id, data, token } = params;
      const response = await fetch(`/api/control/magazines/${id}?token=${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update admin magazine')
      return response.json()
    },

    // 매거진 삭제 (어드민용)
    delete: async (params: { id: number; token: string }): Promise<{ 
      success: boolean; 
      data: { id: number; deleted: boolean }; 
      error?: string 
    }> => {
      const { id, token } = params;
      const response = await fetch(`/api/control/magazines/${id}?token=${token}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete admin magazine')
      return response.json()
    },
  },
}

// Query 훅스 - 완전한 타입 지정
export const useMagazines = () => {
  return useQuery({
    queryKey: ['magazines'],
    queryFn: magazinesApi.getAll,
  })
}

export const useMagazinesByBrand = (brandId: number) => {
  return useQuery({
    queryKey: ['magazines', 'brand', brandId],
    queryFn: () => magazinesApi.getByBrand(brandId),
    enabled: !!brandId, // brandId가 있을 때만 실행
  })
}

export const useMagazine = (id: number) => {
  return useQuery({
    queryKey: ['magazines', id],
    queryFn: () => magazinesApi.getById(id),
    enabled: !!id, // id가 있을 때만 실행
  })
}

// 발행된 매거진 카드 조회 (성능 최적화)
export const useMagazineCards = (params: {
  page?: number;
  limit?: number;
  category?: 'official' | 'unofficial';
} = {}) => {
  return useQuery({
    queryKey: ['magazines', 'cards', params],
    queryFn: () => magazinesApi.getPublishedCards(params),
  })
}

export const useMagazineCount = () => {
  return useQuery({
    queryKey: ['magazines', 'count'],
    queryFn: magazinesApi.getCount,
  })
}

// Mutation 훅스 - 완전한 제네릭 타입 지정으로 에러 해결
export const useCreateMagazine = () => {
  const queryClient = useQueryClient()

  return useMutation<
    { success: boolean; data: MagazineWithImages; error?: string }, // TData - 반환 타입
    Error, // TError - 에러 타입
    CreateMagazineData, // TVariables - 매개변수 타입
    unknown // TContext - 컨텍스트 타입
  >({
    mutationFn: magazinesApi.create,
    onSuccess: () => {
      // 성공 시 관련 쿼리들 갱신
      queryClient.invalidateQueries({ queryKey: ['magazines'] })
      queryClient.invalidateQueries({ queryKey: ['magazines', 'brand'] }) // 모든 브랜드 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['magazines', 'count'] })
      queryClient.invalidateQueries({ queryKey: ['magazines', 'cards'] })
    },
  })
}

// 매거진 수정 훅 - 타입 에러 완전 해결
export const useUpdateMagazine = () => {
  const queryClient = useQueryClient()

  return useMutation<
    { success: boolean; data: MagazineWithImages; error?: string }, // TData
    Error, // TError
    { id: number; data: UpdateMagazineData }, // TVariables - 정확한 매개변수 타입
    unknown // TContext
  >({
    mutationFn: magazinesApi.update, // 이제 타입이 정확히 매칭됨
    onSuccess: (_data, variables) => {
      // 성공 시 관련 쿼리들 갱신
      queryClient.invalidateQueries({ queryKey: ['magazines'] })
      queryClient.invalidateQueries({ queryKey: ['magazines', variables.id] }) // variables.id 타입 에러 해결
      queryClient.invalidateQueries({ queryKey: ['magazines', 'brand'] })
      queryClient.invalidateQueries({ queryKey: ['magazines', 'cards'] })
    },
  })
}

// 매거진 삭제 훅 - 타입 에러 완전 해결
export const useDeleteMagazine = () => {
  const queryClient = useQueryClient()

  return useMutation<
    { success: boolean; data: { id: number; deleted: boolean }; error?: string }, // TData
    Error, // TError
    number, // TVariables - id만 필요
    unknown // TContext
  >({
    mutationFn: magazinesApi.delete, // 이제 타입이 정확히 매칭됨
    onSuccess: () => {
      // 성공 시 모든 매거진 관련 쿼리 갱신
      queryClient.invalidateQueries({ queryKey: ['magazines'] })
      queryClient.invalidateQueries({ queryKey: ['magazines', 'cards'] })
    },
  })
}

// 조회수 증가 훅
export const useIncrementMagazineView = () => {
  const queryClient = useQueryClient()

  return useMutation<
    { success: boolean; data?: { viewCount: number }; error?: string },
    Error,
    number,
    unknown
  >({
    mutationFn: magazinesApi.incrementView,
    onSuccess: (data, magazineId) => {
      // 특정 매거진만 갱신
      queryClient.invalidateQueries({ queryKey: ['magazines', magazineId] })
      queryClient.invalidateQueries({ queryKey: ['magazines', 'cards'] })
    },
  })
}

// 어드민 전용 훅스 - 토큰 기반
export const useAdminMagazines = (token: string) => {
  return useQuery({
    queryKey: ['admin', 'magazines', token],
    queryFn: () => magazinesApi.admin.getAll(token),
    enabled: !!token, // 토큰이 있을 때만 실행
  })
}

export const useCreateAdminMagazine = () => {
  const queryClient = useQueryClient()

  return useMutation<
    { success: boolean; data: MagazineWithImages; error?: string },
    Error,
    { data: CreateMagazineData; token: string },
    unknown
  >({
    mutationFn: magazinesApi.admin.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'magazines'] })
      queryClient.invalidateQueries({ queryKey: ['magazines'] })
      queryClient.invalidateQueries({ queryKey: ['magazines', 'cards'] })
    },
  })
}

export const useUpdateAdminMagazine = () => {
  const queryClient = useQueryClient()

  return useMutation<
    { success: boolean; data: MagazineWithImages; error?: string },
    Error,
    { id: number; data: UpdateMagazineData; token: string },
    unknown
  >({
    mutationFn: magazinesApi.admin.update,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'magazines'] })
      queryClient.invalidateQueries({ queryKey: ['magazines', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['magazines', 'cards'] })
    },
  })
}

export const useDeleteAdminMagazine = () => {
  const queryClient = useQueryClient()

  return useMutation<
    { success: boolean; data: { id: number; deleted: boolean }; error?: string },
    Error,
    { id: number; token: string },
    unknown
  >({
    mutationFn: magazinesApi.admin.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'magazines'] })
      queryClient.invalidateQueries({ queryKey: ['magazines'] })
      queryClient.invalidateQueries({ queryKey: ['magazines', 'cards'] })
    },
  })
}

// 브랜드와 매거진 연동 훅스 - 성능 최적화
export const useBrandWithMagazines = (brandId: number) => {
  const brandQuery = useQuery({
    queryKey: ['brands', brandId],
    queryFn: async () => {
      const response = await fetch(`/api/brands/${brandId}`)
      if (!response.ok) throw new Error('Failed to fetch brand')
      return response.json()
    },
    enabled: !!brandId,
  })

  const magazinesQuery = useMagazinesByBrand(brandId)

  return {
    brand: brandQuery.data,
    magazines: magazinesQuery.data,
    isLoading: brandQuery.isLoading || magazinesQuery.isLoading,
    error: brandQuery.error || magazinesQuery.error,
  }
}

// NEW: 메인 페이지 전용 훅 - 조회수 상위 3개 + 최신 8개 동시 조회
export const useHomeMagazines = () => {
  return useQuery({
    queryKey: ['magazines', 'home'],
    queryFn: async () => {
      const response = await fetch('/api/magazines/home');
      if (!response.ok) throw new Error('Failed to fetch home magazines');
      return response.json() as Promise<{
        success: boolean;
        data: {
          topMagazines: MagazinePublishCard[];
          latestMagazines: MagazinePublishCard[];
        };
        meta: {
          topCount: number;
          latestCount: number;
          cacheHint: string;
        };
        error?: string;
      }>;
    },
    staleTime: 5 * 60 * 1000, // 5분 캐싱 (실무 기준)
    gcTime: 10 * 60 * 1000,   // 10분 가비지 컬렉션
    refetchOnWindowFocus: false, // 포커스 시 자동 갱신 비활성화
    retry: 2, // 실패 시 2번 재시도
  })
}

// 개별 조회용 훅들 (필요 시 사용)
export const useTopMagazines = (limit = 3) => {
  return useQuery({
    queryKey: ['magazines', 'top', limit],
    queryFn: async () => {
      const response = await fetch(`/api/magazines/top?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch top magazines');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    enabled: false, // 기본적으로 비활성화 (useHomeMagazines 사용 권장)
  })
}

export const useLatestMagazines = (limit = 8) => {
  return useQuery({
    queryKey: ['magazines', 'latest', limit],
    queryFn: async () => {
      const response = await fetch(`/api/magazines/latest?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch latest magazines');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    enabled: false, // 기본적으로 비활성화 (useHomeMagazines 사용 권장)
  })
}

// NEW: Hero & Carousel 전용 훅스 (메인 페이지 최적화)
export const useHeroMagazines = () => {
  return useQuery({
    queryKey: ['magazines', 'hero'],
    queryFn: async () => {
      const response = await fetch('/api/magazines/hero');
      if (!response.ok) throw new Error('Failed to fetch hero magazines');
      return response.json() as Promise<{
        success: boolean;
        data: MagazinePublishCard[];
        error?: string;
      }>;
    },
    staleTime: 5 * 60 * 1000, // 5분 캐싱
    gcTime: 10 * 60 * 1000,   // 10분 가비지 컬렉션
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

export const useCarouselMagazines = () => {
  return useQuery({
    queryKey: ['magazines', 'carousel'],
    queryFn: async () => {
      const response = await fetch('/api/magazines/carousel');
      if (!response.ok) throw new Error('Failed to fetch carousel magazines');
      return response.json() as Promise<{
        success: boolean;
        data: MagazinePublishCard[]; // 🔧 API 타입과 통일
        error?: string;
      }>;
    },
    staleTime: 3 * 60 * 1000, // 3분 캐싱 (더 자주 업데이트)
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  })
}
export const useMagazineNavigation = () => {
  const queryClient = useQueryClient()
  
  const prefetchMagazine = (id: number) => {
    queryClient.prefetchQuery({
      queryKey: ['magazines', id],
      queryFn: () => magazinesApi.getById(id),
    })
  }
  
  // 메인 페이지 데이터 프리페치
  const prefetchHomeMagazines = () => {
    queryClient.prefetchQuery({
      queryKey: ['magazines', 'home'],
      queryFn: async () => {
        const response = await fetch('/api/magazines/home');
        if (!response.ok) throw new Error('Failed to fetch home magazines');
        return response.json();
      },
    })
  }
  
  return { 
    prefetchMagazine,
    prefetchHomeMagazines 
  }
}