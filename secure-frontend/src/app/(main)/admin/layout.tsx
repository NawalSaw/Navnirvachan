import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import RightDashboardSidebar from "@/components/RightDashboardSidebar";
import { AuthGuard } from "@/components/AuthGuard";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRole="admin">
        <div className="flex min-h-full bg-gray-900">
      <SidebarProvider>

          {/* Left Sidebar */}
          <AppSidebar />

          {/* Main + Right Sidebar Container */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden scrollbar-hidden">

            {/* Main Content */}
            <main className="flex-1 p-4 sm:p-6 lg:p-10">
              {children}
            </main>

            {/* Right Sidebar (Responsive) */}
              <RightDashboardSidebar />

          </div>

      </SidebarProvider>
        </div>
    </AuthGuard>
  );
}
