import { NextResponse } from "next/server"
import { getGoogleSheetsClient } from "@/lib/google-sheets"

export async function POST() {
  try {
    console.log("=== Starting Insights Generation ===")

    const doc = await getGoogleSheetsClient()
    console.log("Connected to spreadsheet:", doc.title)

    // Get the Raw_Upload sheet
    const rawSheet = doc.sheetsByTitle["Raw_Upload"]
    if (!rawSheet) {
      return NextResponse.json({ error: "Raw_Upload sheet not found" }, { status: 400 })
    }

    // Get all rows from Raw_Upload
    const rows = await rawSheet.getRows()
    console.log("Found", rows.length, "rows in Raw_Upload")

    if (rows.length === 0) {
      return NextResponse.json({ error: "No data found in Raw_Upload sheet" }, { status: 400 })
    }

    // Analyze the data and generate insights
    const insights = generateInsightsFromData(rows)
    console.log("Generated insights:", insights)

    // Get or create the Insights sheet
    let insightsSheet = doc.sheetsByTitle["Insights"]
    if (!insightsSheet) {
      console.log("Creating Insights sheet...")
      insightsSheet = await doc.addSheet({ title: "Insights" })
      await insightsSheet.setHeaderRow(["Category", "Insight", "Priority"])
    } else {
      console.log("Clearing existing insights...")
      await insightsSheet.clear()
      await insightsSheet.setHeaderRow(["Category", "Insight", "Priority"])
    }

    // Prepare insights data for upload
    const insightRows = []
    for (const [category, categoryInsights] of Object.entries(insights)) {
      for (const insight of categoryInsights) {
        insightRows.push({
          Category: category,
          Insight: insight,
          Priority: "medium",
        })
      }
    }

    // Add insights to the sheet
    if (insightRows.length > 0) {
      await insightsSheet.addRows(insightRows)
      console.log("Added", insightRows.length, "insights to sheet")
    }

    return NextResponse.json({
      success: true,
      message: "Insights generated successfully",
      insightCount: insightRows.length,
      categories: Object.keys(insights),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("=== Insights Generation Error ===")
    console.error("Error details:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate insights",
        details: "Check server logs for more information",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// Helper function to generate insights from raw data
function generateInsightsFromData(rows: any[]): { [key: string]: string[] } {
  console.log("Analyzing data for insights...")

  const insights: { [key: string]: string[] } = {
    volume: [],
    winrate: [],
    conversion: [],
    performance: [],
    trends: [],
  }

  try {
    const totalOpportunities = rows.length

    // Get all available columns from the first row
    const headers = rows[0]._sheet.headerValues || []
    console.log("Available columns:", headers)

    // Try to find common Salesforce fields (case-insensitive)
    const findColumn = (possibleNames: string[]) => {
      return headers.find((header) => possibleNames.some((name) => header.toLowerCase().includes(name.toLowerCase())))
    }

    const stageColumn = findColumn(["stage", "status", "opportunity_stage"])
    const amountColumn = findColumn(["amount", "value", "deal_size", "opportunity_amount"])
    const ownerColumn = findColumn(["owner", "rep", "sales_rep", "account_owner"])
    const dateColumn = findColumn(["date", "created", "close_date"])

    console.log("Detected columns:", { stageColumn, amountColumn, ownerColumn, dateColumn })

    // Volume insights
    insights.volume.push(`Total opportunities analyzed: ${totalOpportunities}`)

    if (stageColumn) {
      const stages = rows.map((row) => row.get(stageColumn)).filter(Boolean)
      const stageCount = stages.reduce(
        (acc, stage) => {
          acc[stage] = (acc[stage] || 0) + 1
          return acc
        },
        {} as { [key: string]: number },
      )

      const topStage = Object.entries(stageCount).sort(([, a], [, b]) => b - a)[0]
      if (topStage) {
        insights.volume.push(`Most common stage: ${topStage[0]} (${topStage[1]} opportunities)`)
      }
    }

    // Win rate analysis
    if (stageColumn) {
      const stages = rows.map((row) => row.get(stageColumn)).filter(Boolean)
      const wonDeals = stages.filter(
        (stage) => stage.toLowerCase().includes("won") || stage.toLowerCase().includes("closed won"),
      ).length

      const lostDeals = stages.filter(
        (stage) => stage.toLowerCase().includes("lost") || stage.toLowerCase().includes("closed lost"),
      ).length

      const closedDeals = wonDeals + lostDeals

      if (closedDeals > 0) {
        const winRate = ((wonDeals / closedDeals) * 100).toFixed(1)
        insights.winrate.push(`Overall win rate: ${winRate}% (${wonDeals} won out of ${closedDeals} closed)`)
        insights.winrate.push(`${wonDeals} opportunities won, ${lostDeals} opportunities lost`)
      } else {
        insights.winrate.push(`${stages.length} opportunities in pipeline, no closed deals yet`)
      }
    }

    // Amount/Performance analysis
    if (amountColumn) {
      const amounts = rows
        .map((row) => {
          const amount = row.get(amountColumn)
          return Number.parseFloat(String(amount).replace(/[,$]/g, "")) || 0
        })
        .filter((amount) => amount > 0)

      if (amounts.length > 0) {
        const totalValue = amounts.reduce((sum, amount) => sum + amount, 0)
        const avgDealSize = totalValue / amounts.length
        const maxDeal = Math.max(...amounts)

        insights.performance.push(`Total pipeline value: $${totalValue.toLocaleString()}`)
        insights.performance.push(`Average deal size: $${avgDealSize.toLocaleString()}`)
        insights.performance.push(`Largest opportunity: $${maxDeal.toLocaleString()}`)
      }
    }

    // Owner/Rep analysis
    if (ownerColumn) {
      const owners = rows.map((row) => row.get(ownerColumn)).filter(Boolean)
      const ownerCount = owners.reduce(
        (acc, owner) => {
          acc[owner] = (acc[owner] || 0) + 1
          return acc
        },
        {} as { [key: string]: number },
      )

      const topRep = Object.entries(ownerCount).sort(([, a], [, b]) => b - a)[0]
      if (topRep) {
        insights.performance.push(`Top performer: ${topRep[0]} with ${topRep[1]} opportunities`)
      }

      insights.conversion.push(`${Object.keys(ownerCount).length} sales reps managing opportunities`)
    }

    // Trends and additional insights
    insights.trends.push(`Data last updated: ${new Date().toLocaleDateString()}`)
    insights.trends.push(`Analysis based on ${totalOpportunities} opportunity records`)

    if (totalOpportunities > 50) {
      insights.trends.push("Sufficient data volume for reliable trend analysis")
    } else {
      insights.trends.push("Consider uploading more historical data for better trend insights")
    }

    // Conversion insights
    insights.conversion.push(`${totalOpportunities} total opportunities in dataset`)
    if (stageColumn) {
      const activeOpps = rows.filter((row) => {
        const stage = row.get(stageColumn)
        return stage && !stage.toLowerCase().includes("closed") && !stage.toLowerCase().includes("lost")
      }).length
      insights.conversion.push(`${activeOpps} opportunities still active in pipeline`)
    }
  } catch (error) {
    console.error("Error analyzing data:", error)
    insights.volume.push("Error analyzing volume data - check data format")
    insights.winrate.push("Error calculating win rates - check stage column")
    insights.performance.push("Error analyzing performance - check amount column")
  }

  return insights
}
