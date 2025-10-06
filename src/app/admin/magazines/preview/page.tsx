'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PreviewData {
  title: string;
  subtitle?: string;
  brandName?: string;
  brandUrl?: string;
  category?: 'official' | 'unofficial';
  credits?: string;
  blocks: Array<{
    id: string;
    type: 'text' | 'image';
    order: number;
    content: {
      markdown?: string;
      imageUrl?: string;
      imageSource?: string;
    };
  }>;
  lastModified: string;
  editingMagazineId?: number | null;
  isEditMode?: boolean;
}

// 간단한 마크다운 렌더러
const renderMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
};

// Credit 문자열을 배열로 변환
const convertCreditsStringToArray = (creditsString: string) => {
  if (!creditsString.trim()) return [];
  
  return creditsString
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) {
        return { role: '기타', name: line.trim() };
      }
      return {
        role: line.substring(0, colonIndex).trim(),
        name: line.substring(colonIndex + 1).trim()
      };
    })
    .filter(item => item.role && item.name);
};

const MagazinePreviewPage: React.FC = () => {
  const router = useRouter();
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 페이지 로드 시 localStorage에서 데이터 복원
  useEffect(() => {
    const savedData = localStorage.getItem('magazine-preview-data');
    if (savedData) {
      try {
        const data = JSON.parse(savedData) as PreviewData;
        setPreviewData(data);
      } catch (error) {
        console.error('미리보기 데이터 파싱 실패:', error);
        router.push('/admin/magazines/create');
      }
    } else {
      router.push('/admin/magazines/create');
    }
  }, [router]);

  // 편집으로 돌아가기
  const handleBackToEdit = () => {
    if (previewData?.isEditMode && previewData?.editingMagazineId) {
      router.push(`/admin/magazines/create?id=${previewData.editingMagazineId}`);
    } else {
      router.push('/admin/magazines/create');
    }
  };

  // 저장하기 (수정 모드 지원)
  const handleSave = async () => {
    if (!previewData) return;

    if (!previewData.blocks || previewData.blocks.length === 0) {
      alert('경고: 블록 데이터가 비어있습니다. 데이터 손실 방지를 위해 저장을 중단합니다.');
      return;
    }

    setIsSaving(true);

    try {
      const convertedData = convertBlocksToMagazineData(previewData);
      
      if (!convertedData.blocks || convertedData.blocks.length === 0) {
        alert(' 경고: 변환된 블록 데이터가 비어있습니다. 데이터 손실 방지를 위해 저장을 중단합니다.');
        setIsSaving(false);
        return;
      }
      
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        alert('로그인이 필요합니다. 다시 로그인해주세요.');
        return;
      }

      let response;
      let successMessage;
      
      if (previewData.isEditMode && previewData.editingMagazineId) {
        response = await fetch(`/api/control/magazines/${previewData.editingMagazineId}?token=${token}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(convertedData)
        });
        
        successMessage = '매거진이 성공적으로 수정되었습니다!';
      } else {
        response = await fetch(`/api/control/magazines?token=${token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(convertedData)
        });
        
        successMessage = '매거진이 성공적으로 발행되었습니다!';
      }

      const result = await response.json();

      if (result.success) {
        localStorage.removeItem('magazine-preview-data');
        alert(successMessage);
        router.push('/admin/magazines');
      } else {
        throw new Error(result.error || '저장에 실패했습니다');
      }
    } catch (error) {
      console.error('매거진 저장 실패:', error);
      alert(`저장에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // 블록 에디터 데이터 → 블록 기반 API 전송용 변환
  const convertBlocksToMagazineData = (data: PreviewData) => {
    const blocks = data.blocks
      .sort((a, b) => a.order - b.order)
      .map((block) => {
        const convertedBlock = {
          type: block.type,
          order: block.order,
          content: {
            markdown: block.type === 'text' ? (block.content.markdown || '') : undefined,
            imageUrl: block.type === 'image' ? (block.content.imageUrl || '') : undefined,
            imageSource: block.type === 'image' ? (block.content.imageSource || '') : undefined,
          }
        };
        
        return convertedBlock;
      });
    
    const result = {
      title: data.title || '제목 없음',
      subtitle: data.subtitle || null,
      category: data.category || 'official',
      status: 'published' as const,
      brandName: data.brandName || 'Vinscent',
      brandUrl: data.brandUrl || null,
      credits: convertCreditsStringToArray(data.credits || ''),
      blocks: blocks
    };
    
    return result;
  };

  // 로딩 상태
  if (!previewData) {
    return (
      <div className="magazine-detail">
        <div className="magazine-detail__container">
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            미리보기를 준비하고 있습니다...
          </div>
        </div>
      </div>
    );
  }

  const sortedBlocks = [...previewData.blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="magazine-detail">
      {/* 미리보기 전용 상단 네비게이션 */}
      <div className="magazine-preview__navigation">
        <div className="magazine-preview__nav-container">
          <button
            onClick={handleBackToEdit}
            disabled={isSaving}
            className="magazine-preview__nav-button magazine-preview__nav-button--back"
          >
            ← 편집으로 돌아가기
          </button>
          
          <div className="magazine-preview__nav-title">
            {previewData.isEditMode ? '수정 미리보기' : '미리보기'}
          </div>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="magazine-preview__nav-button magazine-preview__nav-button--save"
          >
            {isSaving 
              ? '로딩 중...' 
              : (previewData.isEditMode ? '수정 완료' : '발행하기')
            }
          </button>
        </div>
      </div>

      {/* 실제 매거진 구조와 동일한 레이아웃 */}
      <div className="magazine-detail__container">
        
        {/* 헤더 영역 - 실제 상세 페이지와 동일 */}
        <header className="magazine-detail__header">
          <div className="magazine-detail__category">
            {(previewData.category === 'official') ? 'OFFICIAL' : 'UNOFFICIAL'}
          </div>
          
          <h1 className="magazine-detail__title">
            {previewData.title || '제목 없음'}
          </h1>
          
          {/* 부제목 표시 */}
          {previewData.subtitle && (
            <h2 className="magazine-detail__subtitle">
              {previewData.subtitle}
            </h2>
          )}
          
          <div className="magazine-detail__meta">
            <div className="magazine-detail__author">
              {previewData.brandUrl ? (
                <a 
                  href={previewData.brandUrl} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="magazine-detail__author-link"
                >
                  by {previewData.brandName || 'Vinscent'}
                </a>
              ) : (
                <span>by {previewData.brandName || 'Vinscent'}</span>
              )}
            </div>
            <div className="magazine-detail__date">
              <span>{new Date(previewData.lastModified).toLocaleDateString('ko-KR')}</span>
            </div>
            <div className="magazine-detail__views">
              <span>조회수 0</span>
            </div>
          </div>
        </header>

        {/* 콘텐츠 영역 - 블록 순서 보존 */}
        <main className="magazine-detail__content">
          <div className="magazine-detail__sections">
            {sortedBlocks.map((block, index) => (
              <section key={block.id} className="magazine-detail__section">
                
                {block.type === 'text' && (
                  <div className="magazine-detail__section-content">
                    <div 
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(block.content.markdown || '')
                      }}
                    />
                  </div>
                )}

                {block.type === 'image' && (
                  <figure className="magazine-detail__image-figure">
                    <img
                      src={block.content.imageUrl}
                      alt={`매거진 이미지 ${index + 1}`}
                      className="magazine-detail__image"
                      loading="lazy"
                    />
                    
                    {block.content.imageSource && (
                      <figcaption className="magazine-detail__image-source">
                        {block.content.imageSource}
                      </figcaption>
                    )}
                  </figure>
                )}
                
              </section>
            ))}
          </div>

          {/* Credit 영역 - 데이터가 있을 때만 표시 */}
          {previewData.credits && previewData.credits.trim() && (
            <section className="magazine-detail__credits">
              <h3 className="magazine-detail__credits-title">Credit</h3>
              <div className="magazine-detail__credits-list">
                {convertCreditsStringToArray(previewData.credits).map((credit, index) => (
                  <div key={index} className="magazine-detail__credit-item">
                    <span className="magazine-detail__credit-role">{credit.role}</span>
                    <span className="magazine-detail__credit-name">{credit.name}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default MagazinePreviewPage;