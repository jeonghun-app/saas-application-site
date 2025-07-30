import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

// Hook for locale-aware navigation
export function useLocaleNavigation() {
  const locale = useLocale();
  const router = useRouter();

  const navigateTo = (path: string) => {
    const localizedPath = path.startsWith('/') ? `/${locale}${path}` : `/${locale}/${path}`;
    router.push(localizedPath);
  };

  const redirectTo = (path: string) => {
    const localizedPath = path.startsWith('/') ? `/${locale}${path}` : `/${locale}/${path}`;
    if (typeof window !== 'undefined') {
      window.location.href = localizedPath;
    }
  };

  const replaceTo = (path: string) => {
    const localizedPath = path.startsWith('/') ? `/${locale}${path}` : `/${locale}/${path}`;
    if (typeof window !== 'undefined') {
      window.location.replace(localizedPath);
    }
  };

  return { navigateTo, redirectTo, replaceTo, locale };
}

// Utility function for getting localized path
export function getLocalizedPath(path: string, locale: string) {
  return path.startsWith('/') ? `/${locale}${path}` : `/${locale}/${path}`;
} 