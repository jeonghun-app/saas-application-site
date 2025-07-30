import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { TenantProvider } from "@/lib/contexts/tenant-context";
import { MultiTenantAuthProvider } from "@/lib/contexts/auth-provider";
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/request';

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
  if (!locale || !locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <TenantProvider>
            <MultiTenantAuthProvider>
              {children}
            </MultiTenantAuthProvider>
          </TenantProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
} 