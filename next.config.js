const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig = {
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

  // 에러 처리 개선 - 충돌 해결
  transpilePackages: [],

  // Next.js 14.2.15 호환성 설정
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001', 'main.d5ub1n0zyzcoi.amplifyapp.com']
    },
    // clientModules 오류 해결을 위한 설정
    serverComponentsExternalPackages: ['@aws-sdk/client-dynamodb'],
  },

  // 빌드 최적화
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      // 서버 사이드에서 사용하지 않는 패키지 제외
      config.externals.push('@aws-sdk/client-dynamodb');
    }
    
    // clientReferenceManifest 버그 우회를 위한 설정
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      'next/dist/client/components/static-generation-bailout': false,
      'next/dist/client/components/static-generation-bailout.js': false,
    };
    
    // Next.js 15 clientReferenceManifest 버그 완전 우회
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.__NEXT_CLIENT_REFERENCE_MANIFEST': 'undefined',
        'process.env.__NEXT_CLIENT_REFERENCE_MANIFEST_LOADER': 'undefined',
        'process.env.__NEXT_CLIENT_REFERENCE_MANIFEST_LOADER_JS': 'undefined',
      })
    );
    
    // clientReferenceManifest 관련 모듈 제거
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /client-reference-manifest/,
      use: 'null-loader'
    });
    
    return config;
  },

  // 정적 내보내기에서는 rewrites 사용 불가
  // async rewrites() {
  //   return [
  //     {
  //       source: '/health',
  //       destination: '/api/health',
  //     },
  //   ];
  // },

  // Amplify 배포 최적화
  images: {
    unoptimized: true,
  },
  
  // Amplify 배포를 위한 설정 (정적 내보내기 비활성화)
  // output: 'export',
  // distDir: 'out',
  
  // Next.js 13.5.6 안정성 설정
  compress: false,
};

module.exports = withNextIntl(nextConfig);
