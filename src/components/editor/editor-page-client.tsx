
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { jsonAutoComplete, type JsonAutoCompleteOutput } from "@/ai/flows/json-auto-complete";
import { Clapperboard, Loader2, UploadCloud, Film, Palette, AlertTriangle, Sparkles, PlayCircle, ExternalLink } from "lucide-react";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";

interface EditorPageClientProps {
  projectId: string;
}

type RenderStatus = "idle" | "sending" | "polling" | "completed" | "failed";

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

const POLLING_INTERVAL = 3000; // 3 seconds
const MAX_POLLING_ATTEMPTS = 20; // Poll for a maximum of 1 minute (20 * 3s)

export default function EditorPageClient({ projectId }: EditorPageClientProps) {
  const [jsonDefinition, setJsonDefinition] = useState(initialJson);
  const [isAutoCompleting, setIsAutoCompleting] = useState(false);
  
  const [renderStatus, setRenderStatus] = useState<RenderStatus>("idle");
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderMessage, setRenderMessage] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [outputVideoUrl, setOutputVideoUrl] = useState<string | null>(null);
  const [currentPreviewImage, setCurrentPreviewImage] = useState("https://placehold.co/800x450.png?text=Video+Preview");
  const [aiHint, setAiHint] = useState("video placeholder");

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingAttemptsRef = useRef(0);

  const { toast } = useToast();

  const updatePreviewFromJSON = (currentJson: string) => {
    try {
        const parsedJson = JSON.parse(currentJson);
        if (parsedJson.scenes && parsedJson.scenes[0] && parsedJson.scenes[0].elements) {
            const firstImageElement = parsedJson.scenes[0].elements.find((el: any) => el.type === 'image' && el.src_placeholder);
            if (firstImageElement) {
                setCurrentPreviewImage(firstImageElement.src_placeholder);
                setAiHint(firstImageElement.data_ai_hint || "scene background");
            } else {
                setCurrentPreviewImage("https://placehold.co/800x450.png?text=Preview");
                setAiHint("preview placeholder");
            }
        } else {
             setCurrentPreviewImage("https://placehold.co/800x450.png?text=Preview");
             setAiHint("preview placeholder");
        }
    } catch (e) {
        setCurrentPreviewImage("https://placehold.co/800x450.png?text=Error+in+JSON");
        setAiHint("error display");
    }
  };


  useEffect(() => {
    toast({
      title: `Project "${projectId}" Loaded`,
      description: "Ready to edit your video masterpiece.",
    });
    updatePreviewFromJSON(initialJson);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, toast]);

  useEffect(() => {
    // Cleanup polling on component unmount or if job completes/fails
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const handleJsonChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newJson = event.target.value;
    setJsonDefinition(newJson);
    setOutputVideoUrl(null); // Reset video URL if JSON changes
    setRenderStatus("idle");
    setRenderMessage(null);
    if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
    }
    updatePreviewFromJSON(newJson);
  };

  const handleAutoComplete = async () => {
    setIsAutoCompleting(true);
    try {
      const result: JsonAutoCompleteOutput = await jsonAutoComplete({ jsonSnippet: jsonDefinition });
      const completedJson = result.completedJson;
      setJsonDefinition(completedJson);
      updatePreviewFromJSON(completedJson);
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

  const pollJobStatus = async (currentJobId: string) => {
    pollingAttemptsRef.current += 1;
    setRenderProgress(prev => Math.min(95, prev + (95 / MAX_POLLING_ATTEMPTS))); // Gradual progress
    
    if (pollingAttemptsRef.current > MAX_POLLING_ATTEMPTS) {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      setRenderStatus("failed");
      setRenderMessage("Rendering timed out. Please try again.");
      toast({ title: "Rendering Timeout", description: "The video rendering process took too long.", variant: "destructive" });
      setRenderProgress(0);
      return;
    }

    try {
      const response = await fetch(`/api/toolkit/job/status/${currentJobId}`);
      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.details || `Failed to get job status: ${response.statusText}`);
      }
      const result = await response.json();

      setRenderMessage(`Status: ${result.status || 'Processing...'}`);

      if (result.status === "completed") {
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        setOutputVideoUrl(result.outputUrl || null); // Assuming outputUrl is provided
        setRenderStatus("completed");
        setRenderMessage("Video rendering complete!");
        setRenderProgress(100);
        toast({ title: "Video Rendered!", description: "Your video is ready." });
      } else if (result.status === "failed") {
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        setRenderStatus("failed");
        setRenderMessage(`Rendering failed: ${result.error || 'Unknown error'}`);
        setRenderProgress(0);
        toast({ title: "Rendering Failed", description: result.error || "An error occurred during rendering.", variant: "destructive" });
      }
      // If still processing, polling continues automatically
    } catch (error) {
      console.error("Error polling job status:", error);
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      setRenderStatus("failed");
      setRenderMessage(`Error checking status: ${error instanceof Error ? error.message : String(error)}`);
      setRenderProgress(0);
      toast({ title: "Polling Error", description: "Could not check rendering status.", variant: "destructive" });
    }
  };

  const handleRenderVideo = async () => {
    setOutputVideoUrl(null);
    setRenderStatus("sending");
    setRenderProgress(5); // Initial progress
    setRenderMessage("Sending video definition to renderer...");
    toast({
      title: "Initializing Render...",
      description: "Preparing your video for processing.",
    });

    try {
      let parsedJsonDefinition;
      try {
        parsedJsonDefinition = JSON.parse(jsonDefinition);
      } catch (parseError) {
        toast({ title: "Invalid JSON", description: "Cannot render, JSON is not valid.", variant: "destructive" });
        setRenderStatus("failed");
        setRenderMessage("Invalid JSON format.");
        setRenderProgress(0);
        return;
      }
      
      const response = await fetch('/api/toolkit/ffmpeg/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonDefinition: parsedJsonDefinition }), // Send parsed JSON
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.details || `Failed to start rendering: ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.jobId) {
        throw new Error("No jobId received from the render API.");
      }
      
      setJobId(result.jobId);
      setRenderStatus("polling");
      setRenderMessage("Video sent to renderer. Waiting for progress...");
      setRenderProgress(10);
      pollingAttemptsRef.current = 0; // Reset attempts for new job
      
      // Clear previous interval if any
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      // Start polling
      pollingIntervalRef.current = setInterval(() => pollJobStatus(result.jobId), POLLING_INTERVAL);
      // Initial poll immediately
      pollJobStatus(result.jobId);


    } catch (error) {
      console.error("Error rendering video:", error);
      setRenderStatus("failed");
      setRenderMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
      setRenderProgress(0);
      toast({
        title: "Render Initiation Failed",
        description: error instanceof Error ? error.message : "Could not start the rendering process.",
        variant: "destructive",
      });
    }
  };
  
  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonDefinition);
      const formattedJson = JSON.stringify(parsed, null, 2);
      setJsonDefinition(formattedJson);
      // No need to update preview here as content is the same
      toast({ title: "JSON Formatted", description: "The JSON definition has been beautified."});
    } catch (error) {
      toast({ title: "Formatting Error", description: "Invalid JSON. Cannot format.", variant: "destructive"});
    }
  };

  const isProcessing = renderStatus === "sending" || renderStatus === "polling";

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,4rem)-2rem)] gap-4 p-1">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
         <Clapperboard className="w-7 h-7 text-primary" />
         <h1 className="font-headline text-3xl">Video Editor</h1>
        </div>
        <Button onClick={handleRenderVideo} disabled={isProcessing} size="lg">
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {renderStatus === "sending" ? "Initializing..." : "Rendering..."}
            </>
          ) : (
            "Render Video"
          )}
        </Button>
      </div>

      {(isProcessing || renderStatus === "completed" || renderStatus === "failed") && (
        <div className="my-2">
          {renderMessage && <p className="text-sm text-muted-foreground mb-1">{renderMessage}</p>}
          {(isProcessing || renderStatus === "failed" && renderProgress > 0) && <Progress value={renderProgress} className="w-full h-2" />}
           {renderStatus === "completed" && !outputVideoUrl && <p className="text-sm text-yellow-500">Render complete, but no video URL was provided by the API.</p>}
        </div>
      )}


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
              {renderStatus === "completed" && outputVideoUrl ? (
                <div className="w-full h-full flex flex-col items-center justify-center">
                   <video src={outputVideoUrl} controls className="max-w-full max-h-[calc(100%-2rem)]" data-ai-hint="rendered video player">
                    Your browser does not support the video tag.
                  </video>
                  <a
                    href={outputVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center text-sm text-primary hover:underline"
                  >
                    Open video in new tab <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
              ) : renderStatus === "completed" && !outputVideoUrl ? (
                 <div className="text-center p-4">
                    <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
                    <h3 className="mt-2 text-sm font-medium text-foreground">Render Complete (No URL)</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      The video was rendered, but the API did not provide a URL.
                    </p>
                  </div>
              ) : (
                <Image
                  src={currentPreviewImage}
                  alt="Video Preview"
                  width={800}
                  height={450}
                  className="object-contain max-w-full max-h-full"
                  data-ai-hint={aiHint}
                  key={currentPreviewImage} // Force re-render on src change
                  priority
                />
              )}
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

