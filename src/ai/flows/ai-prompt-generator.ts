'use server';

/**
 * @fileOverview An AI agent for generating prompts for text-to-image or text-to-speech models.
 *
 * - generateAiPrompt - A function that generates AI prompts based on a scene or element description.
 * - GenerateAiPromptInput - The input type for the generateAiPrompt function.
 * - GenerateAiPromptOutput - The return type for the generateAiPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAiPromptInputSchema = z.object({
  description: z
    .string()
    .describe('A description of the scene or element for which to generate AI prompts.'),
  targetType: z.enum(['image', 'speech']).describe('The type of AI model for which to generate prompts (image or speech).'),
});
export type GenerateAiPromptInput = z.infer<typeof GenerateAiPromptInputSchema>;

const GenerateAiPromptOutputSchema = z.object({
  prompt: z.string().describe('The generated AI prompt.'),
});
export type GenerateAiPromptOutput = z.infer<typeof GenerateAiPromptOutputSchema>;

export async function generateAiPrompt(input: GenerateAiPromptInput): Promise<GenerateAiPromptOutput> {
  return generateAiPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAiPromptPrompt',
  input: {schema: GenerateAiPromptInputSchema},
  output: {schema: GenerateAiPromptOutputSchema},
  prompt: `You are an AI prompt generator. You will generate a prompt for a text-to-{{{targetType}}} AI model based on the provided description.\n\nDescription: {{{description}}}\n\nGenerated Prompt:`, 
});

const generateAiPromptFlow = ai.defineFlow(
  {
    name: 'generateAiPromptFlow',
    inputSchema: GenerateAiPromptInputSchema,
    outputSchema: GenerateAiPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
