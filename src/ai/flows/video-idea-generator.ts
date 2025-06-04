'use server';

/**
 * @fileOverview AI-powered video idea generator flow.
 *
 * - generateVideoIdeas - A function that generates video ideas based on a topic or theme.
 * - VideoIdeaInput - The input type for the generateVideoIdeas function.
 * - VideoIdeaOutput - The return type for the generateVideoIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VideoIdeaInputSchema = z.object({
  topic: z.string().describe('The topic or theme for the video ideas.'),
});

export type VideoIdeaInput = z.infer<typeof VideoIdeaInputSchema>;

const VideoIdeaOutputSchema = z.object({
  ideas: z.array(
    z.string().describe('A creative video idea based on the topic.')
  ).describe('A list of creative video ideas.'),
});

export type VideoIdeaOutput = z.infer<typeof VideoIdeaOutputSchema>;

export async function generateVideoIdeas(input: VideoIdeaInput): Promise<VideoIdeaOutput> {
  return videoIdeaGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'videoIdeaGeneratorPrompt',
  input: {schema: VideoIdeaInputSchema},
  output: {schema: VideoIdeaOutputSchema},
  prompt: `You are a creative video idea generator. Given a topic or theme, you will generate several creative video ideas.

Topic or Theme: {{{topic}}}

Video Ideas (as a JSON array of strings):`,
});

const videoIdeaGeneratorFlow = ai.defineFlow(
  {
    name: 'videoIdeaGeneratorFlow',
    inputSchema: VideoIdeaInputSchema,
    outputSchema: VideoIdeaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
