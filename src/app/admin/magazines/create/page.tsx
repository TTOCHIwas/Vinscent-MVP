import { Suspense } from 'react';
import CreateMagazineContent from './CreateMagazineContent';
import AdminLayout from '../../../../components/admin/AdminLayout';

/**
 * 로딩 폴백 컴포넌트
 */
function CreateMagazineLoading() {
  return (
    <AdminLayout
      title="매거진 작성"
      description="로딩 중..."
      requireAuth={true}
      allowedRoles={['developer', 'designer', 'marketing', 'pm']}
      showNavigation={false}
    >
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h2>페이지를 불러오는 중...</h2>
        <p>잠시만 기다려주세요.</p>
      </div>
    </AdminLayout>
  );
}

/**
 * 매거진 생성/편집 페이지 (서버 컴포넌트)
 * 
 * @description
 * - Suspense 경계로 클라이언트 컴포넌트를 감쌈
 * - useSearchParams() 사용을 위한 올바른 패턴
 * - NextJS 15 권장 구조
 */
export default function CreateMagazinePage() {
  return (
    <Suspense fallback={<CreateMagazineLoading />}>
      <CreateMagazineContent />
    </Suspense>
  );
}
