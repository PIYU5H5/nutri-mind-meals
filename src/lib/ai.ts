import { callGeminiJSON } from './gemini';
import { callOpenAIJSON } from './openai';

const AI_PROVIDER = (import.meta.env.VITE_AI_PROVIDER || 'gemini').toLowerCase();

export interface AIOptions {
  maxTokens?: number;
  maxOutputTokens?: number;
  temperature?: number;
}

export async function callAIJSON(prompt: string, options?: AIOptions) {
  const geminiOptions = {
    maxOutputTokens: options?.maxOutputTokens || options?.maxTokens || 1024,
    temperature: options?.temperature ?? 0.4,
  };

  const openAIOptions = {
    maxTokens: options?.maxTokens || options?.maxOutputTokens || 1024,
    temperature: options?.temperature ?? 0.4,
  };

  if (AI_PROVIDER === 'openai') {
    return await callOpenAIJSON(prompt, openAIOptions);
  } else {
    return await callGeminiJSON(prompt, geminiOptions);
  }
}

