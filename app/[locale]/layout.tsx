import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { TenantProvider } from "@/lib/contexts/tenant-context";
import { MultiTenantAuthProvider } from "@/lib/contexts/auth-provider";
import { ErrorBoundary } from "@/components/error-boundary";
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
  // Await params before accessing properties
  const { locale } = await params;

  // Validate locale using the same validation logic
  if (!locale || !locales.includes(locale as typeof locales[number])) {
    console.warn('Invalid locale provided:', locale, 'falling back to default:', defaultLocale);
    // Instead of notFound(), redirect to default locale
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
            <TenantProvider>
              <MultiTenantAuthProvider>
                {children}
              </MultiTenantAuthProvider>
            </TenantProvider>
          </NextIntlClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
} 