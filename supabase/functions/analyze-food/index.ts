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

    const nutritionixAppId = Deno.env.get('NUTRITIONIX_APP_ID');
    const nutritionixAppKey = Deno.env.get('NUTRITIONIX_APP_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!nutritionixAppId || !nutritionixAppKey) {
      throw new Error('Nutritionix API credentials not configured');
    }

    // Get nutrition data from Nutritionix
    const nutritionixResponse = await fetch(
      'https://trackapi.nutritionix.com/v2/natural/nutrients',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-app-id': nutritionixAppId,
          'x-app-key': nutritionixAppKey,
        },
        body: JSON.stringify({ query: foodName }),
      }
    );

    if (!nutritionixResponse.ok) {
      throw new Error('Failed to fetch nutrition data');
    }

    const nutritionixData = await nutritionixResponse.json();
    const food = nutritionixData.foods[0];

    const nutritionData = {
      food_name: food.food_name,
      serving_qty: food.serving_qty,
      serving_unit: food.serving_unit,
      calories: food.nf_calories,
      protein: food.nf_protein,
      carbs: food.nf_total_carbohydrate,
      fat: food.nf_total_fat,
      fiber: food.nf_dietary_fiber,
      sugar: food.nf_sugars,
    };

    console.log('Nutrition data retrieved:', nutritionData);

    // Get AI alternatives if food is high calorie
    let alternatives = [];
    if (lovableApiKey && nutritionData.calories > 200) {
      try {
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
                content: 'You are a nutrition expert. Suggest 3 healthier alternatives to the given food. Return ONLY a JSON array of objects with "name" and "reason" fields.'
              },
              {
                role: 'user',
                content: `Food: ${nutritionData.food_name}, Calories: ${nutritionData.calories}, Protein: ${nutritionData.protein}g, Carbs: ${nutritionData.carbs}g, Fat: ${nutritionData.fat}g. Suggest 3 healthier alternatives.`
              }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices[0].message.content;
          console.log('AI response:', content);
          
          // Extract JSON from response
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            alternatives = JSON.parse(jsonMatch[0]);
          }
        }
      } catch (error) {
        console.error('Error getting AI alternatives:', error);
      }
    }

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
