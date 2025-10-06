'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../../components/admin/AdminLayout';
import TextBlock from '../../../../components/admin/TextBlock';
import ImageBlock from '../../../../components/admin/ImageBlock';
import { Plus, Type, Image, Eye } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminMagazine } from '../../../../lib/queries/admin';
import { useQueryClient } from '@tanstack/react-query';

// 블록 타입 정의
interface Block {
  id: string;
  type: 'text' | 'image';
  content: TextBlockContent | ImageBlockContent;
  order: number;
}

interface TextBlockContent {
  markdown: string;
}

interface ImageBlockContent {
  imageUrl: string;
  imageSource: string;
}

export default function CreateMagazineContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  
  // 편집 모드 감지
  const editMagazineId = searchParams.get('id');
  const isEditMode = !!editMagazineId;
  const magazineId = editMagazineId ? parseInt(editMagazineId) : null;
  
  // 편집할 매거진 데이터 로드
  const { 
    data: magazineData, 
    isLoading: isLoadingMagazine,
    error: magazineError 
  } = useAdminMagazine(magazineId || 0); 
  
  // 매거진 제목 및 부제목
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  
  // 브랜드 정보 및 카테고리
  const [brandName, setBrandName] = useState('Vinscent');
  const [brandUrl, setBrandUrl] = useState('');
  const [category, setCategory] = useState<'official' | 'unofficial'>('official');
  
  // Credit 섹션
  const [credits, setCredits] = useState('');
  
  // 블록들
  const [blocks, setBlocks] = useState<Block[]>([]);
  
  // 편집 모드 초기화 완료 상태
  const [isInitialized, setIsInitialized] = useState(false);
  
  // 저장 상태
  const [isSaving, setIsSaving] = useState(false);
  
  // 블록 타입 선택 상태
  const [showBlockTypeMenu, setShowBlockTypeMenu] = useState(false);
  const [addAfterBlockId, setAddAfterBlockId] = useState<string | null>(null);

  // 편집 모드에서 매거진 데이터 로드 및 초기화
  useEffect(() => {
    if (isEditMode && magazineData?.data && !isInitialized) {
      // 편집 모드에서는 localStorage 간섭 제거
      localStorage.removeItem('magazine-preview-data');
      
      const magazine = magazineData.data;
      
      // 기본 정보 설정
      setTitle(magazine.title || '');
      setSubtitle(magazine.subtitle || '');
      setBrandName(magazine.brandName || 'Vinscent');
      setBrandUrl(magazine.brandUrl || '');
      setCategory(magazine.category || 'official');
      
      // Credit 데이터 로드
      if (magazine.credits && Array.isArray(magazine.credits)) {
        const creditsText = magazine.credits.map((credit: unknown) => {
          const c = credit as { role: string; name: string };
          return `${c.role}: ${c.name}`;
        }).join('\n');
        setCredits(creditsText);
      } else if (typeof magazine.credits === 'string') {
        setCredits(magazine.credits);
      }
      
      // 블록 데이터 변환 및 설정
      if (magazine.blocks && Array.isArray(magazine.blocks)) {
        const convertedBlocks: Block[] = magazine.blocks.map((block: unknown, index: number) => {
          const b = block as { type: string; content: Record<string, unknown>; order?: number };
          return {
            id: `block-${Date.now()}-${index}`,
            type: b.type as 'text' | 'image',
            content: b.type === 'text'
              ? { markdown: (b.content as { markdown?: string })?.markdown || '' }
              : {
                  imageUrl: (b.content as { imageUrl?: string; imageSource?: string })?.imageUrl || '',
                  imageSource: (b.content as { imageUrl?: string; imageSource?: string })?.imageSource || ''
                },
            order: b.order || (index + 1)
          };
        });
        
        setBlocks(convertedBlocks);
      }
      
      setIsInitialized(true);
    } else if (!isEditMode) {
      // 생성 모드일 때는 localStorage에서 복원
      try {
        const savedData = localStorage.getItem('magazine-preview-data');
        if (savedData) {
          const data = JSON.parse(savedData);
          setTitle(data.title || '');
          setSubtitle(data.subtitle || '');
          setBrandName(data.brandName || 'Vinscent');
          setBrandUrl(data.brandUrl || '');
          setCategory(data.category || 'official');
          setCredits(data.credits || '');
          setBlocks(data.blocks || []);
        }
      } catch (error) {
        console.error('임시저장 데이터 복원 실패:', error);
      }
      setIsInitialized(true);
    }
  }, [isEditMode, magazineData, isInitialized, category, credits]);

  // 블록 ID 생성
  const generateBlockId = () => `block-${Date.now()}-${Math.random()}`;

  // 블록 추가
  const addBlock = (type: 'text' | 'image', afterBlockId?: string) => {
    const newBlock: Block = {
      id: generateBlockId(),
      type,
      content: type === 'text' 
        ? { markdown: '' } 
        : { imageUrl: '', imageSource: '' },
      order: blocks.length + 1
    };

    if (afterBlockId) {
      const afterIndex = blocks.findIndex(block => block.id === afterBlockId);
      const newBlocks = [...blocks];
      newBlocks.splice(afterIndex + 1, 0, newBlock);
      // 순서 재정렬
      newBlocks.forEach((block, index) => {
        block.order = index + 1;
      });
      setBlocks(newBlocks);
    } else {
      setBlocks([...blocks, newBlock]);
    }
    
    setShowBlockTypeMenu(false);
    setAddAfterBlockId(null);
  };

  // 블록 삭제
  const deleteBlock = (blockId: string) => {
    const filteredBlocks = blocks.filter(block => block.id !== blockId);
    // 순서 재정렬
    filteredBlocks.forEach((block, index) => {
      block.order = index + 1;
    });
    setBlocks(filteredBlocks);
  };

  // 블록 컨텐츠 업데이트
  const updateBlockContent = (blockId: string, content: TextBlockContent | ImageBlockContent) => {
    setBlocks(blocks.map(block => 
      block.id === blockId ? { ...block, content } : block
    ));
  };

  // 블록 후에 새 블록 추가
  const addBlockAfter = (blockId: string) => {
    setAddAfterBlockId(blockId);
    setShowBlockTypeMenu(true);
  };

  // 블록 타입 메뉴 닫기
  const closeBlockTypeMenu = () => {
    setShowBlockTypeMenu(false);
    setAddAfterBlockId(null);
  };

  // 초기 블록 추가 (빈 상태일 때)
  const addInitialBlock = () => {
    if (blocks.length === 0) {
      addBlock('text');
    }
  };

  // 미리보기 기능
  const handlePreview = () => {
    // 미리보기 데이터 준비
    const previewData = {
      title,
      subtitle,
      brandName,
      brandUrl,
      category,
      credits,
      blocks,
      lastModified: new Date().toISOString(),
      editingMagazineId: isEditMode ? magazineId : null,
      isEditMode: isEditMode
    };

    try {
      localStorage.setItem('magazine-preview-data', JSON.stringify(previewData));
      router.push('/admin/magazines/preview');
    } catch (error) {
      console.error('미리보기 데이터 저장 실패:', error);
      alert('미리보기를 열 수 없습니다. 다시 시도해주세요.');
    }
  };

  // 초안 저장 기능
  const handleDraftSave = async () => {
    if (!title.trim()) {
      alert('매거진 제목을 입력해주세요.');
      return;
    }
    if (blocks.length === 0) {
      alert('내용을 작성해주세요.');
      return;
    }

    setIsSaving(true);

    try {
      const draftData = {
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        category: category,
        status: 'draft',
        brandName: brandName.trim(),
        brandUrl: brandUrl?.trim() || null,
        credits: credits.trim(),
        blocks: blocks.map(block => ({
          type: block.type,
          order: block.order,
          content: {
            markdown: block.type === 'text' ? (block.content as TextBlockContent).markdown : undefined,
            imageUrl: block.type === 'image' ? (block.content as ImageBlockContent).imageUrl : undefined,
            imageSource: block.type === 'image' ? (block.content as ImageBlockContent).imageSource : undefined,
          }
        }))
      };

      const token = localStorage.getItem('admin_token');
      if (!token) {
        alert('로그인이 필요합니다. 다시 로그인해주세요.');
        return;
      }

      let response;
      if (isEditMode && magazineId) {
        response = await fetch(`/api/control/magazines/${magazineId}?token=${token}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(draftData)
        });
      } else {
        response = await fetch(`/api/control/magazines?token=${token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(draftData)
        });
      }

      const result = await response.json();

      if (result.success) {
        localStorage.removeItem('magazine-preview-data');
        
        await queryClient.invalidateQueries({
          queryKey: ['admin', 'magazines']
        });
        
        alert('초안이 저장되었습니다!');
        window.location.href = '/admin/magazines';
      } else {
        throw new Error(result.error || '초안 저장에 실패했습니다');
      }
    } catch (error) {
      console.error('초안 저장 실패:', error);
      alert(`초안 저장에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // 작성완료/수정완료 기능
  const handleComplete = () => {
    if (!title.trim()) {
      alert('매거진 제목을 입력해주세요.');
      return;
    }
    if (blocks.length === 0) {
      alert('내용을 작성해주세요.');
      return;
    }
    
    handlePreview();
  };

  // 실시간 임시저장
  useEffect(() => {
    if (isEditMode) {
      return;
    }

    const autoSave = () => {
      if (title.trim() || blocks.length > 0) {
        const draftData = {
          title,
          subtitle,
          brandName,
          brandUrl,
          category,
          credits,
          blocks,
          lastModified: new Date().toISOString()
        };
        localStorage.setItem('magazine-preview-data', JSON.stringify(draftData));
      }
    };

    const interval = setInterval(autoSave, 3000);
    return () => clearInterval(interval);
  }, [isEditMode, title, subtitle, brandName, brandUrl, category, credits, blocks]);

  // 로딩 상태 처리
  if (isEditMode && isLoadingMagazine) {
    return (
      <AdminLayout
        title="매거진 편집"
        description="매거진 데이터를 불러오는 중..."
        requireAuth={true}
        allowedRoles={['developer', 'designer', 'marketing', 'pm']}
        showNavigation={false}
      >
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>매거진 데이터를 불러오는 중...</h2>
          <p>잠시만 기다려주세요.</p>
        </div>
      </AdminLayout>
    );
  }

  // 에러 상태 처리
  if (isEditMode && magazineError) {
    return (
      <AdminLayout
        title="매거진 편집 오류"
        description="매거진을 불러올 수 없습니다"
        requireAuth={true}
        allowedRoles={['developer', 'designer', 'marketing', 'pm']}
        showNavigation={false}
      >
        <div className="error-container">
          <h2>매거진을 불러올 수 없습니다</h2>
          <p>요청한 매거진(ID: {magazineId})을 찾을 수 없거나 접근 권한이 없습니다.</p>
          <button 
            onClick={() => router.push('/admin/magazines')}
            className="error-back-btn"
          >
            매거진 목록으로 돌아가기
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isEditMode ? "매거진 편집" : "매거진 작성"}
      description={isEditMode ? "블록 에디터로 매거진을 편집합니다" : "블록 에디터로 매거진을 작성합니다"}
      requireAuth={true}
      allowedRoles={['developer', 'designer', 'marketing', 'pm']}
      showNavigation={false}
    >
      <div className="block-editor-page">
        <div className="block-editor-container">
          <header className="block-editor-header">
            <h1 className="block-editor-title">
              {isEditMode ? `매거진 편집 ${magazineId ? `(ID: ${magazineId})` : ''}` : '매거진 작성'}
            </h1>
            <p className="block-editor-subtitle">
              {isEditMode 
                ? '블록을 수정하여 매거진을 업데이트하세요' 
                : '블록을 조합하여 매거진을 만들어보세요'
              }
            </p>
          </header>

          <main className="block-editor-content">
            <div className="magazine-title-section">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="매거진 제목을 입력하세요..."
                className="magazine-title-input"
                autoFocus
              />
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="부제목을 입력하세요 (선택사항)..."
                className="magazine-subtitle-input"
              />
            </div>

            <div className="magazine-brand-section">
              <div className="brand-input-group">
                <div className="brand-input-item">
                  <label className="brand-input-label">브랜드명</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="브랜드명 (예: Maison Margiela)"
                    className="brand-input"
                  />
                </div>
                <div className="brand-input-item">
                  <label className="brand-input-label">브랜드 웹사이트 (선택사항)</label>
                  <input
                    type="url"
                    value={brandUrl}
                    onChange={(e) => setBrandUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="brand-input"
                  />
                </div>
                <div className="brand-input-item">
                  <label className="brand-input-label">매거진 유형</label>
                  <div className="category-radio-group">
                    <label className="category-radio-item">
                      <input
                        type="radio"
                        name="category"
                        value="official"
                        checked={category === 'official'}
                        onChange={(e) => setCategory(e.target.value as 'official' | 'unofficial')}
                        className="category-radio"
                      />
                      <span className="category-radio-label">공식 매거진</span>
                      <span className="category-radio-desc">브랜드 공식 콘텐츠</span>
                    </label>
                    <label className="category-radio-item">
                      <input
                        type="radio"
                        name="category"
                        value="unofficial"
                        checked={category === 'unofficial'}
                        onChange={(e) => setCategory(e.target.value as 'official' | 'unofficial')}
                        className="category-radio"
                      />
                      <span className="category-radio-label">일반 매거진</span>
                      <span className="category-radio-desc">사용자 제작 콘텐츠</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="blocks-container">
              {blocks.map((block) => {
                if (block.type === 'text') {
                  return (
                    <TextBlock
                      key={block.id}
                      id={block.id}
                      content={block.content as TextBlockContent}
                      onContentChange={updateBlockContent}
                      onDelete={deleteBlock}
                      onAddBlockAfter={addBlockAfter}
                    />
                  );
                } else if (block.type === 'image') {
                  return (
                    <ImageBlock
                      key={block.id}
                      id={block.id}
                      content={block.content as ImageBlockContent}
                      onContentChange={updateBlockContent}
                      onDelete={deleteBlock}
                      onAddBlockAfter={addBlockAfter}
                    />
                  );
                }
                return null;
              })}

              {blocks.length === 0 && (
                <div className="empty-editor">
                  <p className="empty-editor-text">내용을 작성하여 매거진을 만들어보세요</p>
                  <button 
                    onClick={addInitialBlock}
                    className="add-first-block-btn"
                  >
                    <Type size={16} />
                    글 작성 시작하기
                  </button>
                </div>
              )}

              {blocks.length > 0 && (
                <div className="add-block-section">
                  <button 
                    className="add-block-btn"
                    onClick={() => setShowBlockTypeMenu(true)}
                  >
                    <Plus size={16} />
                    블록 추가
                  </button>
                </div>
              )}

              {showBlockTypeMenu && (
                <>
                  <div 
                    className="block-type-backdrop"
                    onClick={closeBlockTypeMenu}
                  />
                  <div className="block-type-menu">
                    <h3 className="block-type-title">블록 타입 선택</h3>
                    <div className="block-type-options">
                      <button
                        className="block-type-option"
                        onClick={() => addBlock('text', addAfterBlockId || undefined)}
                      >
                        <Type className="block-type-icon" />
                        <div className="block-type-info">
                          <div className="block-type-name">텍스트</div>
                          <div className="block-type-desc">마크다운 지원 텍스트 작성</div>
                        </div>
                      </button>
                      <button
                        className="block-type-option"
                        onClick={() => addBlock('image', addAfterBlockId || undefined)}
                      >
                        <Image className="block-type-icon" />
                        <div className="block-type-info">
                          <div className="block-type-name">이미지</div>
                          <div className="block-type-desc">URL로 이미지 추가</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="magazine-credits-section">
              <h3 className="credits-title">Credit</h3>
              <div className="credits-input-container">
                <textarea
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  placeholder="사진: 김철수&#10;편집: 이영희&#10;모델: 박지민&#10;협찬: Chanel Korea"
                  className="credits-textarea"
                  rows={4}
                />
                <p className="credits-help">
                  선택사항입니다. 사진, 편집, 모델, 협찬 등의 역할을 입력해주세요.
                </p>
              </div>
            </div>

            <div className="editor-actions">
              <button 
                onClick={handleDraftSave}
                disabled={isSaving}
                className="action-btn action-btn--secondary"
              >
                {isSaving ? '저장 중...' : '초안 저장'}
              </button>
              <button 
                onClick={handleComplete}
                disabled={isSaving || (!title.trim() && blocks.length === 0)}
                className="action-btn action-btn--primary"
              >
                <Eye size={16} />
                {isEditMode ? '수정완료' : '발행하기'}
              </button>
            </div>
          </main>
        </div>
      </div>
    </AdminLayout>
  );
}
