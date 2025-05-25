import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { GenerateInsightsButton } from "@/components/generate-insights-button"

export default function Home() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Stats</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Existing content here */}
        <Separator />
        <div className="pt-2">
          <GenerateInsightsButton />
        </div>
      </CardContent>
    </Card>
  )
}
