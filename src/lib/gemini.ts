const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

export async function callGeminiJSON(prompt: string, options?: { maxOutputTokens?: number; temperature?: number }) {
  if (!GEMINI_API_KEY) {
    throw new Error('Missing VITE_GEMINI_API_KEY');
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
    throw new Error(text || 'Gemini request failed');
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


