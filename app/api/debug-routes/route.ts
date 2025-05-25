import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "API Routes Debug",
    availableRoutes: [
      "GET /api/debug-routes - This endpoint",
      "POST /api/upload-csv - Upload CSV files",
      "GET /api/test-auth - Test Google Sheets authentication",
      "GET /api/insights - Fetch insights from Google Sheets",
      "POST /api/generate-insights - Generate insights from uploaded data",
      "GET /api/test-insights - Test insights fetching",
    ],
    timestamp: new Date().toISOString(),
  })
}
