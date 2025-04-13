import { AuthGuard } from "@/components/AuthGuard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthGuard allowedRole="voter">{children}</AuthGuard>;
}
