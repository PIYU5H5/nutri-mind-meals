import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { foodName } = await req.json();
    console.log('Analyzing food:', foodName);

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Use Gemini to analyze food and get nutrition data
    const nutritionResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze the nutrition information for "${foodName}". Provide a JSON response with the following structure:
{
  "nutrition": {
    "food_name": "standardized food name",
    "serving_qty": number,
    "serving_unit": "unit (e.g., cup, piece, gram)",
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "fiber": number,
    "sugar": number
  },
  "alternatives": [
    {
      "name": "healthier alternative name",
      "reason": "why it's healthier"
    }
  ]
}

Provide realistic nutrition values based on standard serving sizes. If calories are over 200, suggest 3 healthier alternatives. Otherwise, return an empty alternatives array.`
            }]
          }],
          generationConfig: {
            temperature: 0.4,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 1024,
          }
        }),
      }
    );

    if (!nutritionResponse.ok) {
      const errorText = await nutritionResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error('Failed to analyze food with Gemini');
    }

    const geminiData = await nutritionResponse.json();
    const responseText = geminiData.candidates[0].content.parts[0].text;
    console.log('Gemini response:', responseText);

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse nutrition data from AI response');
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    const nutritionData = parsedData.nutrition;
    const alternatives = parsedData.alternatives || [];

    console.log('Nutrition data retrieved:', nutritionData);

    return new Response(
      JSON.stringify({ nutrition: nutritionData, alternatives }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in analyze-food function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
