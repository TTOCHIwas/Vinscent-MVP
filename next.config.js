/** @type {import('next').NextConfig} */
const nextConfig = {
  // 이미지 최적화 설정
  images: {
    domains: [
      'localhost',
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  experimental: {
    // App Router 관련 설정
  },
  
  // 환경 변수
  env: {
    NEXT_PUBLIC_APP_NAME: 'Vinscent MVP',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
}

module.exports = nextConfig