import type { NextConfig } from 'next';

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
};

export default nextConfig;
