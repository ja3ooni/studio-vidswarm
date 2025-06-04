"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { generateAiPrompt, type GenerateAiPromptOutput } from "@/ai/flows/ai-prompt-generator";
import { Wand2, Loader2, Copy } from "lucide-react";

const FormSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters long."),
  targetType: z.enum(["image", "speech"]),
});
type FormData = z.infer<typeof FormSchema>;

export default function PromptGeneratorClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<GenerateAiPromptOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      description: "",
      targetType: "image",
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setGeneratedPrompt(null);
    try {
      const result = await generateAiPrompt({
        description: data.description,
        targetType: data.targetType,
      });
      setGeneratedPrompt(result);
      toast({
        title: "Prompt Generated!",
        description: `Successfully generated a prompt for ${data.targetType}.`,
      });
    } catch (error) {
      console.error("Error generating prompt:", error);
      toast({
        title: "Error",
        description: "Failed to generate prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedPrompt?.prompt) {
      navigator.clipboard.writeText(generatedPrompt.prompt);
      toast({ title: "Copied!", description: "Prompt copied to clipboard." });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Wand2 className="w-8 h-8 text-primary" />
            <CardTitle className="font-headline text-3xl">AI Prompt Generator</CardTitle>
          </div>
          <CardDescription>
            Describe your desired image or speech, and our AI will generate an effective prompt.
          </CardDescription>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">Description of Scene/Element</Label>
              <Textarea
                id="description"
                placeholder="e.g., 'A majestic dragon flying over a medieval castle at sunset', or 'A calm, reassuring voice for a meditation app narration.'"
                {...form.register("description")}
                className="min-h-[100px] text-base"
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetType" className="text-base">Prompt Target Type</Label>
              <Controller
                control={form.control}
                name="targetType"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="targetType" className="text-base">
                      <SelectValue placeholder="Select target type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="speech">Speech/Voice</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Prompt...
                </>
              ) : (
                "Generate Prompt"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {generatedPrompt && (
        <Card className="max-w-2xl mx-auto mt-8 shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="font-headline text-2xl">Generated Prompt</CardTitle>
              <Button variant="outline" size="sm" onClick={copyToClipboard} aria-label="Copy prompt">
                <Copy className="mr-2 h-4 w-4" /> Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="p-4 bg-muted rounded-md text-sm text-muted-foreground whitespace-pre-wrap font-code break-words">
              {generatedPrompt.prompt}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Need to import Controller from react-hook-form for Select component integration
import { Controller } from "react-hook-form";
