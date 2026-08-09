// Admin pages don't show the main header/footer
import { AdminSessionBootstrap } from '@/components/admin/AdminSessionBootstrap';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminSessionBootstrap>{children}</AdminSessionBootstrap>;
}
