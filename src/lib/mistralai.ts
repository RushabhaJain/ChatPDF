import { createMistral } from '@ai-sdk/mistral';

export const mistral = createMistral({
  apiKey: process.env.MISTRAL_AI_API_KEY
});