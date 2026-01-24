import { NextRequest, NextResponse } from 'next/server';

// レート制限の設定
const RATE_LIMIT_WINDOW = 60 * 1000; // 1分
const MAX_REQUESTS_PER_WINDOW = 30; // 1分あたり30リクエスト

// IPアドレスごとのリクエスト履歴を保存
// 本番環境では Redis などの外部ストレージを推奨
const requestLog = new Map<string, number[]>();

/**
 * レート制限のチェック
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const requests = requestLog.get(ip) || [];

  // 古いリクエスト履歴を削除（ウィンドウ外）
  const recentRequests = requests.filter(
    timestamp => now - timestamp < RATE_LIMIT_WINDOW
  );

  // レート制限チェック
  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  // 新しいリクエストを記録
  recentRequests.push(now);
  requestLog.set(ip, recentRequests);

  return true;
}

/**
 * IPアドレスを取得
 */
function getClientIp(request: NextRequest): string {
  // Vercel や他のプロキシ環境を考慮
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // フォールバック
  return 'unknown';
}

export function middleware(request: NextRequest) {
  // APIエンドポイントのみレート制限を適用
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = getClientIp(request);

    // レート制限チェック
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          error: 'レート制限を超えました。しばらく待ってから再度お試しください。',
          retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000)
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(RATE_LIMIT_WINDOW / 1000))
          }
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
