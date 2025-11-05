import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { callGeminiJSON } from "@/lib/gemini";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface MealPlan {
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

const DietPlanner = () => {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [dietType, setDietType] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const { toast } = useToast();

  const generatePlan = async () => {
    if (!height || !weight || !dietType || !goal) {
      toast({
        title: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setMealPlan(null);

    try {
      const bmi = (parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1);

      const ai = await callGeminiJSON(`Generate a detailed daily meal plan for a person with:
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

For each meal, also provide estimated totals (daily): calories, protein (g), carbs (g), fat (g).

Return ONLY valid JSON with this structure:
{
  "breakfast": "meal description",
  "lunch": "meal description",
  "dinner": "meal description",
  "snacks": "snack description",
  "totals": { "calories": number, "protein": number, "carbs": number, "fat": number }
}`);

      setMealPlan(ai as MealPlan);
      toast({
        title: "Meal plan generated!",
        description: "Your personalized diet plan is ready",
      });
    } catch (error: any) {
      console.error('Error generating meal plan:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Could not generate meal plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const chartData = mealPlan ? [
    { name: 'Protein', value: mealPlan.totals.protein, color: '#10b981' },
    { name: 'Carbs', value: mealPlan.totals.carbs, color: '#3b82f6' },
    { name: 'Fat', value: mealPlan.totals.fat, color: '#f59e0b' },
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🤖 AI Diet Planner</h1>
          <p className="text-muted-foreground text-lg">
            Get a personalized meal plan powered by Gemini AI
          </p>
        </div>

        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>Your Details</CardTitle>
            <CardDescription>
              Tell us about yourself to generate a personalized plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="170"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="diet">Diet Type</Label>
                <Select value={dietType} onValueChange={setDietType}>
                  <SelectTrigger id="diet">
                    <SelectValue placeholder="Select diet type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal">Fitness Goal</Label>
                <Select value={goal} onValueChange={setGoal}>
                  <SelectTrigger id="goal">
                    <SelectValue placeholder="Select your goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight-loss">Weight Loss</SelectItem>
                    <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={generatePlan}
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate AI Meal Plan
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {mealPlan && (
          <>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>🍳 Breakfast</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">{mealPlan.breakfast}</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>🍱 Lunch</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">{mealPlan.lunch}</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>🍝 Dinner</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">{mealPlan.dinner}</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>🍎 Snacks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">{mealPlan.snacks}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>📊 Daily Nutrition Summary</CardTitle>
                <CardDescription>Total macronutrient distribution for your meal plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                      <span className="font-medium">Total Calories</span>
                      <span className="text-2xl font-bold text-primary">{mealPlan.totals.calories}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                      <span className="font-medium">Protein</span>
                      <span className="text-xl font-semibold">{mealPlan.totals.protein}g</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                      <span className="font-medium">Carbs</span>
                      <span className="text-xl font-semibold">{mealPlan.totals.carbs}g</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                      <span className="font-medium">Fat</span>
                      <span className="text-xl font-semibold">{mealPlan.totals.fat}g</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
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
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                  <strong>Disclaimer:</strong> This meal plan is generated by AI for demonstration purposes. 
                  Please consult with a healthcare professional or registered dietitian before making significant dietary changes.
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default DietPlanner;
