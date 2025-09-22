import { redirect } from 'next/navigation';

interface CallbackPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CallbackPage({ params, searchParams }: CallbackPageProps) {
  const { locale } = await params;
  const search = await searchParams;
  
  // OAuth 콜백 파라미터 추출
  const tenantId = search.tenantId as string;
  const state = search.state as string;
  const code = search.code as string;
  const error = search.error as string;
  
  console.log('🔄 OAuth Callback received:', { tenantId, state, code, error });
  
  if (error) {
    // 에러가 있는 경우 로그인 페이지로 리다이렉트
    redirect(`/${locale}/auth/login?error=${encodeURIComponent(error)}`);
  }
  
  if (code && tenantId) {
    // 성공적인 OAuth 콜백인 경우 대시보드로 리다이렉트
    redirect(`/${locale}/${tenantId}/dashboard`);
  }
  
  // 파라미터가 부족한 경우 테넌트 선택 페이지로 리다이렉트
  redirect(`/${locale}/select-tenant`);
}
