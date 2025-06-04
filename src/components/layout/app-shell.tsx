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
  SidebarTrigger,
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
      <Sidebar className="border-r" collapsible="icon">
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="hidden group-data-[state=expanded]:block" />
            <span className="sr-only group-data-[state=expanded]:hidden">VF</span>
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
                    className={cn(pathname === item.href && "bg-sidebar-accent text-sidebar-accent-foreground", "justify-start")}
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
                <SidebarMenuButton asChild tooltip={{ children: "Settings" }} className="justify-start">
                    <Link href="/settings">
                        <Settings className="mr-2 h-5 w-5 flex-shrink-0" />
                        <span className="group-data-[state=collapsed]:hidden">Settings</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
           </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <HeaderNav />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function MobileSidebarTrigger() {
    const { toggleSidebar } = useSidebar();
    return (
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={toggleSidebar}
      >
        <PanelLeft />
        <span className="sr-only">Toggle Menu</span>
      </Button>
    );
}
