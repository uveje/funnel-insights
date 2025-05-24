import { NextResponse } from "next/server"
import { getGoogleSheetsClient } from "@/lib/google-sheets"

export async function GET() {
  try {
    console.log("Testing Google Sheets authentication...")

    // Test the connection
    const doc = await getGoogleSheetsClient()

    return NextResponse.json({
      success: true,
      message: "Google Sheets authentication successful",
      spreadsheetTitle: doc.title,
      spreadsheetId: doc.spreadsheetId,
      sheetCount: doc.sheetCount,
      sheets: Object.keys(doc.sheetsByTitle),
    })
  } catch (error) {
    console.error("Authentication test failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Authentication failed",
        details: "Check your environment variables and Google Sheets setup",
      },
      { status: 500 },
    )
  }
}
