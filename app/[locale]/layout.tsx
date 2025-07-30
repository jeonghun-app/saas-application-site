import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { TenantProvider } from "@/lib/contexts/tenant-context";
import { MultiTenantAuthProvider } from "@/lib/contexts/auth-provider";
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/request';
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
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body className={inter.className}>
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