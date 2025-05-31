import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Settings, BarChart3, Brain } from 'lucide-react'

export default function Home() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold tracking-tight">
            Train Your Mental Math Skills
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Improve your calculation speed and accuracy through targeted practice sessions. 
            Master mental strategies for addition, subtraction, multiplication, and division.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Brain className="h-8 w-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Problems Solved</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">0%</div>
                  <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Play className="h-8 w-8 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Sessions Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Action */}
        <Card className="p-8">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl">Ready to Practice?</CardTitle>
            <CardDescription>
              Start a new session with 10 problems. Customize your practice settings anytime.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="secondary">Addition</Badge>
              <Badge variant="secondary">Subtraction</Badge>
              <Badge variant="secondary">Multiplication</Badge>
              <Badge variant="secondary">Division</Badge>
            </div>
            
            <div className="flex justify-center gap-4">
              <Button size="lg" className="px-8">
                <Play className="mr-2 h-5 w-5" />
                Start Session
              </Button>
              <Button size="lg" variant="outline">
                <Settings className="mr-2 h-5 w-5" />
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Smart Learning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get personalized feedback and learn mental calculation strategies when you make mistakes.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Progress Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Monitor your improvement over time with detailed analytics and performance insights.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
