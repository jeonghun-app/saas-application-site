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
    const messages = (await import(`../messages/${locale}.json`)).default;
    console.log('Successfully loaded messages for locale:', locale);
    return {
      locale,
      messages
    };
  } catch (error) {
    console.error('Failed to load messages for locale:', locale, error);
    
    // Try to load default locale messages as fallback
    try {
      const fallbackMessages = (await import(`../messages/${defaultLocale}.json`)).default;
      console.warn('Using fallback messages for locale:', defaultLocale);
      return {
        locale: defaultLocale,
        messages: fallbackMessages
      };
    } catch (fallbackError) {
      console.error('Failed to load fallback messages:', fallbackError);
      // Return empty messages as last resort
      return {
        locale: defaultLocale,
        messages: {}
      };
    }
  }
}); 