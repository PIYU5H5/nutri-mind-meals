import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MealEntry {
  id: string;
  food: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const DietTracker = () => {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [foodInput, setFoodInput] = useState("");
  const { toast } = useToast();

  const addMeal = () => {
    if (!foodInput.trim()) {
      toast({
        title: "Please enter a food item",
        variant: "destructive",
      });
      return;
    }

    // Mock data - in real app, this would call the Nutritionix API
    const newMeal: MealEntry = {
      id: Date.now().toString(),
      food: foodInput,
      calories: Math.floor(Math.random() * 300) + 100,
      protein: Math.floor(Math.random() * 30) + 5,
      carbs: Math.floor(Math.random() * 50) + 10,
      fat: Math.floor(Math.random() * 20) + 3,
    };

    setMeals([...meals, newMeal]);
    setFoodInput("");
    toast({
      title: "Meal added!",
      description: `${foodInput} has been logged`,
    });
  };

  const removeMeal = (id: string) => {
    setMeals(meals.filter(meal => meal.id !== id));
    toast({
      title: "Meal removed",
    });
  };

  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">📝 Diet Tracker</h1>
          <p className="text-muted-foreground text-lg">
            Log your daily meals and track your nutrition
          </p>
        </div>

        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>Add Meal</CardTitle>
            <CardDescription>
              Enter what you ate today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="e.g., Grilled chicken breast"
                value={foodInput}
                onChange={(e) => setFoodInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addMeal()}
                className="text-lg"
              />
              <Button onClick={addMeal} size="lg" className="min-w-[120px]">
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {meals.length > 0 && (
          <>
            <Card className="mb-6 shadow-lg border-primary/20">
              <CardHeader>
                <CardTitle>Today's Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-primary/5 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary">{totals.calories}</div>
                    <div className="text-sm text-muted-foreground mt-1">Calories</div>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary">{totals.protein}g</div>
                    <div className="text-sm text-muted-foreground mt-1">Protein</div>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary">{totals.carbs}g</div>
                    <div className="text-sm text-muted-foreground mt-1">Carbs</div>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary">{totals.fat}g</div>
                    <div className="text-sm text-muted-foreground mt-1">Fat</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Meals Logged</CardTitle>
                <CardDescription>{meals.length} items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {meals.map((meal) => (
                    <div key={meal.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-semibold text-lg mb-1">{meal.food}</div>
                        <div className="text-sm text-muted-foreground">
                          {meal.calories} cal • {meal.protein}g protein • {meal.carbs}g carbs • {meal.fat}g fat
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMeal(meal.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {meals.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Plus className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">No meals logged yet. Start tracking your food above!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DietTracker;
