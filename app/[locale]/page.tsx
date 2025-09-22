import { useTranslations } from 'next-intl';
import { Building2, Users, Shield, Zap } from 'lucide-react';
import LanguageSwitcher from '@/components/language-switcher';
import HomePageClient from '@/components/home-page-client';

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <HomePageClient />
    </div>
  );
}
