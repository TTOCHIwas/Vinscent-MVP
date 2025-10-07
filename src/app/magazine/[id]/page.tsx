import React from 'react';
import { notFound } from 'next/navigation';

// 분리된 컴포넌트들 import
import MagazineDetailHeader from '@/components/features/magazine-detail/MagazineDetailHeader';
import MagazineBlockRenderer from '@/components/features/magazine-detail/MagazineBlockRenderer';
import MagazineCredits from '@/components/features/magazine-detail/MagazineCredits';
import MagazineRecommendations from '@/components/features/magazine-detail/MagazineRecommendations';

interface MagazineDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// 실제 API에서 매거진 데이터 가져오기
const getMagazineData = async (id: string) => {
  try {
    console.log('[DEBUG] Fetching magazine data for ID:', id);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/magazines/${id}`, {
      cache: 'no-store', // 항상 최신 데이터 가져오기
    });
    
    console.log('[DEBUG] API Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[DEBUG] API Response error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('[DEBUG] API Response data:', JSON.stringify(result, null, 2));
    
    if (!result.success) {
      console.error('[DEBUG] API returned success: false, error:', result.error);
      throw new Error(result.error || 'Failed to fetch magazine');
    }
    
    return result.magazine;
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
                  {process.env.NODE_ENV === 'development' && (
                    <details style={{ marginTop: '1rem', fontSize: '12px' }}>
                      <summary> 개발자 디버그 정보</summary>
                      <pre>{JSON.stringify(magazine, null, 2)}</pre>
                    </details>
                  )}
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
    
    // 개발 모드에서는 에러 정보 표시
    // if (process.env.NODE_ENV === 'development') {
    //   return (
    //     <div className="magazine-detail">
    //       <div className="magazine-detail__container">
    //         <h1>Debug Error Information</h1>
    //         <p><strong>Magazine ID:</strong> {id}</p>
    //         <p><strong>Error:</strong> {error instanceof Error ? error.message : String(error)}</p>
    //         <details>
    //           <summary>Error Stack</summary>
    //           <pre style={{ fontSize: '12px', overflow: 'auto' }}>
    //             {error instanceof Error ? error.stack : 'No stack trace'}
    //           </pre>
    //         </details>
    //         <details>
    //           <summary>Debug Info</summary>
    //           <ul>
    //             <li>API URL: {process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/magazines/{id}</li>
    //             <li>Node ENV: {process.env.NODE_ENV}</li>
    //             <li>Magazine ID: {numericId}</li>
    //           </ul>
    //         </details>
    //       </div>
    //     </div>
    //   );
    // }
    
    notFound();
  }
};

export default MagazineDetailPage;