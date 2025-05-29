'use server';
/**
 * @fileOverview An AI agent that suggests a suitable Lucide icon for a reminder based on its title and description.
 *
 * - suggestReminderIcon - A function that suggests a reminder icon.
 * - SuggestReminderIconInput - The input type for the suggestReminderIcon function.
 * - SuggestReminderIconOutput - The return type for the suggestReminderIcon function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SuggestReminderIconInputSchema = z.object({
  title: z.string().describe('The title of the reminder.'),
  description: z.string().optional().describe('The description of the reminder (optional).'),
});

export type SuggestReminderIconInput = z.infer<typeof SuggestReminderIconInputSchema>;

const SuggestReminderIconOutputSchema = z.object({
  suggestedIconName: z.string().describe('The suggested Lucide icon name.'),
  reasoning: z.string().describe('The reasoning behind the suggested icon.'),
});

export type SuggestReminderIconOutput = z.infer<typeof SuggestReminderIconOutputSchema>;

export async function suggestReminderIcon(input: SuggestReminderIconInput): Promise<SuggestReminderIconOutput> {
  return ai.suggestReminderIcon(input.title, input.description);
}
