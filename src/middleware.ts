import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate Limiting 설정
const WINDOW_MS = 60 * 1000; // 1분
const MAX_REQUESTS = 100; // 1분당 100회
const requests = new Map<string, number[]>();

/**
 * Next.js middleware for API rate limiting
 * 
 * @param request - Next.js request object
 * @returns NextResponse with rate limit or continuation
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Rate Limiting (모든 API 요청)
  if (pathname.startsWith('/api')) {
    const ip = request.headers.get('x-forwarded-for') || 
      request.headers.get('x-real-ip') || 
      'anonymous';
    
    const now = Date.now();
    const userRequests = requests.get(ip) || [];
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < WINDOW_MS
    );
    
    if (recentRequests.length >= MAX_REQUESTS) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil(WINDOW_MS / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil(WINDOW_MS / 1000))
          }
        }
      );
    }
    
    recentRequests.push(now);
    requests.set(ip, recentRequests);
    
    // 메모리 정리 (1% 확률로 실행)
    if (Math.random() < 0.01) {
      const cutoff = now - (5 * WINDOW_MS);
      requests.forEach((timestamps, key) => {
        const filtered = timestamps.filter(t => t > cutoff);
        if (filtered.length === 0) {
          requests.delete(key);
        } else {
          requests.set(key, filtered);
        }
      });
    }
  }
  
  return NextResponse.next();
}

/**
 * Middleware configuration
 * Only applies rate limiting to API routes
 * 
 * Note: 토큰 인증은 각 API Route에서 직접 처리합니다.
 * Edge Runtime 제약으로 인해 middleware에서는 토큰 검증을 하지 않습니다.
 */
export const config = {
  matcher: [
    '/api/:path*',  // Rate Limiting용
  ],
};
