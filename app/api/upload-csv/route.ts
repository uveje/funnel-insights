import { type NextRequest, NextResponse } from "next/server"
import { uploadToRawUploadTab, parseCSV } from "@/lib/google-sheets"

export async function POST(request: NextRequest) {
  console.log("=== CSV Upload Request Started ===")

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    console.log("File received:", {
      name: file?.name,
      size: file?.size,
      type: file?.type,
    })

    if (!file) {
      console.error("No file provided in request")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.name.endsWith(".csv")) {
      console.error("Invalid file type:", file.name)
      return NextResponse.json({ error: "Only CSV files are allowed" }, { status: 400 })
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      console.error("File too large:", file.size)
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    // Read and parse CSV content
    console.log("Reading file content...")
    const fileContent = await file.text()
    console.log("File content length:", fileContent.length)
    console.log("First 200 chars:", fileContent.substring(0, 200))

    console.log("Parsing CSV...")
    const csvData = parseCSV(fileContent)
    console.log("Parsed CSV rows:", csvData.length)
    console.log("Headers:", csvData[0])

    if (csvData.length === 0) {
      console.error("CSV file appears to be empty")
      return NextResponse.json({ error: "CSV file appears to be empty" }, { status: 400 })
    }

    // Check environment variables
    console.log("Checking environment variables...")
    console.log("GOOGLE_SHEETS_CLIENT_EMAIL:", process.env.GOOGLE_SHEETS_CLIENT_EMAIL ? "Set" : "Missing")
    console.log("GOOGLE_SHEETS_PRIVATE_KEY:", process.env.GOOGLE_SHEETS_PRIVATE_KEY ? "Set" : "Missing")
    console.log("GOOGLE_SPREADSHEET_ID:", process.env.GOOGLE_SPREADSHEET_ID ? "Set" : "Missing")

    // Upload to Google Sheets
    console.log("Uploading to Google Sheets...")
    const result = await uploadToRawUploadTab(csvData)
    console.log("Upload result:", result)

    console.log("=== Upload Successful ===")
    return NextResponse.json({
      success: true,
      message: "File uploaded successfully to Google Sheets",
      fileName: file.name,
      size: file.size,
      rowCount: result.rowCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("=== Upload Error ===")
    console.error("Error details:", error)
    console.error("Error message:", error instanceof Error ? error.message : "Unknown error")
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to upload file",
        details: "Check server logs for more information",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
