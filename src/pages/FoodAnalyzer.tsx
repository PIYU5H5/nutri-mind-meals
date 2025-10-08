import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2, Apple } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NutritionData {
  food_name: string;
  serving_qty: number;
  serving_unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
}

interface AIAlternative {
  name: string;
  reason: string;
}

const FoodAnalyzer = () => {
  const [foodName, setFoodName] = useState("");
  const [loading, setLoading] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [alternatives, setAlternatives] = useState<AIAlternative[]>([]);
  const { toast } = useToast();

  const analyzeFood = async () => {
    if (!foodName.trim()) {
      toast({
        title: "Please enter a food name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setNutritionData(null);
    setAlternatives([]);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: { foodName: foodName.trim() }
      });

      if (error) throw error;

      setNutritionData(data.nutrition);
      setAlternatives(data.alternatives || []);
      
      toast({
        title: "Analysis complete!",
        description: `Nutrition data for ${data.nutrition.food_name}`,
      });
    } catch (error: any) {
      console.error('Error analyzing food:', error);
      toast({
        title: "Analysis failed",
        description: error.message || "Could not analyze food. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🔍 Food Analyzer</h1>
          <p className="text-muted-foreground text-lg">
            Enter any food name to get detailed nutrition information
          </p>
        </div>

        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>Search Food</CardTitle>
            <CardDescription>
              Type a food name (e.g., "apple", "chicken breast", "pizza")
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter food name..."
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && analyzeFood()}
                className="text-lg"
              />
              <Button 
                onClick={analyzeFood}
                disabled={loading}
                size="lg"
                className="min-w-[120px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {nutritionData && (
          <>
            <Card className="mb-6 shadow-lg border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Apple className="h-6 w-6 text-primary" />
                  {nutritionData.food_name}
                </CardTitle>
                <CardDescription className="text-base">
                  Per serving: {nutritionData.serving_qty} {nutritionData.serving_unit}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-primary/5 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary">{nutritionData.calories}</div>
                    <div className="text-sm text-muted-foreground mt-1">Calories</div>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary">{nutritionData.protein}g</div>
                    <div className="text-sm text-muted-foreground mt-1">Protein</div>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary">{nutritionData.carbs}g</div>
                    <div className="text-sm text-muted-foreground mt-1">Carbs</div>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary">{nutritionData.fat}g</div>
                    <div className="text-sm text-muted-foreground mt-1">Fat</div>
                  </div>
                </div>

                {(nutritionData.fiber !== undefined || nutritionData.sugar !== undefined) && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      {nutritionData.fiber !== undefined && (
                        <div>
                          <span className="text-sm text-muted-foreground">Fiber: </span>
                          <span className="font-semibold">{nutritionData.fiber}g</span>
                        </div>
                      )}
                      {nutritionData.sugar !== undefined && (
                        <div>
                          <span className="text-sm text-muted-foreground">Sugar: </span>
                          <span className="font-semibold">{nutritionData.sugar}g</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {alternatives.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    💡 AI-Suggested Healthier Alternatives
                  </CardTitle>
                  <CardDescription>
                    Based on the nutrition profile, here are some healthier options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alternatives.map((alt, index) => (
                      <div key={index} className="p-4 bg-secondary/50 rounded-lg">
                        <div className="font-semibold text-lg mb-1">{alt.name}</div>
                        <div className="text-sm text-muted-foreground">{alt.reason}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!nutritionData && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            <Apple className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">Enter a food name above to see detailed nutrition information</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodAnalyzer;
