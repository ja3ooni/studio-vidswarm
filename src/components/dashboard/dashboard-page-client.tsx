"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clapperboard, Lightbulb, GalleryVerticalEnd, Wand2, PlayCircle } from "lucide-react";
import Image from "next/image";

const features = [
  {
    title: "AI Idea Generator",
    description: "Get inspired with AI-powered video concepts.",
    icon: Lightbulb,
    href: "/ideas",
    cta: "Generate Ideas",
  },
  {
    title: "AI Scene Generator",
    description: "Create compelling scene sequences for your stories.",
    icon: GalleryVerticalEnd,
    href: "/scenes",
    cta: "Generate Scenes",
  },
  {
    title: "AI Prompt Generator",
    description: "Craft perfect prompts for image and audio generation.",
    icon: Wand2,
    href: "/prompts",
    cta: "Generate Prompts",
  },
  {
    title: "Video Editor",
    description: "Bring your vision to life with our JSON-driven editor.",
    icon: Clapperboard,
    href: "/editor",
    cta: "Open Editor",
  },
];

export default function DashboardPageClient() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card className="mb-8 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="font-headline text-4xl tracking-tight">Welcome to VibeFlow AI</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Your all-in-one platform for AI-assisted video creation. Let's make something amazing!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 space-y-4">
            <p className="text-base">
              VibeFlow empowers you to seamlessly blend AI creativity with precise JSON control.
              Generate ideas, craft scenes, write prompts, and assemble stunning videos with our intuitive tools.
            </p>
            <Link href="/editor" passHref>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <PlayCircle className="mr-2 h-5 w-5" />
                Start Creating
              </Button>
            </Link>
          </div>
          <div className="flex-shrink-0">
            <Image
              src="https://placehold.co/600x400.png"
              alt="AI Video Editing Abstract"
              width={300}
              height={200}
              className="rounded-lg shadow-md"
              data-ai-hint="abstract technology"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => (
          <Card key={feature.title} className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <feature.icon className="w-8 h-8 text-primary" />
                <CardTitle className="font-headline text-2xl">{feature.title}</CardTitle>
              </div>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={feature.href} passHref>
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
                  {feature.cta}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
