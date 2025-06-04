"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { jsonAutoComplete, type JsonAutoCompleteOutput } from "@/ai/flows/json-auto-complete";
import { Clapperboard, Loader2, UploadCloud, Film, Palette, AlertTriangle, Sparkles } from "lucide-react";
import Image from "next/image";

interface EditorPageClientProps {
  projectId: string;
}

const initialJson = `{
  "projectName": "My First VibeFlow Video",
  "resolution": "1920x1080",
  "fps": 30,
  "scenes": [
    {
      "id": "scene_1",
      "duration": 5,
      "elements": [
        {
          "type": "image",
          "src_placeholder": "https://placehold.co/1920x1080.png?text=Scene+1+Background",
          "data_ai_hint": "futuristic cityscape",
          "description": "Opening shot of a futuristic city skyline at dusk."
        },
        {
          "type": "text",
          "content": "The Future is Now",
          "font": "Belleza",
          "size": 72,
          "color": "#FFFFFF",
          "position": {"x": "center", "y": "80%"}
        }
      ],
      "audio": {
        "background_music_placeholder": "path/to/ambient_music.mp3",
        "voice_over_script": "In a world where technology reigns supreme..."
      },
      "subtitles": "In a world where technology reigns supreme..."
    }
  ]
}`;

export default function EditorPageClient({ projectId }: EditorPageClientProps) {
  const [jsonDefinition, setJsonDefinition] = useState(initialJson);
  const [isRendering, setIsRendering] = useState(false);
  const [isAutoCompleting, setIsAutoCompleting] = useState(false);
  const [currentPreview, setCurrentPreview] = useState("https://placehold.co/800x450.png?text=Video+Preview");
  const [aiHint, setAiHint] = useState("video placeholder");

  const { toast } = useToast();

  useEffect(() => {
    // Simulate loading project data
    toast({
      title: `Project "${projectId}" Loaded`,
      description: "Ready to edit your video masterpiece.",
    });
    // Try to parse the initial JSON to set a more specific preview if possible
    try {
        const parsedJson = JSON.parse(jsonDefinition);
        if (parsedJson.scenes && parsedJson.scenes[0] && parsedJson.scenes[0].elements) {
            const firstImageElement = parsedJson.scenes[0].elements.find((el: any) => el.type === 'image' && el.src_placeholder);
            if (firstImageElement) {
                setCurrentPreview(firstImageElement.src_placeholder);
                setAiHint(firstImageElement.data_ai_hint || "scene background");
            }
        }
    } catch (e) {
        // Keep default preview if JSON is invalid
    }
  }, [projectId, toast, jsonDefinition]);

  const handleJsonChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonDefinition(event.target.value);
  };

  const handleAutoComplete = async () => {
    setIsAutoCompleting(true);
    try {
      // For auto-complete, we might send a snippet or the whole JSON
      // Depending on the AI flow's design, this might need adjustment
      const result: JsonAutoCompleteOutput = await jsonAutoComplete({ jsonSnippet: jsonDefinition });
      setJsonDefinition(result.completedJson);
      toast({
        title: "JSON Auto-Completed",
        description: "The AI has suggested completions for your JSON.",
      });
    } catch (error) {
      console.error("Error auto-completing JSON:", error);
      toast({
        title: "Auto-Complete Error",
        description: "Could not auto-complete JSON. Ensure valid JSON structure.",
        variant: "destructive",
      });
    } finally {
      setIsAutoCompleting(false);
    }
  };

  const handleRenderVideo = () => {
    setIsRendering(true);
    toast({
      title: "Rendering Video...",
      description: "Your video is being processed. This might take a few moments.",
    });
    // Simulate FFmpeg processing
    setTimeout(() => {
      setIsRendering(false);
      toast({
        title: "Video Rendered!",
        description: "Your video is ready for preview (simulation).",
        variant: "default",
      });
      // Update preview based on current JSON (simplified)
       try {
        const parsedJson = JSON.parse(jsonDefinition);
        if (parsedJson.scenes && parsedJson.scenes[0] && parsedJson.scenes[0].elements) {
            const firstImageElement = parsedJson.scenes[0].elements.find((el: any) => el.type === 'image' && el.src_placeholder);
            if (firstImageElement) {
                setCurrentPreview(firstImageElement.src_placeholder);
                setAiHint(firstImageElement.data_ai_hint || "scene background");
            } else {
                 setCurrentPreview("https://placehold.co/800x450.png?text=Rendered+Preview");
                 setAiHint("rendered video");
            }
        } else {
            setCurrentPreview("https://placehold.co/800x450.png?text=Rendered+Preview");
            setAiHint("rendered video");
        }
      } catch (e) {
        setCurrentPreview("https://placehold.co/800x450.png?text=Error+in+JSON");
        setAiHint("error display");
        toast({title: "JSON Error", description: "Invalid JSON structure, cannot update preview.", variant: "destructive"});
      }
    }, 3000);
  };
  
  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonDefinition);
      setJsonDefinition(JSON.stringify(parsed, null, 2));
      toast({ title: "JSON Formatted", description: "The JSON definition has been beautified."});
    } catch (error) {
      toast({ title: "Formatting Error", description: "Invalid JSON. Cannot format.", variant: "destructive"});
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,4rem)-2rem)] gap-4 p-1">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
         <Clapperboard className="w-7 h-7 text-primary" />
         <h1 className="font-headline text-3xl">Video Editor</h1>
        </div>
        <Button onClick={handleRenderVideo} disabled={isRendering} size="lg">
          {isRendering ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Rendering...
            </>
          ) : (
            "Render Video"
          )}
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
        {/* JSON Editor Panel */}
        <Card className="lg:col-span-1 flex flex-col shadow-lg overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="font-headline text-xl">JSON Definition</CardTitle>
            <CardDescription>Define your video scenes and elements using JSON.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-2 overflow-hidden p-4">
            <Textarea
              value={jsonDefinition}
              onChange={handleJsonChange}
              placeholder="Enter your JSON video definition here..."
              className="font-code text-xs flex-1 resize-none leading-relaxed bg-muted/30 border-border"
              spellCheck="false"
            />
            <div className="flex gap-2 mt-2">
               <Button variant="outline" onClick={formatJson} size="sm" className="flex-1">Format JSON</Button>
               <Button variant="outline" onClick={handleAutoComplete} disabled={isAutoCompleting} size="sm" className="flex-1">
                {isAutoCompleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                AI Complete
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview and Tools Panel */}
        <Card className="lg:col-span-2 flex flex-col shadow-lg overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="font-headline text-xl">Preview & Tools</CardTitle>
             <CardDescription>Visualize your video and manage assets or scene details.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 grid grid-rows-[auto_1fr] gap-4 p-4 overflow-hidden">
            {/* Video Preview */}
            <div className="bg-muted rounded-lg aspect-video flex items-center justify-center overflow-hidden border border-border shadow-inner">
              <Image
                src={currentPreview}
                alt="Video Preview"
                width={800}
                height={450}
                className="object-contain max-w-full max-h-full"
                data-ai-hint={aiHint}
                key={currentPreview} // Force re-render on src change
              />
            </div>

            {/* Tools Tabs */}
            <Tabs defaultValue="assets" className="flex flex-col overflow-hidden">
              <TabsList className="shrink-0">
                <TabsTrigger value="assets"><UploadCloud className="mr-2 h-4 w-4" /> Assets</TabsTrigger>
                <TabsTrigger value="scene-details"><Film className="mr-2 h-4 w-4" /> Scene Details</TabsTrigger>
                <TabsTrigger value="appearance"><Palette className="mr-2 h-4 w-4" /> Appearance</TabsTrigger>
                <TabsTrigger value="issues"><AlertTriangle className="mr-2 h-4 w-4" /> Issues</TabsTrigger>
              </TabsList>
              <TabsContent value="assets" className="flex-1 overflow-y-auto p-2 bg-background rounded-b-md border border-t-0 border-border">
                <div className="text-center py-10">
                  <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium text-foreground">Asset Management</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Upload and manage your images, videos, and audio files here. (Feature coming soon)
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="scene-details" className="flex-1 overflow-y-auto p-2 bg-background rounded-b-md border border-t-0 border-border">
                 <div className="text-center py-10">
                  <Film className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium text-foreground">Scene Details</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Inspect and fine-tune properties of the currently selected scene. (Feature coming soon)
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="appearance" className="flex-1 overflow-y-auto p-2 bg-background rounded-b-md border border-t-0 border-border">
                 <div className="text-center py-10">
                  <Palette className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium text-foreground">Appearance & Styles</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Adjust global styles, fonts, and color palettes for your video. (Feature coming soon)
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="issues" className="flex-1 overflow-y-auto p-2 bg-background rounded-b-md border border-t-0 border-border">
                 <div className="text-center py-10">
                  <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                  <h3 className="mt-2 text-sm font-medium text-foreground">Validation Issues</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Any issues found in your JSON definition will be displayed here. (No issues found)
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
