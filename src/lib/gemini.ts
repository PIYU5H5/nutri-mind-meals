const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

// Debug: Log API key status (first 10 chars only for security)
if (import.meta.env.DEV) {
  if (GEMINI_API_KEY) {
    console.log('✅ Gemini API Key loaded:', GEMINI_API_KEY.substring(0, 10) + '...');
  } else {
    console.error('❌ Gemini API Key NOT found. Check your .env file and restart the dev server.');
  }
}

export async function callGeminiJSON(prompt: string, options?: { maxOutputTokens?: number; temperature?: number }) {
  if (!GEMINI_API_KEY) {
    throw new Error('Missing VITE_GEMINI_API_KEY. Please check your .env file and restart the dev server.');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options?.temperature ?? 0.4,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: options?.maxOutputTokens ?? 1024,
        },
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = 'Gemini request failed';
    
    // Handle rate limiting and quota errors
    if (response.status === 429) {
      try {
        const errorData = JSON.parse(text);
        if (errorData.error?.message?.includes('quota')) {
          errorMessage = 'API quota exceeded. Please check your Gemini API plan and billing details. You may need to wait or upgrade your plan.';
        } else if (errorData.error?.message?.includes('rate limit')) {
          errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
        } else {
          errorMessage = errorData.error?.message || 'Rate limit exceeded. Please wait and try again.';
        }
      } catch {
        errorMessage = 'Rate limit or quota exceeded. Please wait a moment and try again, or check your API plan.';
      }
    } else {
      try {
        const errorData = JSON.parse(text);
        errorMessage = errorData.error?.message || text || 'Gemini request failed';
      } catch {
        errorMessage = text || 'Gemini request failed';
      }
    }
    
    const error = new Error(errorMessage);
    (error as any).status = response.status;
    (error as any).statusText = response.statusText;
    throw error;
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  // Try to extract object JSON first, then array JSON
  let jsonStr: string | null = null;
  const objectMatch = text.match(/\{[\s\S]*\}/);
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (objectMatch) jsonStr = objectMatch[0];
  else if (arrayMatch) jsonStr = arrayMatch[0];

  if (!jsonStr) {
    throw new Error('Failed to parse JSON from Gemini response');
  }
  return JSON.parse(jsonStr);
}


