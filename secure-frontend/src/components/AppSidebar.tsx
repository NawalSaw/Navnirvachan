"use client";

import { useState } from "react";
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
} from "lucide-react";

export function AppSidebar() {
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({});
  
  const toggleSection = (index: number) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <Sidebar collapsible="icon" className="z-10 flex pt-5 w-80 bg-gray-700 border-none scrollbar-none rounded-xl h-[90vh] mt-24">
      <SidebarHeader className="bg-gray-700">
        <h1 className="text-lg font-bold text-center text-white">
          Voting System
        </h1>
      </SidebarHeader>
      <SidebarContent className="p-2 pt-10 bg-gray-700 border-none scrollbar-none">
        <SidebarMenu className="flex flex-col space-y-4">
          {[
            {
              label: "Dashboard",
              icon: LayoutDashboard,
              links: [{ name: "Dashboard", href: "http://localhost:3000/admin/dashboard" }],
            },
            {
              label: "Election Management",
              icon: Calendar,
              links: [
                { name: "Create Election", href: "http://localhost:3000/admin/elections/create" },
                { name: "Manage Elections", href: "http://localhost:3000/admin/elections/manage" },
              ],
            },
            {
              label: "Admin Management",
              icon: Users,
              links: [
                { name: "Create admin", href: "http://localhost:3000/admin/create" },
                { name: "Manage admin", href: "http://localhost:3000/admin/manage" },
              ],
            },
            {
              label: "Voter Management",
              icon: VoteIcon,
              links: [
                { name: "Add Voters (Bulk Upload)", href: "http://localhost:3000/admin/voters/" },
              ],
            },
            {
              label: "Candidate Management",
              icon: Users,
              links: [
                { name: "Register Candidates", href: "http://localhost:3000/admin/candidates/register" },
                {
                  name: "Manage Candidates",
                  href: "http://localhost:3000/admin/candidates",
                },
              ],
            },
            {
              label: "Assembly Management",
              icon: Users,
              links: [
                { name: "Create Assembly", href: "http://localhost:3000/admin/assembly/" },
                {
                  name: "Manage Assembly",
                  href: "http://localhost:3000/admin/assembly/manage",
                },
              ],
            },
            {
              label: "Voting & Results",
              icon: Paperclip,
              links: [
                { name: "View Results (Graph & Table)", href: "http://localhost:3000/results" },
              ],
            },
            {
              label: "Security & Logs",
              icon: Lock,
              links: [
                { name: "Events Logs", href: "http://localhost:3000/admin/logs" },
              ],
            },
          ].map((section, index) => (
            <SidebarMenuItem key={index}>
              <Collapsible open={!!openSections[index]}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className="text-lg font-semibold text-gray-300"
                    onClick={() => toggleSection(index)}
                  >
                    <section.icon />
                    {section.label}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="">
                  <SidebarMenuSub className="flex flex-col gap-4 text-white ml-10">
                    {section?.links?.map((link, i) => (
                      <a href={link.href} key={i}>
                        <SidebarMenuSubItem className="text-md font-semibold">
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
      </SidebarContent>
      <SidebarFooter className="bg-gray-700">
        <p className="text-center text-sm text-gray-400">
          &copy; 2025 Voting System
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
