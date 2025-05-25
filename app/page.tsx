import { Suspense } from "react"
import { FileUpload } from "@/components/file-upload"
import { InsightsDisplay } from "@/components/insights-display"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BarChart3, Upload } from "lucide-react"
import { RefreshInsights } from "@/components/refresh-insights"
import { GenerateInsightsButton } from "@/components/generate-insights-button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Salesforce Insights Dashboard</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your Salesforce opportunity data and get AI-powered insights automatically generated and displayed
            from Google Sheets.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Upload Section */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Upload CSV Data
              </CardTitle>
              <CardDescription>
                Upload your Salesforce opportunity data in CSV format. The file will be processed and sent to Google
                Sheets for analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload />
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Overview of your recent uploads and insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Upload</span>
                <span className="font-medium">2 hours ago</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Records</span>
                <span className="font-medium">1,247</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Insights Generated</span>
                <span className="font-medium">15 minutes ago</span>
              </div>
              <Separator />
              <div className="pt-2">
                <GenerateInsightsButton />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights Section */}
        <div className="mt-8">
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    Latest Insights
                  </CardTitle>
                  <CardDescription>
                    AI-generated insights from your Salesforce data, automatically updated from Google Sheets.
                  </CardDescription>
                </div>
                <RefreshInsights />
              </div>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<InsightsLoading />}>
                <InsightsDisplay />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function InsightsLoading() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded animate-pulse w-full" />
            <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-100 rounded animate-pulse w-5/6" />
          </div>
        </div>
      ))}
    </div>
  )
}
