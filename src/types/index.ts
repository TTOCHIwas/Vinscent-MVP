// 🔧 Magazine 관련 타입 (완전 블록 기반 시스템)
export interface Magazine {
  id: number;
  title: string;
  subtitle?: string | null;
  
  // 🔧 isBlockBased 제거: 모든 매거진이 블록 기반
  // content 제거: 레거시 지원 종료
  
  category: 'official' | 'unofficial';
  viewCount: number;
  status: 'draft' | 'published';
  publishedDate?: Date | null;
  
  // 브랜드 직접 입력 방식
  brandName: string;        
  brandUrl?: string | null; 
  
  credits?: string | null; // JSON 문자열로 저장된 크레딧 정보
  createdDate: Date;
  updatedDate: Date;
  
  // 관련 데이터 (선택적)
  blocks?: MagazineBlock[];   // 블록 기반 콘텐츠
  images?: MagazineImage[];   // 레거시 이미지 (호환성용)
}

// Magazine Block 타입 (블록 기반 콘텐츠)
export interface MagazineBlock {
  id: number;
  magazineId: number;
  blockType: 'text' | 'image';
  blockOrder: number;
  
  // 텍스트 블록용
  textContent?: string | null;      // 마크다운 텍스트
  
  // 이미지 블록용
  imageUrl?: string | null;
  imageSource?: string | null;
  
  createdDate: Date;
  updatedDate: Date;
}

// 렌더링용 변환된 블록 타입 (컴포넌트에서 사용)
export interface MagazineBlockDisplay {
  id: number;
  type: 'text' | 'image';
  order: number;
  content: {
    markdown?: string | null;
    imageUrl?: string | null;
    imageSource?: string | null;
  };
}

export interface MagazineImage {
  id: number;
  imageUrl: string;
  imageOrder: number;
  imageCaption?: string | null;  // 레거시 호환용 유지
  imageSource?: string | null;
  magazineId: number;
  createdDate?: Date;
  updatedDate?: Date;
}

// 🔧 MagazineWithImages 수정 (블록 기반 전용)
export interface MagazineWithImages extends Omit<Magazine, 'credits'> {
  blocks?: MagazineBlock[];    // 블록 기반 콘텐츠
  images: MagazineImage[];     // 레거시 이미지
  credits: Array<{
    role: string;
    name: string;
  }>;
}

// 블록 기반 매거진 전용 타입
export interface MagazineWithBlocks extends Omit<Magazine, 'credits' | 'blocks'> {
  blocks: MagazineBlockDisplay[];     // 렌더링용 변환된 블록 (필수)
  credits: Array<{
    role: string;
    name: string;
  }>;
}

// 🔧 MagazinePublishCard 수정 (블록 기반 전용)
export interface MagazinePublishCard {
  id: number;
  title: string;
  subtitle?: string | null;
  viewCount: number;
  category: 'official' | 'unofficial';
  publishedDate?: Date | null;
  
  // 브랜드 정보 직접 포함
  brandName: string;        
  brandUrl?: string | null; 
  
  createdDate: Date;
  updatedDate: Date;
  thumbnail: MagazineImage;
}

// 어드민 매거진 카드용 타입 (관리자 전용)
export interface MagazineAdminCard {
  id: number;
  title: string;
  subtitle?: string | null;
  category: 'official' | 'unofficial';
  viewCount: number;
  status: 'draft' | 'published';
  publishedDate?: Date | null;
  
  // 브랜드 정보
  brandName: string;
  brandUrl?: string | null;
  
  createdDate: Date;
  updatedDate: Date;
  thumbnail: MagazineImage;
}

// 🔧 생성/수정 관련 타입 (블록 기반 전용)
export interface CreateMagazineData {
  title: string;
  subtitle?: string;
  category?: 'official' | 'unofficial';
  status?: 'draft' | 'published';
  
  // 브랜드 정보 직접 입력
  brandName: string;        // 필수
  brandUrl?: string;        // 선택사항
  
  credits?: MagazineCreditItem[]; // 크레딧 정보
  
  // 블록 기반 콘텐츠 (표준)
  blocks?: Array<{
    type: 'text' | 'image';
    order: number;
    content: {
      // 텍스트 블록
      markdown?: string;
      // 이미지 블록
      imageUrl?: string;
      imageSource?: string;
    };
  }>;
  
  // 🔧 레거시 content, images 제거: 블록 기반 전용
}

export interface UpdateMagazineData {
  title?: string;
  subtitle?: string;
  category?: 'official' | 'unofficial';
  status?: 'draft' | 'published';
  
  // 브랜드 정보 수정 가능
  brandName?: string;
  brandUrl?: string;
  
  credits?: MagazineCreditItem[]; // 크레딧 정보
  
  // 블록 기반 콘텐츠
  blocks?: Array<{
    type: 'text' | 'image';
    order: number;
    content: {
      // 텍스트 블록
      markdown?: string;
      // 이미지 블록
      imageUrl?: string;
      imageSource?: string;
    };
  }>;
  
  // 🔧 레거시 images 제거: 블록 기반 전용
}

// ===== 기존 유지되는 타입들 =====

// Admin 관련 타입
export interface AdminUser {
  id: number;
  name: string;
  role: 'developer' | 'designer' | 'marketing' | 'pm';
  key: string;
  isActive: boolean;
  createdDate: Date;
  updatedDate: Date;
}

// 통계 관련 타입
export interface MagazineView {
  id: number;
  magazineId: number;
  viewDate: Date;
  viewCount: number;
  createdDate: Date;
}

export interface Statistics {
  totalMagazines: number;
  totalViews: number;
  topMagazines: MagazineWithImages[];
  dailyViews: {
    date: string;
    count: number;
  }[];
  weeklyViews: {
    week: string;
    count: number;
  }[];
  monthlyViews: {
    month: string;
    count: number;
  }[];
}

// API Response 타입
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 페이지네이션 옵션
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: 'latest' | 'popular' | 'oldest';
  category?: 'official' | 'unofficial';
}

// 어드민 토큰 타입
export interface TokenInfo {
  role: 'developer' | 'designer' | 'marketing' | 'pm';
  isValid: boolean;
  expiresAt: Date;
}

// MagazineCardProps 수정
export interface MagazineCardProps {
  magazine: MagazinePublishCard;
  onImageClick?: (magazine: MagazinePublishCard) => void;
  onLinkClick?: (magazine: MagazinePublishCard) => void;
  loading?: boolean;
  className?: string;
  showBrand?: boolean;
  showDate?: boolean;
  imageHeight?: number;
  layout?: 'vertical' | 'horizontal';
  useRelativeTime?: boolean;
}

// ===== 매거진 상세 페이지 전용 타입 =====

// 크레딧 정보 타입
export interface MagazineCreditItem {
  role: string;  // "에디터", "디자이너", "포토그래퍼" 등
  name: string;
}

// 매거진 상세 정보
export interface MagazineDetail extends Omit<Magazine, 'credits'> {
  images: MagazineImage[];          // 모든 이미지 정보
  credits: MagazineCreditItem[];    // 파싱된 크레딧 정보
}

// 매거진 콘텐츠 섹션 (이미지 + 내용 조합)
export interface MagazineContentSection {
  id: string;                    // 섹션 고유 ID
  type: 'image' | 'text' | 'image_text';
  order: number;                 // 섹션 순서
  image?: {
    url: string;
    alt: string;
    caption?: string;            
    source?: string;             
  };
  content?: string;              // 텍스트 내용
  title?: string;                // 섹션 제목
}

// 매거진 상세 페이지 컴포넌트 Props
export interface MagazineDetailPageProps {
  magazine: MagazineDetail;
  recommendedMagazines?: MagazinePublishCard[];
}

// 매거진 헤더 컴포넌트 Props
export interface MagazineDetailHeaderProps {
  magazine: MagazineDetail;
  showViews?: boolean;
  showCategory?: boolean;
  showMeta?: boolean;
}

// 매거진 콘텐츠 섹션 컴포넌트 Props
export interface MagazineContentSectionProps {
  section: MagazineContentSection;
  loading?: boolean;
}

// 매거진 크레딧 컴포넌트 Props
export interface MagazineCreditsProps {
  credits: MagazineCreditItem[];
  title?: string;
}

// 매거진 추천 섹션 컴포넌트 Props
export interface MagazineRecommendationsProps {
  title: string;
  magazines: MagazinePublishCard[];
  maxItems?: number;
  loading?: boolean;
  onMagazineClick?: (magazine: MagazinePublishCard) => void;
}

// Admin Activity Log 타입
export interface AdminActivityLog {
  id: number;
  action: 'create' | 'update' | 'delete' | 'view';
  tableName: string;
  recordId: number;
  adminId?: number;
  adminName?: string;
  ipAddress: string;
  userAgent?: string;
  changes?: string;
  timestamp: Date;
}

// 매거진 통계 데이터 타입
export interface MagazineStatistics {
  totalMagazines: number;
  publishedCount: number;
  draftCount: number;
  totalViews: number;
  recentCreated: number;
  recentUpdated: number;
  dailyViews: Array<{
    date: string;
    count: number;
  }>;
  recentActivity: Array<{
    id: number;
    title: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    timestamp: string;
    status: string;
    category: string;
  }>;
}