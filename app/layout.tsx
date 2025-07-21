import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TenantProvider } from "@/lib/contexts/tenant-context";
import { MultiTenantAuthProvider } from "@/lib/contexts/auth-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AWS SaaS Factory - Multi-Tenant Application",
  description: "Multi-tenant SaaS application built with AWS SaaS Factory patterns",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <TenantProvider>
          <MultiTenantAuthProvider>
            {children}
          </MultiTenantAuthProvider>
        </TenantProvider>
      </body>
    </html>
  );
}
