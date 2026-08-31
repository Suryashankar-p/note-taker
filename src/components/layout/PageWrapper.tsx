import type { ReactNode } from 'react';

export function PageWrapper({ children }: { children: ReactNode }) {
  return <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>;
}
