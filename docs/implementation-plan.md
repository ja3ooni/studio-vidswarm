
# VibeFlow AI Video Editor: Implementation Plan

## Introduction

This document outlines a phased implementation plan to significantly expand the capabilities of the VibeFlow AI Video Editor. The goal is to integrate the "No-Code Architect's Toolkit" API, introduce advanced video editing features with interactive previews, implement robust asset management, enable template creation and sharing, and broaden AI model support.

## Phase 1: Core Backend Integration & Basic Video Operations

**Objective:** Establish a connection to the "No-Code Architect's Toolkit" (NCAT) API and enable foundational video processing capabilities like rendering a video from a JSON definition.

**Key Tasks:**

1.  **Environment Setup:**
    *   Ensure `TOOLKIT_API_BASE_URL` and `TOOLKIT_API_KEY` are configured in `.env`.
2.  **Backend-for-Frontend (BFF) Routes for NCAT:**
    *   Create Next.js API routes to proxy requests to essential NCAT endpoints:
        *   `/api/toolkit/ffmpeg/compose` (for `/v1/ffmpeg/compose`)
        *   `/api/toolkit/media/convert` (for `/v1/media/convert`)
        *   `/api/toolkit/job/status/[jobId]` (for `/v1/toolkit/job/status`)
    *   Implement secure API key handling within these server-side routes.
3.  **Basic "Render Video" Functionality:**
    *   Modify the `handleRenderVideo` function in `EditorPageClient` to:
        *   Send the `jsonDefinition` to the `/api/toolkit/ffmpeg/compose` BFF route.
        *   Receive a job ID from the BFF.
        *   Implement polling logic using the `/api/toolkit/job/status/[jobId]` BFF route to check rendering progress.
        *   Update the UI based on job status (e.g., "Processing...", "Render Complete", "Error").
        *   On successful completion, display the output video (or a link to it).
4.  **JSON Schema - Initial Focus:**
    *   Ensure the current JSON structure is compatible with what `/v1/ffmpeg/compose` expects or adapt the BFF to transform it.

## Phase 2: Asset Management

**Objective:** Allow users to upload, manage, and use their own media files (images, videos, audio) in their video projects.

**Key Tasks:**

1.  **Cloud Storage Setup:**
    *   Choose and configure a cloud storage solution (e.g., Cloudflare R2, AWS S3).
    *   Set up buckets, permissions, and API credentials.
2.  **Database for Asset Metadata:**
    *   Select and set up a database (e.g., Firebase Firestore, Supabase, Neon).
    *   Design a schema to store asset metadata (e.g., `userId`, `fileName`, `storageUrl`, `mimeType`, `createdAt`, `size`).
3.  **Asset Upload Functionality:**
    *   Develop a UI component for file uploads within the "Assets" tab of the editor.
    *   Create a Next.js API route to handle file uploads:
        *   Receive the file stream/buffer.
        *   Upload the file to the chosen cloud storage.
        *   Save asset metadata to the database.
4.  **Asset Browser UI:**
    *   Develop a UI in the "Assets" tab to list and display user's uploaded assets (fetched from the database via a new API route).
    *   Allow users to select assets.
5.  **Integrate Assets into JSON:**
    *   When an asset is selected, update the `jsonDefinition` to use the asset's cloud storage URL (e.g., replacing `src_placeholder`).

## Phase 3: Enhanced Editing Experience & Interactive Preview

**Objective:** Replace the static image preview with a dynamic, interactive video preview using a library like Remotion, and improve the editing interface.

**Key Tasks:**

1.  **Integrate Remotion (or similar library):**
    *   Install Remotion and its dependencies.
    *   Replace the current `next/image` preview in `EditorPageClient` with Remotion's `<Player />` component.
2.  **JSON-to-Remotion Composition Mapping:**
    *   This is a critical step. Develop a set of functions or components that translate the `jsonDefinition` (scenes, elements, properties) into Remotion compositions (React components defining animations, timing, etc.).
    *   Start with basic elements (images, text) and gradually add support for more complex properties.
3.  **Real-time Preview Updates:**
    *   Ensure that changes to the `jsonDefinition` in the `Textarea` (or future UI controls) trigger a re-render of the Remotion preview.
4.  **Basic UI Controls for Editing:**
    *   Begin implementing interactive controls in the "Scene Details" or "Appearance" tabs (e.g., sliders for duration, color pickers for text). These controls will modify the `jsonDefinition`.
5.  **Timeline (Future Consideration with Remotion):**
    *   Explore Remotion's capabilities for displaying a visual timeline.

## Phase 4: Advanced Features & AI Expansion

**Objective:** Incorporate more sophisticated video editing features (transitions, effects, advanced audio) and broaden the range of AI models used for content generation.

**Key Tasks:**

1.  **Expand JSON Schema:**
    *   Evolve the `jsonDefinition` schema to support new features:
        *   Transitions (type, duration).
        *   Animations (keyframes, properties like opacity, scale, position).
        *   Audio mixing (multiple tracks, volume adjustments).
        *   Effects (filters, color correction).
2.  **Integrate NCAT Endpoints for Advanced Features:**
    *   Utilize relevant NCAT API endpoints via BFF routes:
        *   `/v1/video/caption`
        *   `/v1/video/concatenate` (if not fully covered in Phase 1)
        *   `/v1/image/convert/video` (for image-to-video elements)
        *   Other relevant media processing endpoints.
3.  **Client-Side Features with Remotion:**
    *   Implement features best handled client-side within Remotion (e.g., complex text animations, visual effects within scenes).
4.  **Expand Genkit AI Model Integration:**
    *   Update `src/ai/genkit.ts`:
        *   Add and configure Genkit plugins for OpenAI (for ChatGPT, DALL-E).
        *   Investigate and implement Ollama integration (e.g., via a custom Genkit tool making HTTP requests to a local Ollama instance if a direct plugin is unavailable).
    *   Refine AI Flows:
        *   Modify existing flows (`video-idea-generator`, `scene-sequence-generator`, `ai-prompt-generator`) to optionally specify or dynamically choose different models (Gemini, OpenAI models, Ollama models) based on the task or user preference.
        *   Example: Use DALL-E or Gemini Image Generation for visual elements based on descriptions.
        *   Example: Use different LLMs for scriptwriting vs. brainstorming.
    *   Create new flows if needed (e.g., a flow specifically for generating image prompts for DALL-E).

## Phase 5: Templating & Sharing

**Objective:** Allow users to save their video compositions as templates, browse existing templates, and share them.

**Key Tasks:**

1.  **Database Schema for Templates:**
    *   Extend the database schema to store templates (e.g., `templateId`, `userId`, `name`, `description`, `jsonDefinition`, `previewImageUrl`, `createdAt`).
2.  **"Save as Template" Functionality:**
    *   Add a UI button/option in the editor.
    *   On click, send the current `jsonDefinition` (and any template metadata like name/description) to a Next.js API route.
    *   The API route saves this information to the templates table in the database.
3.  **Template Browser UI:**
    *   Create a new page or section in the app to display available templates.
    *   Fetch templates from the database via an API route.
    *   Allow users to select a template to load into the editor (populating `jsonDefinition`).
4.  **Sharing Mechanism (Initial):**
    *   Implement basic sharing, potentially by generating a unique URL for each public template that, when visited, loads the template into the editor.

## Cross-Cutting Concerns (Ongoing Throughout Development)

*   **User Authentication & Authorization:**
    *   Implement a robust authentication system (e.g., NextAuth.js, Firebase Auth, Supabase Auth).
    *   Ensure that users can only access and modify their own assets and templates (unless explicitly shared).
*   **Error Handling & Logging:**
    *   Implement comprehensive error handling on both client and server.
    *   Set up logging for debugging and monitoring.
*   **UI/UX Refinements:**
    *   Continuously improve the user interface and experience based on new features and user feedback.
    *   Maintain consistency with the established theme.
*   **Responsive Design:**
    *   Ensure the application is usable across different screen sizes.
*   **Testing:**
    *   Write unit tests for critical functions (especially API interactions and JSON transformations).
    *   Implement integration tests for API routes and key user flows.
    *   Consider end-to-end tests for core features.
*   **Documentation:**
    *   Maintain internal documentation for code and architecture.
    *   Create user-facing documentation or guides for new features.
    *   Keep this implementation plan updated as development progresses.

This plan provides a high-level roadmap. Each phase and task will require further detailed planning and breakdown as development proceeds.
