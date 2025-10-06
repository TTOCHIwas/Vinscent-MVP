'use client';

/**
 * ❌ 이 페이지는 더 이상 사용되지 않습니다.
 * 
 * 새로운 블록 에디터 시스템을 사용하세요:
 * 👉 /admin/magazines/create
 */

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OldNewMagazinePage() {
  const router = useRouter();
  
  useEffect(() => {
    // 새로운 블록 에디터 페이지로 리다이렉트
    router.replace('/admin/magazines/create');
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <h1>리다이렉트 중...</h1>
      <p>새로운 블록 에디터로 이동합니다.</p>
    </div>
  );
}