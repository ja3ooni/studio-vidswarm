// Implemented the aiTextToSubtitle flow that listens to a video and generates subtitles automatically.
'use server';
/**
 * @fileOverview An AI agent to generate subtitles from video.
 *
 * - aiTextToSubtitle - A function that handles the video to subtitles process.
 * - AiTextToSubtitleInput - The input type for the aiTextToSubtitle function.
 * - AiTextToSubtitleOutput - The return type for the aiTextToSubtitle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiTextToSubtitleInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      'A video to transcribe to subtitles, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
});
export type AiTextToSubtitleInput = z.infer<typeof AiTextToSubtitleInputSchema>;

const AiTextToSubtitleOutputSchema = z.object({
  subtitles: z.string().describe('The generated subtitles for the video.'),
});
export type AiTextToSubtitleOutput = z.infer<typeof AiTextToSubtitleOutputSchema>;

export async function aiTextToSubtitle(input: AiTextToSubtitleInput): Promise<AiTextToSubtitleOutput> {
  return aiTextToSubtitleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTextToSubtitlePrompt',
  input: {schema: AiTextToSubtitleInputSchema},
  output: {schema: AiTextToSubtitleOutputSchema},
  prompt: `You are an AI that generates subtitles for videos.

  Given the following video, generate subtitles.

  Video: {{media url=videoDataUri}}`,
});

const aiTextToSubtitleFlow = ai.defineFlow(
  {
    name: 'aiTextToSubtitleFlow',
    inputSchema: AiTextToSubtitleInputSchema,
    outputSchema: AiTextToSubtitleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
