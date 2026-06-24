// client/layouts/admin.tsx

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <aside>Sidebar admin</aside>

      <main>{children}</main>
    </div>
  );
}
