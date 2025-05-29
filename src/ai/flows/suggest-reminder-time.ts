'use server';

/**
 * @fileOverview An AI agent that suggests a suitable time of day for a reminder based on its description.
 *
 * - suggestReminderTime - A function that suggests a reminder time.
 * - SuggestReminderTimeInput - The input type for the suggestReminderTime function.
 * - SuggestReminderTimeOutput - The return type for the suggestReminderTime function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestReminderTimeInputSchema = z.object({
  description: z.string().describe('The description of the reminder.'),
});
export type SuggestReminderTimeInput = z.infer<typeof SuggestReminderTimeInputSchema>;

const SuggestReminderTimeOutputSchema = z.object({
  suggestedTime: z.string().describe('A suggested time of day for the reminder, in HH:MM format.'),
  reasoning: z.string().describe('The reasoning behind the suggested time.'),
});
export type SuggestReminderTimeOutput = z.infer<typeof SuggestReminderTimeOutputSchema>;

export async function suggestReminderTime(input: SuggestReminderTimeInput): Promise<SuggestReminderTimeOutput> {
  return suggestReminderTimeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestReminderTimePrompt',
  input: {schema: SuggestReminderTimeInputSchema},
  output: {schema: SuggestReminderTimeOutputSchema},
  prompt: `You are an AI assistant that suggests a suitable time of day for a reminder, given its description.  The time should be in HH:MM format.

Description: {{{description}}}

Consider the description and suggest a time of day that would be appropriate for the reminder. Explain your reasoning.
`,
});

const suggestReminderTimeFlow = ai.defineFlow(
  {
    name: 'suggestReminderTimeFlow',
    inputSchema: SuggestReminderTimeInputSchema,
    outputSchema: SuggestReminderTimeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
