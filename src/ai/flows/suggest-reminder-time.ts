'use server';

/**
 * @fileOverview An AI agent that suggests a suitable time of day for a reminder based on its description.
 *
 * - suggestReminderTime - A function that suggests a reminder time.
 * - SuggestReminderTimeInput - The input type for the suggestReminderTime function.
 * - SuggestReminderTimeOutput - The return type for the suggestReminderTime function.
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ReminderSuggestion {
  title: string;
  description: string;
  time: string;
  icon?: string;
}

export async function suggestReminderTime({ description }: { description: string }): Promise<ReminderSuggestion> {
  const prompt = `Given this reminder description: "${description}"

Please analyze it and suggest a complete reminder with the following information:
1. A clear, concise title (max 5 words)
2. The full description
3. The most appropriate time for this reminder
4. A relevant icon name from this list: [calendar, clock, bell, check-circle, coffee, book, dumbbell, pill, shopping-cart, heart, star, gift, home, work, school, car, plane, train, bus, bike, walk, run, swim, food, drink, music, movie, game, phone, laptop, tablet, camera, video, photo, file, folder, document, note, pen, pencil, brush, paint, scissors, hammer, wrench, screwdriver, key, lock, unlock, eye, eye-off, sun, moon, cloud, rain, snow, wind, fire, water, earth, air, heart, brain, bone, tooth, pill, syringe, bandage, thermometer, stethoscope, microscope, telescope, compass, map, globe, flag, trophy, medal, crown, star, moon, sun, cloud, rain, snow, wind, fire, water, earth, air]

Return the response in this exact JSON format:
{
  "title": "string",
  "description": "string",
  "time": "string (in HH:mm format)",
  "icon": "string (from the provided list)"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that suggests reminder details based on user input. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const suggestion = JSON.parse(completion.choices[0].message.content || '{}') as ReminderSuggestion;
    return suggestion;
  } catch (error) {
    console.error('Error getting AI suggestion:', error);
    // Fallback to basic time suggestion if parsing fails
    return {
      title: description.split(' ').slice(0, 5).join(' '),
      description,
      time: '09:00',
      icon: 'bell'
    };
  }
}
