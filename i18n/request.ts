import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['ko', 'en'];
export const defaultLocale = 'ko';

export default getRequestConfig(async ({ locale }) => {
  // Validate locale and provide fallback
  if (!locale || !locales.includes(locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
}); 