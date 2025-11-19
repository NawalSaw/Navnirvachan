import { AllowGuard } from "@/components/AllowGuard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AllowGuard allowedRole="admin">{children}</AllowGuard>;
}
