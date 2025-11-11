const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string;

export async function callOpenAIJSON(prompt: string, options?: { maxTokens?: number; temperature?: number }) {
  if (!OPENAI_API_KEY) {
    throw new Error('Missing VITE_OPENAI_API_KEY. Please check your .env file and restart the dev server.');
  }

  const response = await fetch(
    'https://api.openai.com/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that returns ONLY valid JSON. Do not include any text before or after the JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: options?.temperature ?? 0.4,
        max_tokens: options?.maxTokens ?? 1024,
        response_format: { type: 'json_object' }
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = 'OpenAI request failed';
    
    if (response.status === 429) {
      try {
        const errorData = JSON.parse(text);
        if (errorData.error?.message?.includes('quota') || errorData.error?.code === 'insufficient_quota') {
          errorMessage = 'API quota exceeded. Please check your OpenAI API plan and billing details. You may need to add credits or upgrade your plan.';
        } else if (errorData.error?.message?.includes('rate limit')) {
          errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
        } else {
          errorMessage = errorData.error?.message || 'Rate limit exceeded. Please wait and try again.';
        }
      } catch {
        errorMessage = 'Rate limit or quota exceeded. Please wait a moment and try again, or check your API plan.';
      }
    } else if (response.status === 401) {
      errorMessage = 'Invalid API key. Please check your VITE_OPENAI_API_KEY in .env file.';
    } else {
      try {
        const errorData = JSON.parse(text);
        errorMessage = errorData.error?.message || text || 'OpenAI request failed';
      } catch {
        errorMessage = text || 'OpenAI request failed';
      }
    }
    
    const error = new Error(errorMessage);
    (error as any).status = response.status;
    (error as any).statusText = response.statusText;
    throw error;
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content ?? '';
  
  if (!content) {
    throw new Error('Failed to get response from OpenAI');
  }

  try {
    return JSON.parse(content);
  } catch (parseError) {
    const jsonMatch = content.match(/\{[\s\S]*\}/) || content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse JSON from OpenAI response');
  }
}

