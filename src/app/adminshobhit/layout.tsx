// Admin pages don't show the main header/footer
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
