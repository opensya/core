import AuthProvider from "@/components/providers/auth";

export default function ({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
