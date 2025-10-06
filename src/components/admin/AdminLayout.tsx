'use client';

import React, { useState, useEffect } from 'react';
import MainLayout, { MainLayoutProps } from '../layout/MainLayout';
import Button from '../ui/Button';

// 어드민 역할 타입
type AdminRole = 'developer' | 'designer' | 'marketing' | 'pm';

// 토큰 상태 인터페이스
interface TokenState {
  token: string | null;
  role: AdminRole | null;
  isValidating: boolean;
  error: string | null;
}

// AdminLayout Props
export interface AdminLayoutProps extends Omit<MainLayoutProps, 'children'> {
  children: React.ReactNode;
  requireAuth?: boolean; // 인증 필수 여부
  allowedRoles?: AdminRole[]; // 허용되는 역할들
  showNavigation?: boolean; // 어드민 네비게이션 표시 여부
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  requireAuth = true,
  allowedRoles,
  showNavigation = true,
  className = '',
  ...mainLayoutProps
}) => {
  // 토큰 상태 관리
  const [tokenState, setTokenState] = useState<TokenState>({
    token: null,
    role: null,
    isValidating: false,
    error: null,
  });
  
  // 토큰 입력 폼 상태
  const [tokenInput, setTokenInput] = useState('');
  const [showTokenForm, setShowTokenForm] = useState(false);

  // 컴포넌트 마운트 시 토큰 확인
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      validateToken(savedToken);
    } else if (requireAuth) {
      setShowTokenForm(true);
    }
  }, [requireAuth]);

  // 토큰 검증 함수
  const validateToken = async (token: string) => {
    setTokenState(prev => ({ ...prev, isValidating: true, error: null }));
    
    try {
      // 테스트 API 호출로 토큰 유효성 검사
      const response = await fetch(`/api/control/magazines?token=${token}&count=true`);
      
      if (response.ok) {
        const data = await response.json();
        const role = data.adminRole as AdminRole;
        
        // 권한 체크
        if (allowedRoles && !allowedRoles.includes(role)) {
          setTokenState(prev => ({
            ...prev,
            isValidating: false,
            error: `권한이 부족합니다. 필요한 권한: ${allowedRoles.join(', ')}`
          }));
          return;
        }
        
        // 성공: 토큰과 역할 저장
        setTokenState({
          token,
          role,
          isValidating: false,
          error: null,
        });
        
        localStorage.setItem('admin_token', token);
        setShowTokenForm(false);
        setTokenInput('');
      } else {
        throw new Error('유효하지 않은 토큰입니다.');
      }
    } catch (error) {
      setTokenState(prev => ({
        ...prev,
        isValidating: false,
        error: error instanceof Error ? error.message : '토큰 검증 실패'
      }));
      
      localStorage.removeItem('admin_token');
      if (requireAuth) {
        setShowTokenForm(true);
      }
    }
  };

  // 토큰 제출 핸들러
  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      validateToken(tokenInput.trim());
    }
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    setTokenState({
      token: null,
      role: null,
      isValidating: false,
      error: null,
    });
    localStorage.removeItem('admin_token');
    setShowTokenForm(true);
  };

  // 어드민 네비게이션 메뉴
  const renderAdminNavigation = () => {
    if (!showNavigation || !tokenState.token) return null;

    return (
      <div className="admin-navigation">
        <nav className="admin-navigation__menu">
          <Button
            as="a"
            href="/admin/magazines"
            variant="ghost"
            size="sm"
            className="admin-navigation__link"
          >
            매거진 관리
          </Button>
          
          {(tokenState.role === 'developer' || tokenState.role === 'pm') && (
            <Button
              as="a"
              href="/admin/dashboard"
              variant="ghost"
              size="sm"
              className="admin-navigation__link"
            >
              대시보드
            </Button>
          )}
        </nav>
        
        <div className="admin-navigation__user">
          <span className="admin-navigation__role">
            {tokenState.role} 계정
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="admin-navigation__logout"
          >
            로그아웃
          </Button>
        </div>
      </div>
    );
  };

  // 토큰 입력 폼 렌더링
  const renderTokenForm = () => {
    if (!showTokenForm) return null;

    return (
      <div className="admin-auth">
        <div className="admin-auth__container">
          <div className="admin-auth__form-wrapper">
            <h1 className="admin-auth__title">어드민 인증</h1>
            <p className="admin-auth__description">
              관리자 토큰을 입력하여 로그인하세요.
            </p>
            
            <form onSubmit={handleTokenSubmit} className="admin-auth__form">
              <div className="admin-auth__input-group">
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="예: 1a2b3c4d-5e6f-7g8h"
                  className="admin-auth__input"
                  disabled={tokenState.isValidating}
                />
              </div>
              
              {tokenState.error && (
                <div className="admin-auth__error">
                  {tokenState.error}
                </div>
              )}
              
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={tokenState.isValidating}
                disabled={!tokenInput.trim() || tokenState.isValidating}
                className="admin-auth__submit"
              >
                {tokenState.isValidating ? '검증 중...' : '로그인'}
              </Button>
            </form>
            
            <div className="admin-auth__help">
              <p>토큰은 팀 슬랙에서 확인하거나 개발자에게 문의하세요.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 인증이 필요하지만 토큰이 없는 경우
  if (requireAuth && (!tokenState.token || showTokenForm)) {
    return renderTokenForm();
  }

  // 메인 어드민 레이아웃 렌더링
  return (
    <MainLayout
      {...mainLayoutProps}
      className={`admin-layout ${className}`}
      hideHeader={true} // 기본 헤더 숨김 (어드민 네비게이션으로 대체)
      hideFooter={true} // 어드민은 푸터 숨김
    >
      {/* 어드민 네비게이션 */}
      {renderAdminNavigation()}
      
      {/* 어드민 메인 콘텐츠 */}
      <div className="admin-layout__content">
        {children}
      </div>
    </MainLayout>
  );
};

export default AdminLayout;