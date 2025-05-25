import { NextResponse } from "next/server"
import { getInsightsFromSheet } from "@/lib/google-sheets"

export async function GET() {
  try {
    console.log("Testing insights fetch...")

    const insights = await getInsightsFromSheet()

    return NextResponse.json({
      success: true,
      message: "Insights fetched successfully",
      data: insights,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error testing insights:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch insights",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
