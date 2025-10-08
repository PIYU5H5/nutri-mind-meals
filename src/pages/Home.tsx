import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Apple, BarChart3, Calendar, Lightbulb, Sparkles, Target } from "lucide-react";
import heroImage from "@/assets/hero-nutrition.jpg";

const Home = () => {
  const features = [
    {
      icon: BarChart3,
      title: "Food Analyzer",
      description: "Get instant nutrition data for any food item using real-time API data",
      link: "/analyzer",
      emoji: "🔍"
    },
    {
      icon: Lightbulb,
      title: "AI Diet Planner",
      description: "Personalized meal plans powered by Gemini AI based on your goals",
      link: "/planner",
      emoji: "🤖"
    },
    {
      icon: Calendar,
      title: "Diet Tracker",
      description: "Log your daily meals and track your calorie and macro intake",
      link: "/tracker",
      emoji: "📝"
    },
    {
      icon: Target,
      title: "Insights Dashboard",
      description: "Visualize your nutrition trends with beautiful charts",
      link: "/insights",
      emoji: "📊"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.95)), url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Powered by AI & Real Nutrition Data
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
              Your Smart Nutrition
              <span className="text-primary"> Companion</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Analyze food nutrition, track your diet, and get AI-powered meal plans tailored to your fitness goals. 
              Make healthier choices with data-driven insights.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Button asChild size="lg" className="text-lg px-8 shadow-lg">
                <Link to="/analyzer">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Analyze Food
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8">
                <Link to="/planner">
                  <Lightbulb className="mr-2 h-5 w-5" />
                  Get AI Meal Plan
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
          <p className="text-muted-foreground text-lg">Complete nutrition analysis and planning tools in one place</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link key={index} to={feature.link}>
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/50 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-3xl">{feature.emoji}</span>
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-8 md:p-12 text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Start Your Health Journey Today</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of users making smarter nutrition choices with NutriScan
            </p>
            <Button asChild size="lg" className="mt-4">
              <Link to="/analyzer">
                Get Started Free
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Home;
