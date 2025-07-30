import { getRequestConfig } from 'next-intl/server';

export const locales = ['ko', 'en'] as const;
export const defaultLocale = 'ko';

export type Locale = typeof locales[number];

export default getRequestConfig(async ({ locale }) => {
  // Ensure we always have a valid locale
  if (!locale) {
    console.warn('No locale provided, falling back to default:', defaultLocale);
    locale = defaultLocale;
  }
  
  // Validate the locale
  if (!locales.includes(locale as Locale)) {
    console.warn('Invalid locale provided:', locale, 'falling back to default:', defaultLocale);
    locale = defaultLocale;
  }

  console.log('Loading messages for locale:', locale);

  try {
    return {
      locale,
      messages: (await import(`../messages/${locale}.json`)).default
    };
  } catch (error) {
    console.error('Failed to load messages for locale:', locale, error);
    // Fallback to default locale if loading fails
    return {
      locale: defaultLocale,
      messages: (await import(`../messages/${defaultLocale}.json`)).default
    };
  }
}); 