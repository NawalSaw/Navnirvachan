"use client";

import { useState, useEffect } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

import {
  Calendar,
  LayoutDashboard,
  Lock,
  Paperclip,
  Users,
  VoteIcon,
  Menu,
  X,
  Receipt,
  Loader2,
} from "lucide-react";
import { Button } from "./ui/Button";
import { useLogout } from "@/hooks/voterApi";
import { useRouter } from "next/navigation";

export function AppSidebar() {
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({});
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logoutAsync, isPending } = useLogout();

  const router = useRouter();

  // Detect screen size
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 1023);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const toggleSection = (i: number) => {
    setOpenSections((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  const handleLogout = () => {
    logoutAsync();
    router.push("/register");
  };
  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="fixed top-16 left-4 z-50 p-2 bg-gray-700 text-white rounded-lg shadow-xl"
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      )}

      <Sidebar
        collapsible={isMobile ? "none" : "icon"}
        className={`
          bg-gray-700 text-white border-none rounded-xl shadow-lg 
          z-40 mt-24 pt-5 
          h-[90vh] 
          transition-all duration-300
          ${
            isMobile
              ? `fixed top-0 left-0 w-72 transform ${
                  mobileOpen ? "translate-x-0" : "-translate-x-full"
                }`
              : "w-80"
          }
        `}
      >
        <SidebarHeader className="bg-gray-700">
          <h1 className="text-lg font-bold text-center text-white">
            Voting System
          </h1>
        </SidebarHeader>

        <SidebarContent
          className="
            p-3 pt-8 
            overflow-y-auto 
            scrollbar-none 
            bg-gray-700
          "
        >
          <SidebarMenu className="flex flex-col space-y-3">
            {[
              {
                label: "Dashboard",
                icon: LayoutDashboard,
                links: [
                  {
                    name: "Dashboard",
                    href: "/admin/dashboard",
                  },
                ],
              },
              {
                label: "Election Management",
                icon: Calendar,
                links: [
                  { name: "Create Election", href: "/admin/elections/create" },
                  { name: "Manage Elections", href: "/admin/elections/manage" },
                ],
              },
              {
                label: "Admin Management",
                icon: Users,
                links: [
                  { name: "Create admin", href: "/admin/create" },
                  { name: "Manage admin", href: "/admin/manage" },
                ],
              },
              {
                label: "Voter Management",
                icon: VoteIcon,
                links: [
                  { name: "Add Voters (Bulk Upload)", href: "/admin/voters" },
                ],
              },
              {
                label: "Candidate Management",
                icon: Users,
                links: [
                  {
                    name: "Register Candidates",
                    href: "/admin/candidates/register",
                  },
                  { name: "Manage Candidates", href: "/admin/candidates" },
                ],
              },
              {
                label: "Constituency Management",
                icon: Users,
                links: [
                  { name: "Create Constituency", href: "/admin/assembly" },
                  {
                    name: "Manage Constituency",
                    href: "/admin/assembly/manage",
                  },
                ],
              },
              {
                label: "Voting & Results",
                icon: Paperclip,
                links: [
                  {
                    name: "View Results (Graph & Table)",
                    href: "/results",
                  },
                ],
              },
              {
                label: "Approvals",
                icon: Receipt,
                links: [
                  {
                    name: "Approval Requests",
                    href: "/admin/approval-request",
                  },
                ],
              },
              {
                label: "Security & Logs",
                icon: Lock,
                links: [{ name: "Events Logs", href: "/admin/logs" }],
              },
            ].map((section, index) => (
              <SidebarMenuItem key={index}>
                <Collapsible open={!!openSections[index]}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      onClick={() => toggleSection(index)}
                      className="
                        text-lg font-semibold text-gray-300 
                        hover:text-black transition 
                        flex items-center gap-3 mt-5
                      "
                    >
                      <section.icon />
                      {section.label}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarMenuSub className="ml-10 flex flex-col gap-3 mt-2">
                      {section.links.map((link, i) => (
                        <a href={link.href} key={i}>
                          <SidebarMenuSubItem className="text-md font-medium text-gray-200 hover:text-white transition">
                            {link.name}
                          </SidebarMenuSubItem>
                        </a>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="bg-red-500 mt-10 rounded-md text-black flex justify-center items-center gap-2"
          >
            {isPending ? <Loader2 className="animate-spin" /> : "Logout"}
          </Button>
        </SidebarContent>
        <SidebarFooter className="bg-gray-700">
          <p className="text-center text-sm text-gray-400 pb-3">
            © 2025 Voting System
          </p>
        </SidebarFooter>
      </Sidebar>

      {/* Screen overlay when sidebar is open on mobile */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed bg-black/40 z-30 inset-0"
        />
      )}
    </>
  );
}
