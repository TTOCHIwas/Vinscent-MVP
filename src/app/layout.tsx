import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from './providers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Vinscent MVP',
  description: '향수/뷰티 플랫폼',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="antialiased">
        <Providers>
          {/* 전체 앱 구조: 헤더, 메인 콘텐츠, 푸터 */}
          <div id="__next" className="layout">
            {/* 헤더 - 모든 페이지에서 일관되게 표시 */}
            <Header className="layout__header" />
            
            {/* 메인 콘텐츠 영역 - 각 페이지의 고유 콘텐츠 */}
            <main className="layout__main">
              {children}
            </main>
            
            {/* 푸터 - 모든 페이지에서 일관되게 표시 */}
            <Footer className="layout__footer" />
          </div>
        </Providers>
      </body>
    </html>
  );
}