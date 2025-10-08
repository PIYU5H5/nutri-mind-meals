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
    const { height, weight, bmi, dietType, goal } = await req.json();
    console.log('Generating meal plan for:', { height, weight, bmi, dietType, goal });

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('AI API key not configured');
    }

    const prompt = `Generate a detailed daily meal plan for a person with:
- Height: ${height}cm
- Weight: ${weight}kg
- BMI: ${bmi}
- Diet Type: ${dietType}
- Goal: ${goal}

Provide a structured meal plan with:
1. Breakfast (with specific foods and portions)
2. Lunch (with specific foods and portions)
3. Dinner (with specific foods and portions)
4. Snacks (2-3 healthy options)

For each meal, also provide estimated:
- Total daily calories
- Total daily protein (g)
- Total daily carbs (g)
- Total daily fat (g)

Return the response as a JSON object with this structure:
{
  "breakfast": "meal description",
  "lunch": "meal description",
  "dinner": "meal description",
  "snacks": "snack description",
  "totals": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number
  }
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a professional nutritionist. Create detailed, realistic meal plans. Return ONLY valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('Failed to generate meal plan from AI');
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    console.log('AI response:', content);

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const mealPlan = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify(mealPlan),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in generate-meal-plan function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
