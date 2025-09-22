import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

// Hook for locale-aware navigation
export function useLocaleNavigation() {
  const locale = useLocale();
  const router = useRouter();

  const navigateTo = (path: string) => {
    try {
      const localizedPath = path.startsWith('/') ? `/${locale}${path}` : `/${locale}/${path}`;
      router.push(localizedPath);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to window.location
      if (typeof window !== 'undefined') {
        const fallbackPath = path.startsWith('/') ? `/${locale}${path}` : `/${locale}/${path}`;
        window.location.href = fallbackPath;
      }
    }
  };

  const redirectTo = (path: string) => {
    try {
      const localizedPath = path.startsWith('/') ? `/${locale}${path}` : `/${locale}/${path}`;
      if (typeof window !== 'undefined') {
        window.location.href = localizedPath;
      }
    } catch (error) {
      console.error('Redirect error:', error);
    }
  };

  const replaceTo = (path: string) => {
    try {
      const localizedPath = path.startsWith('/') ? `/${locale}${path}` : `/${locale}/${path}`;
      if (typeof window !== 'undefined') {
        window.location.replace(localizedPath);
      }
    } catch (error) {
      console.error('Replace error:', error);
    }
  };

  return { navigateTo, redirectTo, replaceTo, locale };
}

// Utility function for getting localized path
export function getLocalizedPath(path: string, locale: string) {
  return path.startsWith('/') ? `/${locale}${path}` : `/${locale}/${path}`;
} 