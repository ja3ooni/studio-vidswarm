'use server';

/**
 * @fileOverview This file defines a Genkit flow for auto-completing JSON code.
 *
 * It takes incomplete JSON code as input and uses an LLM to suggest possible completions.
 *
 * @remarks
 * - jsonAutoComplete - The function to trigger the JSON auto-completion flow.
 * - JsonAutoCompleteInput - The input type for the jsonAutoComplete function.
 * - JsonAutoCompleteOutput - The output type for the jsonAutoComplete function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const JsonAutoCompleteInputSchema = z.object({
  jsonSnippet: z.string().describe('A snippet of JSON code to auto-complete.'),
});
export type JsonAutoCompleteInput = z.infer<typeof JsonAutoCompleteInputSchema>;

const JsonAutoCompleteOutputSchema = z.object({
  completedJson: z.string().describe('The auto-completed JSON code.'),
});
export type JsonAutoCompleteOutput = z.infer<typeof JsonAutoCompleteOutputSchema>;

export async function jsonAutoComplete(input: JsonAutoCompleteInput): Promise<JsonAutoCompleteOutput> {
  return jsonAutoCompleteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'jsonAutoCompletePrompt',
  input: {schema: JsonAutoCompleteInputSchema},
  output: {schema: JsonAutoCompleteOutputSchema},
  prompt: `You are a helpful AI assistant that auto-completes JSON code snippets.

  Given the following JSON snippet, provide the most likely and valid auto-completion:

  JSON snippet:
  \`\`\`json
  {{{jsonSnippet}}}
  \`\`\`

  Completed JSON:
  `,
});

const jsonAutoCompleteFlow = ai.defineFlow(
  {
    name: 'jsonAutoCompleteFlow',
    inputSchema: JsonAutoCompleteInputSchema,
    outputSchema: JsonAutoCompleteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
