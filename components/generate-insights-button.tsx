"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function GenerateInsightsButton() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [message, setMessage] = useState<string>("")
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setMessage("")
    setIsSuccess(null)

    try {
      const response = await fetch("/api/generate-insights", {
        method: "POST",
      })

      const result = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        setMessage(`Generated ${result.insightCount} insights successfully!`)
        // Refresh the page to show new insights
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setIsSuccess(false)
        setMessage(result.error || "Failed to generate insights")
      }
    } catch (error) {
      setIsSuccess(false)
      setMessage("Network error - please try again")
      console.error("Generate insights error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleGenerate} disabled={isGenerating} className="flex items-center gap-2">
        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {isGenerating ? "Generating Insights..." : "Generate Insights"}
      </Button>

      {message && (
        <Alert variant={isSuccess ? "default" : "destructive"}>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
