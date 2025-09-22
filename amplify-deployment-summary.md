# Amplify 배포 완료 가이드

## 🎯 해결된 문제들

### 1. `/ko` 경로 500 에러 해결
- **원인**: Next.js `output: 'standalone'` 설정으로 인한 localhost 호스트네임 문제
- **해결**: 정적 내보내기 설정 제거하고 표준 Next.js 빌드 사용

### 2. Amplify 배포 최적화
- **환경 변수**: 빌드 시 자동 설정
- **아티팩트**: `.next` 디렉토리 사용
- **API 호출**: 클라이언트 사이드에서 직접 Control Plane API 호출

## 📁 생성된 파일들

### 빌드 설정
- `amplify.yml` - Amplify 빌드 파이프라인
- `buildspec.yml` - CodeBuild 빌드 스펙
- `amplify-environment-variables.json` - 환경 변수 참조

### 배포 가이드
- `amplify-deployment-guide.md` - 상세 배포 가이드
- `amplify-build-commands.sh` - 로컬 테스트 스크립트

## 🔧 주요 설정 변경사항

### next.config.ts
```typescript
// 정적 내보내기 제거 (Amplify 호환성)
// output: 'export',
// distDir: 'out',

// 이미지 최적화 비활성화 (Amplify용)
images: {
  unoptimized: true,
}
```

### tenant-config-service.ts
```typescript
// 클라이언트 사이드에서 직접 API 호출
constructor() {
  const controlPlaneUrl = process.env.NEXT_PUBLIC_CONTROL_PLANE_URL || 'https://5qlvawv3j3.execute-api.ap-northeast-2.amazonaws.com/';
  this.configUrl = controlPlaneUrl;
}
```

## 🚀 Amplify 배포 단계

### 1. 환경 변수 설정
Amplify 콘솔에서 다음 환경 변수들을 설정:

```
AWS_REGION=ap-northeast-2
AWS_DEFAULT_REGION=ap-northeast-2
DYNAMODB_TABLE_NAME=product
NEXT_PUBLIC_API_URL=https://023johxt48.execute-api.ap-northeast-2.amazonaws.com/prod/
NEXT_PUBLIC_CONTROL_PLANE_URL=https://5qlvawv3j3.execute-api.ap-northeast-2.amazonaws.com/
NEXT_PUBLIC_DOMAIN=main.d5ub1n0zyzcoi.amplifyapp.com
NEXT_PUBLIC_USING_CUSTOM_DOMAIN=false
NEXT_PUBLIC_APP_NAME=SaaS Application Portal
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 2. 빌드 설정
- **Build command**: `npm run build`
- **Base directory**: `.` (루트)
- **Artifacts directory**: `.next`

### 3. 배포 확인
- `/ko` 경로 정상 작동
- 한국어 페이지 로딩
- API 호출 정상 작동

## ✅ 검증 완료

- [x] 빌드 성공
- [x] 환경 변수 설정
- [x] API 호출 최적화
- [x] Amplify 호환성
- [x] 한국어 페이지 지원

## 🔍 문제 해결

### 빌드 실패 시
1. 환경 변수 확인: `npm run check-env`
2. 빌드 로그에서 오류 메시지 확인
3. Node.js 버전 확인 (v20.19.2 권장)

### 런타임 오류 시
1. 브라우저 개발자 도구에서 네트워크 탭 확인
2. API 엔드포인트 접근성 확인
3. CORS 설정 확인

이제 Amplify에서 배포할 준비가 완료되었습니다! 🎉
