# Amplify 배포 가이드

## 환경 변수 설정

Amplify 콘솔에서 다음 환경 변수들을 설정해야 합니다:

### 필수 환경 변수
- `AWS_REGION`: `ap-northeast-2`
- `AWS_DEFAULT_REGION`: `ap-northeast-2`
- `DYNAMODB_TABLE_NAME`: `product`
- `NEXT_PUBLIC_API_URL`: `https://023johxt48.execute-api.ap-northeast-2.amazonaws.com/prod/`
- `NEXT_PUBLIC_CONTROL_PLANE_URL`: `https://5qlvawv3j3.execute-api.ap-northeast-2.amazonaws.com/`
- `NEXT_PUBLIC_DOMAIN`: `main.d5ub1n0zyzcoi.amplifyapp.com`

### 선택적 환경 변수
- `NEXT_PUBLIC_USING_CUSTOM_DOMAIN`: `false`
- `NEXT_PUBLIC_APP_NAME`: `SaaS Application Portal`
- `NEXT_PUBLIC_APP_VERSION`: `1.0.0`
- `NODE_ENV`: `production`

## 빌드 설정

### 1. Amplify 콘솔에서 환경 변수 설정
1. AWS Amplify 콘솔에 로그인
2. 앱 선택 → Environment variables
3. 위의 환경 변수들을 추가

### 2. 빌드 설정
- **Build command**: `npm run build`
- **Base directory**: `.` (루트 디렉토리)
- **Artifacts directory**: `.next`

### 3. 빌드 스펙 파일
- `amplify.yml` 또는 `buildspec.yml` 사용
- 환경 변수는 preBuild 단계에서 설정됨

## 배포 단계

1. **소스 연결**: GitHub/GitLab 저장소 연결
2. **환경 변수 설정**: 위의 환경 변수들 추가
3. **빌드 설정**: Next.js 프레임워크 선택
4. **배포**: 자동 배포 활성화

## 문제 해결

### 빌드 실패 시
1. 환경 변수가 올바르게 설정되었는지 확인
2. `npm run check-env` 명령어로 검증
3. 빌드 로그에서 오류 메시지 확인

### 런타임 오류 시
1. 브라우저 개발자 도구에서 네트워크 오류 확인
2. API 엔드포인트 접근성 확인
3. CORS 설정 확인

## 파일 구조
```
├── amplify.yml                    # Amplify 빌드 설정
├── buildspec.yml                  # CodeBuild 빌드 설정
├── amplify-environment-variables.json  # 환경 변수 참조
├── amplify-build-commands.sh      # 빌드 스크립트
└── amplify-deployment-guide.md    # 이 가이드
```
