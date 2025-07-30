'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import { useState } from 'react';

export default function LanguageSwitcher() {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const switchLanguage = (newLocale: string) => {
    if (newLocale === locale) return;
    
    // Remove current locale from pathname if it exists
    const pathWithoutLocale = pathname.startsWith(`/${locale}`) 
      ? pathname.slice(3) 
      : pathname;
    
    // Construct new URL with new locale
    const newUrl = `/${newLocale}${pathWithoutLocale}`;
    
    // Update locale preference in localStorage
    localStorage.setItem('preferredLocale', newLocale);
    
    // Navigate to new URL
    router.push(newUrl);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white"
        aria-label={t('language')}
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium">
          {locale === 'ko' ? '한국어' : 'English'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <button
            onClick={() => switchLanguage('ko')}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-200 ${
              locale === 'ko' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
            }`}
          >
            {t('korean')}
          </button>
          <button
            onClick={() => switchLanguage('en')}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-200 ${
              locale === 'en' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
            }`}
          >
            {t('english')}
          </button>
        </div>
      )}
    </div>
  );
} 