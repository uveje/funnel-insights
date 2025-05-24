import { NextResponse } from "next/server"
import { getInsightsFromSheet } from "@/lib/google-sheets"

export async function GET() {
  try {
    const insights = await getInsightsFromSheet()

    return NextResponse.json(insights, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Error fetching insights:", error)
    return NextResponse.json({ error: "Failed to fetch insights from Google Sheets" }, { status: 500 })
  }
}
