"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Clapperboard,
  GalleryVerticalEnd,
  LayoutDashboard,
  Lightbulb,
  PanelLeft,
  Settings,
  Wand2,
  Video // For the logo icon if needed directly
} from 'lucide-react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  // SidebarTrigger is not explicitly used here, PanelLeft is used in MobileSidebarTrigger
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons/logo';
import HeaderNav from './header-nav';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/editor', label: 'Video Editor', icon: Clapperboard },
  { href: '/ideas', label: 'AI Idea Generator', icon: Lightbulb },
  { href: '/scenes', label: 'AI Scene Generator', icon: GalleryVerticalEnd },
  { href: '/prompts', label: 'AI Prompt Generator', icon: Wand2 },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider defaultOpen>
      <Sidebar className="border-r border-sidebar-border" collapsible="icon">
        <SidebarHeader className="p-4 flex items-center justify-between group-data-[state=expanded]:justify-start">
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            {/* Logo for expanded state */}
            <Logo className="hidden group-data-[state=expanded]:flex" showText={true}/>
            {/* Icon-only for collapsed state */}
            <div className="group-data-[state=collapsed]:flex hidden items-center justify-center w-8 h-8 bg-primary p-1.5 rounded-lg">
              <Video className="h-5 w-5 text-primary-foreground" />
            </div>
             <span className="ml-1 px-1.5 py-0.5 text-[10px] font-medium bg-secondary text-secondary-foreground rounded-full group-data-[state=expanded]:inline hidden">
              Beta
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label }}
                    className={cn(
                      pathname === item.href && "bg-sidebar-accent text-sidebar-accent-foreground",
                      "justify-start hover:bg-sidebar-accent/80"
                    )}
                  >
                    <a>
                      <item.icon className="mr-2 h-5 w-5 flex-shrink-0" />
                      <span className="group-data-[state=collapsed]:hidden">
                        {item.label}
                      </span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/settings" legacyBehavior passHref>
                <SidebarMenuButton asChild tooltip={{ children: "Settings" }} className="justify-start hover:bg-sidebar-accent/80">
                    <a>
                        <Settings className="mr-2 h-5 w-5 flex-shrink-0" />
                        <span className="group-data-[state=collapsed]:hidden">Settings</span>
                    </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
           </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col bg-background"> {/* Ensure inset respects main background */}
        <HeaderNav />
        <main className="flex-1 overflow-y-auto"> {/* Removed padding, dashboard will handle its own */}
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
