export const env = {
  NEXT_PUBLIC_GATEWAY_URL:
    process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://api.greensteel.site',
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
    new URL(env.NEXT_PUBLIC_GATEWAY_URL);
  } catch {
    console.warn('NEXT_PUBLIC_GATEWAY_URL is not a valid URL, using default');
  }
}
