'use client';

import React from 'react';
import Header from './Header';
import Footer, { FooterProps } from './Footer';

export interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
  minimalFooter?: boolean;
  headerProps?: Omit<React.ComponentProps<typeof Header>, 'className'>;
  footerProps?: Omit<FooterProps, 'className'>;
  title?: string;
  description?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  className = '',
  hideHeader = false,
  hideFooter = false,
  minimalFooter = false,
  headerProps,
  footerProps,
  title,
  description,
}) => {
  return (
    <div className={`main-layout main-layout--full-height ${className}`}>
      {title && (
        <title>{title} | Vinscent</title>
      )}
      {description && (
        <meta name="description" content={description} />
      )}

      {/*헤더 */}
      {!hideHeader && (
        <Header 
          {...headerProps}
        />
      )}

      {/* 메인 콘텐츠 */}
      <main className="main-layout__content">
        {children}
      </main>

      {/* 푸터 */}
      {!hideFooter && (
        <Footer
          {...footerProps}
          minimal={minimalFooter}
        />
      )}
    </div>
  );
};

//default export로 변경
export default MainLayout;