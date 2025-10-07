import React from 'react';
import { notFound } from 'next/navigation';

// 분리된 컴포넌트들 import
import MagazineDetailHeader from '@/components/features/magazine-detail/MagazineDetailHeader';
import MagazineBlockRenderer from '@/components/features/magazine-detail/MagazineBlockRenderer';
import MagazineCredits from '@/components/features/magazine-detail/MagazineCredits';
import MagazineRecommendations from '@/components/features/magazine-detail/MagazineRecommendations';

// 🔧 데이터베이스 직접 접근 (서버 컴포넌트)
import { getMagazineById } from '@/lib/db/operations/magazines';

interface MagazineDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// 🔧 generateStaticParams: 빌드 시 매거진 ID 목록 제공
export async function generateStaticParams() {
  try {
    // 발행된 매거진 ID 목록 가져오기
    const { getPublishedMagazineIds } = await import('@/lib/db/operations/magazines');
    const ids = await getPublishedMagazineIds();
    
    console.log('[DEBUG] generateStaticParams - Magazine IDs:', ids);
    
    return ids.map((id) => ({
      id: String(id),
    }));
  } catch (error) {
    console.error('[DEBUG] generateStaticParams failed:', error);
    // 빌드 실패 방지
    return [];
  }
}

// 🔧 수정: 데이터베이스 직접 접근 (API 호출 대신)
const getMagazineData = async (id: string) => {
  try {
    console.log('[DEBUG] Fetching magazine data for ID:', id);
    
    const numericId = parseInt(id);
    if (isNaN(numericId) || numericId <= 0) {
      throw new Error('Invalid magazine ID');
    }
    
    // 데이터베이스에서 직접 가져오기
    const result = await getMagazineById(numericId);
    
    // ApiResponse 언랩
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Magazine not found');
    }
    
    const magazine = result.data;
    
    console.log('[DEBUG] Magazine data loaded:', {
      title: magazine.title,
      blocksCount: magazine.blocks?.length || 0
    });
    
    return magazine;
  } catch (error) {
    console.error('[DEBUG] getMagazineData failed:', error);
    throw error;
  }
};

const MagazineDetailPage: React.FC<MagazineDetailPageProps> = async ({ params }) => {
  const { id } = await params;
  console.log('[DEBUG] Magazine detail page called with ID:', id);

  // ID 유효성 검사
  const numericId = parseInt(id);
  if (isNaN(numericId) || numericId <= 0) {
    console.error('[DEBUG] Invalid ID provided:', id);
    notFound();
  }

  try {
    const magazine = await getMagazineData(id);
    
    if (!magazine) {
      console.error('[DEBUG] No magazine data returned');
      notFound();
    }

    console.log('[DEBUG] Magazine data loaded successfully:', {
      title: magazine.title,
      brandName: magazine.brandName,
      brandUrl: magazine.brandUrl,
      blocksCount: magazine.blocks?.length || 0
    });

    return (
      <div className="magazine-detail">
        <div className="magazine-detail__container">
          
          <MagazineDetailHeader
            title={magazine.title}
            subtitle={magazine.subtitle}
            category={magazine.category}
            authorName={magazine.brandName}        
            authorUrl={magazine.brandUrl}          
            publishedDate={magazine.publishedDate}
            viewCount={magazine.viewCount}
          />

          {/* 콘텐츠 영역 */}
          {magazine.blocks && magazine.blocks.length > 0 ? (
            // 블록 기반 렌더링 (모든 매거진)
            <MagazineBlockRenderer
              blocks={magazine.blocks}
              magazineTitle={magazine.title}
            />
          ) : (
            <div className="magazine-detail__main">
              <div className="magazine-detail__content">
                <div className="magazine-detail__section">
                  <p style={{ 
                    textAlign: 'center', 
                    color: '#999', 
                    padding: '2rem',
                    fontStyle: 'italic' 
                  }}>
                    매거진 콘텐츠가 없습니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 크레딧 영역 - 컴포넌트로 분리됨 */}
          <MagazineCredits
            credits={magazine.credits || []}
          />

          {/* 향상된 추천 매거진 영역 */}
          <MagazineRecommendations
            title="최신 매거진"
            currentMagazineId={numericId} // 현재 매거진 제외
            maxItems={3}
            category={undefined} // 모든 카테고리
          />

        </div>
      </div>
    );
    
  } catch (error) {
    console.error('[DEBUG] Magazine detail page error:', error);
    notFound();
  }
};

export default MagazineDetailPage;
