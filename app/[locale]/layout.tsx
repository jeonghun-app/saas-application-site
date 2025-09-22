import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ErrorBoundary } from "@/components/error-boundary";
import Providers from "@/components/providers";
import { locales, defaultLocale } from '@/i18n/request';
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!locale || !locales.includes(locale as typeof locales[number])) {
    console.warn('Invalid locale provided:', locale, 'falling back to default:', defaultLocale);
    const redirectUrl = `/${defaultLocale}`;
    return (
      <html lang={defaultLocale}>
        <body className={inter.className}>
          <script
            dangerouslySetInnerHTML={{
              __html: `window.location.replace('${redirectUrl}');`
            }}
          />
        </body>
      </html>
    );
  }

  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <ErrorBoundary>
          <NextIntlClientProvider messages={messages}>
            <Providers>
              {children}
            </Providers>
          </NextIntlClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
} 