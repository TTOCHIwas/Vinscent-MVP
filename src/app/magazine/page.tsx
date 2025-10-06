import { Suspense } from 'react';
import MagazineListContent from './MagazineListContent';

/**
 * 로딩 폴백 컴포넌트
 */
function MagazineListLoading() {
  return (
    <div className="magazine-page">
      <header className="magazine-header">
        <div className="magazine-header__title-section">
          <h1 className="magazine-header__title">MAGAZINE</h1>
          <p className="magazine-header__subtitle">매거진을 불러오는 중...</p>
        </div>
      </header>
      <main className="magazine-content">
        <div className="magazine-grid-section">
          <div className="magazine-loading-skeleton">
            Loading...
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * 매거진 리스트 페이지 (서버 컴포넌트)
 * 
 * @description
 * - Suspense 경계로 클라이언트 컴포넌트를 감쌈
 * - useSearchParams() 사용을 위한 올바른 패턴
 * - NextJS 15 권장 구조
 */
export default function MagazineListPage() {
  return (
    <Suspense fallback={<MagazineListLoading />}>
      <MagazineListContent />
    </Suspense>
  );
}
