'use server';

/**
 * @fileOverview A scene sequence generator AI agent.
 *
 * - generateSceneSequence - A function that handles the scene sequence generation process.
 * - GenerateSceneSequenceInput - The input type for the generateSceneSequence function.
 * - GenerateSceneSequenceOutput - The return type for the generateSceneSequence function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSceneSequenceInputSchema = z.object({
  videoIdea: z.string().describe('The idea or summary of the video.'),
});
export type GenerateSceneSequenceInput = z.infer<typeof GenerateSceneSequenceInputSchema>;

const GenerateSceneSequenceOutputSchema = z.object({
  sceneSequence: z.array(
    z.object({
      sceneNumber: z.number().describe('The scene number in the sequence.'),
      description: z.string().describe('The description of the scene.'),
    })
  ).describe('A sequence of scenes with descriptions.'),
});
export type GenerateSceneSequenceOutput = z.infer<typeof GenerateSceneSequenceOutputSchema>;

export async function generateSceneSequence(input: GenerateSceneSequenceInput): Promise<GenerateSceneSequenceOutput> {
  return generateSceneSequenceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sceneSequenceGeneratorPrompt',
  input: {schema: GenerateSceneSequenceInputSchema},
  output: {schema: GenerateSceneSequenceOutputSchema},
  prompt: `You are an AI video script assistant. You are given a video idea or summary, and your job is to generate a sequence of scenes that could be used to create the video.

Video Idea: {{{videoIdea}}}

Generate a sequence of 5 scenes with descriptions that could be used to create the video. The output MUST be a JSON array of objects with the following schema:

[{
  "sceneNumber": 1,
  "description": "A description of the scene."
}]
`,
});

const generateSceneSequenceFlow = ai.defineFlow(
  {
    name: 'generateSceneSequenceFlow',
    inputSchema: GenerateSceneSequenceInputSchema,
    outputSchema: GenerateSceneSequenceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
