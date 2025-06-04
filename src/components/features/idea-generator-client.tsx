"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateVideoIdeas, type VideoIdeaOutput } from "@/ai/flows/video-idea-generator";
import { Lightbulb, Loader2 } from "lucide-react";

const FormSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters long."),
});
type FormData = z.infer<typeof FormSchema>;

export default function IdeaGeneratorClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<VideoIdeaOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      topic: "",
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setGeneratedIdeas(null);
    try {
      const result = await generateVideoIdeas({ topic: data.topic });
      setGeneratedIdeas(result);
      toast({
        title: "Ideas Generated!",
        description: "Successfully generated video ideas.",
      });
    } catch (error) {
      console.error("Error generating video ideas:", error);
      toast({
        title: "Error",
        description: "Failed to generate video ideas. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Lightbulb className="w-8 h-8 text-primary" />
            <CardTitle className="font-headline text-3xl">AI Video Idea Generator</CardTitle>
          </div>
          <CardDescription>
            Enter a topic or theme, and let our AI spark your creativity with unique video ideas.
          </CardDescription>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-base">Topic or Theme</Label>
              <Input
                id="topic"
                placeholder="e.g., 'Sustainable Living Tips', 'Sci-Fi Short Film'"
                {...form.register("topic")}
                className="text-base"
              />
              {form.formState.errors.topic && (
                <p className="text-sm text-destructive">{form.formState.errors.topic.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Ideas"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {generatedIdeas && generatedIdeas.ideas.length > 0 && (
        <Card className="max-w-2xl mx-auto mt-8 shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Generated Ideas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {generatedIdeas.ideas.map((idea, index) => (
                <li key={index} className="p-3 bg-secondary/50 rounded-md border border-border">
                  <p className="text-secondary-foreground">{idea}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
