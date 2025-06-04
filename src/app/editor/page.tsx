import EditorPageClient from "@/components/editor/editor-page-client";

export default function EditorPage() {
  // In a real app, you might fetch project data based on an ID here
  // For now, we pass a default project ID or handle it in the client
  return <EditorPageClient projectId="defaultProject" />;
}
