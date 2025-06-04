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
import { generateSceneSequence, type GenerateSceneSequenceOutput } from "@/ai/flows/scene-sequence-generator";
import { GalleryVerticalEnd, Loader2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FormSchema = z.object({
  videoIdea: z.string().min(10, "Video idea must be at least 10 characters long."),
});
type FormData = z.infer<typeof FormSchema>;

export default function SceneGeneratorClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedScenes, setGeneratedScenes] = useState<GenerateSceneSequenceOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      videoIdea: "",
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setGeneratedScenes(null);
    try {
      const result = await generateSceneSequence({ videoIdea: data.videoIdea });
      setGeneratedScenes(result);
      toast({
        title: "Scenes Generated!",
        description: "Successfully generated scene sequence.",
      });
    } catch (error) {
      console.error("Error generating scenes:", error);
      toast({
        title: "Error",
        description: "Failed to generate scenes. Please try again.",
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
            <GalleryVerticalEnd className="w-8 h-8 text-primary" />
            <CardTitle className="font-headline text-3xl">AI Scene Generator</CardTitle>
          </div>
          <CardDescription>
            Provide your video idea, and our AI will craft a compelling sequence of scenes.
          </CardDescription>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="videoIdea" className="text-base">Video Idea / Summary</Label>
              <Textarea
                id="videoIdea"
                placeholder="e.g., 'A futuristic detective uncovers a conspiracy in a neon-lit city.' "
                {...form.register("videoIdea")}
                className="min-h-[100px] text-base"
              />
              {form.formState.errors.videoIdea && (
                <p className="text-sm text-destructive">{form.formState.errors.videoIdea.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Scenes...
                </>
              ) : (
                "Generate Scene Sequence"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {generatedScenes && generatedScenes.sceneSequence.length > 0 && (
        <Card className="max-w-2xl mx-auto mt-8 shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Generated Scene Sequence</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {generatedScenes.sceneSequence.map((scene) => (
                <AccordionItem value={`scene-${scene.sceneNumber}`} key={scene.sceneNumber}>
                  <AccordionTrigger className="text-lg hover:no-underline">
                    Scene {scene.sceneNumber}
                  </AccordionTrigger>
                  <AccordionContent className="p-4 bg-secondary/30 rounded-md">
                    <p className="text-secondary-foreground">{scene.description}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
