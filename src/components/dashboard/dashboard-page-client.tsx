"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lightbulb, CodeXml, Zap } from "lucide-react"; // Icons for feature buttons

export default function DashboardPageClient() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--header-height))] text-center p-4 md:p-8 bg-background">
      <main className="flex-1 flex flex-col items-center justify-center space-y-8">
        <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight">
          AI-Powered Video <span className="text-primary">Creation</span>
        </h1>
        <p className="max-w-2xl text-lg md:text-xl text-muted-foreground">
          Generate ideas, create scenes, and compose stunning videos using AI and JSON
          configurations. The future of video editing is here.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <Button size="lg" variant="default" className="bg-muted hover:bg-muted/80 text-muted-foreground border border-primary/30 shadow-lg w-full sm:w-auto">
            <Lightbulb className="mr-2 h-5 w-5" />
            AI Scene Generation
          </Button>
          <Button size="lg" variant="default" className="bg-muted hover:bg-muted/80 text-muted-foreground border border-primary/30 shadow-lg w-full sm:w-auto">
            <CodeXml className="mr-2 h-5 w-5" />
            JSON Composition
          </Button>
          <Button size="lg" variant="default" className="bg-muted hover:bg-muted/80 text-muted-foreground border border-primary/30 shadow-lg w-full sm:w-auto">
            <Zap className="mr-2 h-5 w-5" />
            FFmpeg Rendering
          </Button>
        </div>
      </main>
      
      {/* 
        The features grid from the original dashboard is removed to match the screenshot.
        If you need other sections, they can be added here or in separate components.
      */}
    </div>
  );
}
