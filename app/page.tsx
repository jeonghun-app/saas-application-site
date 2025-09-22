import { redirect } from 'next/navigation';

export default function RootPage() {
  // 루트 경로에서 기본 로케일의 select-tenant로 리다이렉트
  redirect('/ko/select-tenant');
}
