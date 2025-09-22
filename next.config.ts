import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  // 해시 기반 라우팅 지원
  trailingSlash: false,

  // 환경 변수 설정 - Amplify에서 설정된 값들 사용
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://023johxt48.execute-api.ap-northeast-2.amazonaws.com/prod/',
    NEXT_PUBLIC_CONTROL_PLANE_URL: process.env.NEXT_PUBLIC_CONTROL_PLANE_URL || 'https://5qlvawv3j3.execute-api.ap-northeast-2.amazonaws.com/',
    NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN || 'main.d5ub1n0zyzcoi.amplifyapp.com',
    NEXT_PUBLIC_USING_CUSTOM_DOMAIN: process.env.NEXT_PUBLIC_USING_CUSTOM_DOMAIN || 'false',
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'SaaS Application Portal',
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },

  // 에러 처리 개선
  serverExternalPackages: ['@aws-sdk/client-dynamodb'],

  // Next.js 15 호환성 설정
  experimental: {
    serverComponentsExternalPackages: ['@aws-sdk/client-dynamodb'],
  },

  // 빌드 최적화
  webpack: (config, { isServer }) => {
    if (isServer) {
      // 서버 사이드에서 사용하지 않는 패키지 제외
      config.externals.push('@aws-sdk/client-dynamodb');
    }
    return config;
  },

  // 에러 페이지 설정
  async rewrites() {
    return [
      {
        source: '/health',
        destination: '/api/health',
      },
    ];
  },

  // 빌드 최적화
  output: 'standalone',
};

export default withNextIntl(nextConfig);
