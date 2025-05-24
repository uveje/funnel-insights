import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, TrendingDown, Target, Users, DollarSign, Calendar } from "lucide-react"
import { getInsightsFromSheet } from "@/lib/google-sheets"

// Replace the existing getInsights function
async function getInsights() {
  return await getInsightsFromSheet()
}

export async function InsightsDisplay() {
  const data = await getInsights()

  const insightCategories = [
    {
      title: "Volume & Pipeline",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      insights: data.insights.volume,
    },
    {
      title: "Win Rate Analysis",
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-50",
      insights: data.insights.winRate,
    },
    {
      title: "Conversion Rates",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      insights: data.insights.conversionRates,
    },
    {
      title: "Performance Highlights",
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      insights: data.insights.performance,
    },
    {
      title: "Key Trends",
      icon: TrendingDown,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      insights: data.insights.trends,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Last Updated */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="flex items-center gap-2">
          <Calendar className="w-3 h-3" />
          Last updated: {new Date(data.lastUpdated).toLocaleString()}
        </Badge>
        <Badge variant="secondary">Auto-refresh enabled</Badge>
      </div>

      {/* Insights Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {insightCategories.map((category, index) => {
          const Icon = category.icon
          return (
            <Card key={index} className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className={`p-2 rounded-lg ${category.bgColor}`}>
                    <Icon className={`w-4 h-4 ${category.color}`} />
                  </div>
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {category.insights.map((insight, insightIndex) => (
                    <li key={insightIndex} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700 leading-relaxed">{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Separator />

      {/* Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Key Takeaways</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-blue-800">Strong performance across volume, win rates, and deal sizes</span>
            </li>
            <li className="flex items-start gap-2">
              <Target className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-blue-800">Enterprise segment showing exceptional results</span>
            </li>
            <li className="flex items-start gap-2">
              <DollarSign className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-blue-800">Q1 forecast indicates continued growth trajectory</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
