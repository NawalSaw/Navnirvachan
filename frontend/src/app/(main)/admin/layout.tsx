import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import RightDashboardSidebar from "@/components/RightDashboardSidebar";
import { AuthGuard } from "@/components/AuthGuard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard allowedRole="admin">
      <div className="">
        <SidebarProvider>
          <AppSidebar />
          <main className="flex items-center w-full">
            <SidebarTrigger />
            {children}
          </main>
          <RightDashboardSidebar />
        </SidebarProvider>
      </div>
    </AuthGuard>
  );
}
