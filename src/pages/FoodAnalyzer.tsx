import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2, Apple, X, PieChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

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

interface FoodItem {
  id: string;
  nutrition: NutritionData;
  alternatives: AIAlternative[];
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

const FoodAnalyzer = () => {
  const [foodName, setFoodName] = useState("");
  const [loading, setLoading] = useState(false);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
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

    try {
      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: { foodName: foodName.trim() }
      });

      if (error) throw error;

      const newItem: FoodItem = {
        id: Date.now().toString(),
        nutrition: data.nutrition,
        alternatives: data.alternatives || []
      };

      setFoodItems(prev => [...prev, newItem]);
      setFoodName("");
      
      toast({
        title: "Food added!",
        description: `${data.nutrition.food_name} has been added to your tracker`,
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

  const removeFood = (id: string) => {
    setFoodItems(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Food removed",
      description: "Item has been removed from your tracker",
    });
  };

  const totalCalories = foodItems.reduce((sum, item) => sum + item.nutrition.calories, 0);
  const totalProtein = foodItems.reduce((sum, item) => sum + item.nutrition.protein, 0);
  const totalCarbs = foodItems.reduce((sum, item) => sum + item.nutrition.carbs, 0);
  const totalFat = foodItems.reduce((sum, item) => sum + item.nutrition.fat, 0);

  const chartData = totalCalories > 0 ? [
    { name: 'Protein', value: totalProtein * 4, grams: totalProtein },
    { name: 'Carbs', value: totalCarbs * 4, grams: totalCarbs },
    { name: 'Fat', value: totalFat * 9, grams: totalFat },
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🔍 Food Analyzer</h1>
          <p className="text-muted-foreground text-lg">
            Add foods to track your nutrition intake
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

        {foodItems.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Nutrition Breakdown
                </CardTitle>
                <CardDescription>
                  Macronutrient distribution by calories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPie>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string, props: any) => [
                      `${props.payload.grams.toFixed(1)}g (${value.toFixed(0)} cal)`,
                      name
                    ]} />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl">Total Nutrition</CardTitle>
                <CardDescription>Combined from all added foods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/5 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary">{totalCalories.toFixed(0)}</div>
                    <div className="text-sm text-muted-foreground mt-1">Calories</div>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary">{totalProtein.toFixed(1)}g</div>
                    <div className="text-sm text-muted-foreground mt-1">Protein</div>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary">{totalCarbs.toFixed(1)}g</div>
                    <div className="text-sm text-muted-foreground mt-1">Carbs</div>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary">{totalFat.toFixed(1)}g</div>
                    <div className="text-sm text-muted-foreground mt-1">Fat</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {foodItems.map((item) => (
          <div key={item.id} className="mb-6">
            <Card className="shadow-lg border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Apple className="h-6 w-6 text-primary" />
                      {item.nutrition.food_name}
                    </CardTitle>
                    <CardDescription className="text-base">
                      Per serving: {item.nutrition.serving_qty} {item.nutrition.serving_unit}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFood(item.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-primary/5 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary">{item.nutrition.calories}</div>
                    <div className="text-sm text-muted-foreground mt-1">Calories</div>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary">{item.nutrition.protein}g</div>
                    <div className="text-sm text-muted-foreground mt-1">Protein</div>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary">{item.nutrition.carbs}g</div>
                    <div className="text-sm text-muted-foreground mt-1">Carbs</div>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary">{item.nutrition.fat}g</div>
                    <div className="text-sm text-muted-foreground mt-1">Fat</div>
                  </div>
                </div>

                {(item.nutrition.fiber !== undefined || item.nutrition.sugar !== undefined) && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      {item.nutrition.fiber !== undefined && (
                        <div>
                          <span className="text-sm text-muted-foreground">Fiber: </span>
                          <span className="font-semibold">{item.nutrition.fiber}g</span>
                        </div>
                      )}
                      {item.nutrition.sugar !== undefined && (
                        <div>
                          <span className="text-sm text-muted-foreground">Sugar: </span>
                          <span className="font-semibold">{item.nutrition.sugar}g</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {item.alternatives.length > 0 && (
              <Card className="shadow-lg mt-4">
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
                    {item.alternatives.map((alt, index) => (
                      <div key={index} className="p-4 bg-secondary/50 rounded-lg">
                        <div className="font-semibold text-lg mb-1">{alt.name}</div>
                        <div className="text-sm text-muted-foreground">{alt.reason}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ))}

        {foodItems.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            <Apple className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">Add your first food item to start tracking nutrition</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodAnalyzer;
