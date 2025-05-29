'use server';
/**
 * @fileOverview An AI agent that suggests a suitable Lucide icon for a reminder based on its title and description.
 *
 * - suggestReminderIcon - A function that suggests a reminder icon.
 * - SuggestReminderIconInput - The input type for the suggestReminderIcon function.
 * - SuggestReminderIconOutput - The return type for the suggestReminderIcon function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestReminderIconInputSchema = z.object({
  title: z.string().describe('The title of the reminder.'),
  description: z.string().optional().describe('The description of the reminder (optional).'),
});
export type SuggestReminderIconInput = z.infer<typeof SuggestReminderIconInputSchema>;

const SuggestReminderIconOutputSchema = z.object({
  suggestedIconName: z.string().describe("A suggested icon name from the Lucide React library (e.g., 'GlassWater', 'Bike', 'BookOpen', 'ClipboardList'). Should be a valid CamelCase name. If no specific icon is suitable, suggest 'ClipboardList'."),
  reasoning: z.string().describe('The reasoning behind the suggested icon name.'),
});
export type SuggestReminderIconOutput = z.infer<typeof SuggestReminderIconOutputSchema>;

export async function suggestReminderIcon(input: SuggestReminderIconInput): Promise<SuggestReminderIconOutput> {
  return suggestReminderIconFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestReminderIconPrompt',
  input: {schema: SuggestReminderIconInputSchema},
  output: {schema: SuggestReminderIconOutputSchema},
  prompt: `You are an AI assistant that suggests a suitable icon for a reminder from the Lucide React icon library, given its title and optional description. The icon name must be a valid CamelCase name from Lucide (e.g., 'GlassWater', 'Bike', 'BookOpen', 'AlarmClock', 'CalendarDays', 'Mail', 'MessageSquare').

If the title or description is vague or no specific icon seems appropriate, suggest a generic icon like 'ClipboardList' or 'Bell'.

Reminder Title: {{{title}}}
{{#if description}}Reminder Description: {{{description}}}{{/if}}

Consider the title and description to suggest an icon. Explain your reasoning for choosing that specific icon.
Ensure the suggestedIconName is a single, valid Lucide icon name.
`,
});

const suggestReminderIconFlow = ai.defineFlow(
  {
    name: 'suggestReminderIconFlow',
    inputSchema: SuggestReminderIconInputSchema,
    outputSchema: SuggestReminderIconOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure a fallback if AI fails to provide an icon name
    if (!output?.suggestedIconName) {
      return {
        suggestedIconName: 'ClipboardList',
        reasoning: 'No specific icon could be determined, defaulting to a generic list icon.',
      };
    }
    return output;
  }
);
