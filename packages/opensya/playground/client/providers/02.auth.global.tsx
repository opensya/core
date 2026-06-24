import AuthProvider from "@/components/AuthProvider";

export default function AuthGlobalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
