import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AWS SaaS Factory - Multi-Tenant Application",
  description: "Multi-tenant SaaS application built with AWS SaaS Factory patterns",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
