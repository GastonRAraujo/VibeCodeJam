'use server';
/**
 * @fileOverview An AI agent that suggests a suitable Lucide icon for a reminder based on its title and description.
 *
 * - suggestReminderIcon - A function that suggests a reminder icon.
 * - SuggestReminderIconInput - The input type for the suggestReminderIcon function.
 * - SuggestReminderIconOutput - The return type for the suggestReminderIcon function.
 */

import { openai, defaultModel } from '@/lib/openai';
import { z } from 'zod';

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
  const prompt = `You are an AI assistant that suggests a suitable icon for a reminder from the Lucide React icon library, given its title and optional description. The icon name must be a valid CamelCase name from Lucide (e.g., 'GlassWater', 'Bike', 'BookOpen', 'AlarmClock', 'CalendarDays', 'Mail', 'MessageSquare').

If the title or description is vague or no specific icon seems appropriate, suggest a generic icon like 'ClipboardList' or 'Bell'.

Reminder Title: ${input.title}
${input.description ? `Reminder Description: ${input.description}` : ''}

Consider the title and description to suggest an icon. Explain your reasoning for choosing that specific icon.
Format your response as a JSON object with 'suggestedIconName' (string) and 'reasoning' (string) fields.`;

  try {
    const completion = await openai.chat.completions.create({
      model: defaultModel,
      messages: [
        { 
          role: "system", 
          content: "You are a helpful AI assistant that suggests appropriate Lucide icons for reminders. You must respond with ONLY a valid JSON object containing suggestedIconName and reasoning fields. No other text or formatting." 
        },
        { role: "user", content: prompt }
      ]
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Clean the response string to ensure it's valid JSON
    const cleanResponse = response.trim().replace(/^```json\s*|\s*```$/g, '');
    
    const parsed = JSON.parse(cleanResponse);
    const result = SuggestReminderIconOutputSchema.parse(parsed);

    // Ensure a fallback if AI fails to provide an icon name
    if (!result.suggestedIconName) {
      return {
        suggestedIconName: 'ClipboardList',
        reasoning: 'No specific icon could be determined, defaulting to a generic list icon.',
      };
    }

    return result;
  } catch (error) {
    console.error('Error in suggestReminderIcon:', error);
    throw new Error('Failed to suggest reminder icon');
  }
}
