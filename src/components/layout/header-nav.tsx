"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar'; // SidebarTrigger might be needed for mobile
import { useIsMobile } from '@/hooks/use-mobile';
import { LogOut, BookOpenText } from 'lucide-react'; // Added BookOpenText for Docs

export default function HeaderNav() {
  const isMobile = useIsMobile();
  const userEmail = "aljaunia@gmail.com"; // Placeholder email

  return (
    <header className="sticky top-0 z-10 flex h-[var(--header-height)] items-center gap-4 border-b border-border bg-card px-4 md:px-6 shadow-sm">
      {isMobile && <SidebarTrigger />}
      {!isMobile && <div className="w-8" />} {/* Placeholder for desktop sidebar trigger alignment */}
      
      <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-6 lg:gap-8">
        <span className="text-sm text-muted-foreground hidden md:inline">
          Welcome, {userEmail}
        </span>
        <Link href="/docs" passHref legacyBehavior>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hidden md:inline-flex items-center">
            <BookOpenText className="mr-2 h-4 w-4" />
            Docs
          </Button>
        </Link>
        <Button variant="outline" size="sm" className="bg-secondary hover:bg-secondary/80 text-secondary-foreground border-secondary hover:border-secondary/80">
          <LogOut className="mr-0 md:mr-2 h-4 w-4" />
          <span className="hidden md:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
}
