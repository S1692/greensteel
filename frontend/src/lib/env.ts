export const env = {
  NEXT_PUBLIC_GATEWAY_URL:
    process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://your-gateway.railway.app',
  NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV || 'development',
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'greensteel',
  NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  NEXT_PUBLIC_ENABLE_LCA: process.env.NEXT_PUBLIC_ENABLE_LCA === 'true',
  NEXT_PUBLIC_ENABLE_CBAM: process.env.NEXT_PUBLIC_ENABLE_CBAM === 'true',
  NEXT_PUBLIC_ENABLE_DATA_UPLOAD:
    process.env.NEXT_PUBLIC_ENABLE_DATA_UPLOAD === 'true',
} as const;

// Gateway URL이 유효한지 확인 (환경 변수가 있을 때만)
if (process.env.NEXT_PUBLIC_GATEWAY_URL) {
  try {
    const url = new URL(env.NEXT_PUBLIC_GATEWAY_URL);
    // localhost, 127.0.0.1, http://*3000 등은 허용하지 않음
    if (url.hostname === 'localhost' || 
        url.hostname === '127.0.0.1' || 
        url.hostname.includes('3000')) {
      console.warn('Warning: localhost or development URLs are not allowed in production');
    }
  } catch {
    // URL이 유효하지 않으면 기본값 사용
    console.warn('Invalid Gateway URL, using default');
  }
}
