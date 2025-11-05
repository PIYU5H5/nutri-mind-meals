import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2, Apple, X, PieChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { callGeminiJSON } from "@/lib/gemini";
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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const [useWeight, setUseWeight] = useState(false);
  const [weightGrams, setWeightGrams] = useState("");

  useEffect(() => {
    if (!foodName || foodName.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(async () => {
      try {
        setSuggestLoading(true);
        const data = await callGeminiJSON(
          `Given a partial food query: "${foodName.trim()}"\nReturn ONLY a JSON array of up to 8 likely food names that users commonly mean. Example: ["chicken breast", "grilled chicken", "chicken salad"].`
        );
        if (Array.isArray(data)) {
          setSuggestions(data as string[]);
          setShowSuggestions(true);
        } else if (Array.isArray((data as any)?.suggestions)) {
          setSuggestions((data as any).suggestions as string[]);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setSuggestLoading(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [foodName]);

  const analyzeFood = async () => {
    if (!foodName.trim()) {
      toast({
        title: "Please enter a food name",
        variant: "destructive",
      });
      return;
    }

    if (useWeight) {
      const grams = parseFloat(weightGrams);
      if (!grams || grams <= 0) {
        toast({
          title: "Enter valid weight",
          description: "Please provide weight in grams greater than 0",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);

    try {
      const weightClause = useWeight && parseFloat(weightGrams) > 0
        ? `\nIf weight in grams is provided, compute nutrition for EXACTLY that weight, ignoring default serving sizes. Use: ${parseFloat(weightGrams)} grams. Set nutrition.serving_qty to ${parseFloat(weightGrams)} and nutrition.serving_unit to "g".`
        : "";
      const ai = await callGeminiJSON(
        `Analyze the nutrition information for "${foodName.trim()}".${weightClause} Provide a JSON response with the following structure:\n{\n  \"nutrition\": {\n    \"food_name\": \"standardized food name\",\n    \"serving_qty\": number,\n    \"serving_unit\": \"unit (e.g., cup, piece, gram)\",\n    \"calories\": number,\n    \"protein\": number,\n    \"carbs\": number,\n    \"fat\": number,\n    \"fiber\": number,\n    \"sugar\": number\n  },\n  \"alternatives\": [\n    {\n      \"name\": \"healthier alternative name\",\n      \"reason\": \"why it's healthier\"\n    }\n  ]\n}\nProvide realistic values based on standard serving sizes. If calories are over 200, suggest 3 alternatives. Otherwise, return an empty alternatives array.`
      );

      if (!ai?.nutrition ||
          typeof (ai as any).nutrition.calories !== 'number' ||
          !(ai as any).nutrition.food_name ||
          Number.isNaN((ai as any).nutrition.calories) ||
          (ai as any).nutrition.calories <= 0) {
        throw new Error('Invalid or unknown food name');
      }

      const newItem: FoodItem = {
        id: Date.now().toString(),
        nutrition: ai.nutrition,
        alternatives: ai.alternatives || []
      };

      setFoodItems(prev => [...prev, newItem]);
      setFoodName("");
      setSuggestions([]);
      setShowSuggestions(false);
      setWeightGrams("");
      
      toast({
        title: "Food added!",
        description: `${newItem.nutrition.food_name} has been added to your tracker`,
      });
    } catch (error: any) {
      console.error('Error analyzing food:', error);
      toast({
        title: "Invalid food name",
        description: (error as any).message || "Please enter a valid food name.",
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
              <div className="relative flex-1">
                <Input
                  placeholder="Enter food name..."
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') analyzeFood();
                    if (e.key === 'Escape') setShowSuggestions(false);
                  }}
                  className="text-lg"
                  onFocus={() => { if (suggestions.length) setShowSuggestions(true); }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                />
                {showSuggestions && (suggestions.length > 0 || suggestLoading) && (
                  <div className="absolute z-20 mt-1 w-full rounded-md border bg-background shadow-md max-h-56 overflow-auto">
                    {suggestLoading && (
                      <div className="px-3 py-2 text-sm text-muted-foreground">Searching…</div>
                    )}
                    {!suggestLoading && suggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-accent"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setFoodName(s);
                          setShowSuggestions(false);
                        }}
                      >
                        {s}
                      </button>
                    ))}
                    {!suggestLoading && suggestions.length === 0 && (
                      <div className="px-3 py-2 text-sm text-muted-foreground">No suggestions</div>
                    )}
                  </div>
                )}
              </div>
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

            <div className="mt-3 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox id="use-weight" checked={useWeight} onCheckedChange={(v: any) => setUseWeight(Boolean(v))} />
                <Label htmlFor="use-weight" className="text-sm text-muted-foreground">I know the weight</Label>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="e.g. 150"
                  className="w-28"
                  value={weightGrams}
                  onChange={(e) => setWeightGrams(e.target.value)}
                  disabled={!useWeight}
                />
                <span className="text-sm text-muted-foreground">g</span>
              </div>
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
