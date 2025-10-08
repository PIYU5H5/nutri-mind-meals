import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const Insights = () => {
  // Mock data for demonstration
  const weeklyCalories = [
    { day: 'Mon', calories: 2100 },
    { day: 'Tue', calories: 1950 },
    { day: 'Wed', calories: 2200 },
    { day: 'Thu', calories: 1850 },
    { day: 'Fri', calories: 2300 },
    { day: 'Sat', calories: 2400 },
    { day: 'Sun', calories: 2000 },
  ];

  const macroDistribution = [
    { name: 'Protein', value: 25, color: '#10b981' },
    { name: 'Carbs', value: 50, color: '#3b82f6' },
    { name: 'Fat', value: 25, color: '#f59e0b' },
  ];

  const topFoods = [
    { name: 'Chicken Breast', frequency: 15, calories: 165 },
    { name: 'Brown Rice', frequency: 12, calories: 216 },
    { name: 'Broccoli', frequency: 10, calories: 55 },
    { name: 'Salmon', frequency: 8, calories: 206 },
    { name: 'Sweet Potato', frequency: 7, calories: 112 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">📊 Nutrition Insights</h1>
          <p className="text-muted-foreground text-lg">
            Visualize your nutrition trends and patterns
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Weekly Calorie Trends</CardTitle>
              <CardDescription>Your daily calorie intake over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyCalories}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="calories" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Macro Distribution</CardTitle>
              <CardDescription>Your average macronutrient breakdown</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={macroDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {macroDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle>🌟 Most Frequent Foods</CardTitle>
            <CardDescription>Top 5 foods you've logged this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topFoods.map((food, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{food.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Logged {food.frequency} times • ~{food.calories} cal per serving
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{food.frequency}</div>
                    <div className="text-xs text-muted-foreground">times</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="shadow-lg bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Average Daily Calories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">2,114</div>
              <p className="text-sm text-muted-foreground mt-2">
                Within your 2000-2200 target range
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Best Day</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">Thursday</div>
              <p className="text-sm text-muted-foreground mt-2">
                Most balanced macros
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">7 days</div>
              <p className="text-sm text-muted-foreground mt-2">
                Keep it up!
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-6 bg-muted/50 rounded-lg text-center">
          <p className="text-muted-foreground">
            💡 <strong>Note:</strong> This page shows sample data for demonstration. 
            In the full version, this would display your actual tracked meals and trends.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Insights;
