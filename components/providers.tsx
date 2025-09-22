'use client';

import { TenantProvider } from "@/lib/contexts/tenant-context";
import { MultiTenantAuthProvider } from "@/lib/contexts/auth-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <TenantProvider>
      <MultiTenantAuthProvider>
        {children}
      </MultiTenantAuthProvider>
    </TenantProvider>
  );
}
