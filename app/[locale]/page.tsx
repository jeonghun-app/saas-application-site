import { redirect } from 'next/navigation';

export default function HomePage() {
  // 기본 페이지에서 select-tenant로 리다이렉트
  redirect('/select-tenant');
}
