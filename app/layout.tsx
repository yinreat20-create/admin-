import type { Metadata } from 'next';
import './globals.css';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'SatisPro Yönetim',
  description: 'Lisans yönetim paneli',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <AdminAuthProvider>
          {children}
          <Toaster richColors position="top-right" />
        </AdminAuthProvider>
      </body>
    </html>
  );
}
