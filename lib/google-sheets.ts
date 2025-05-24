import { GoogleSpreadsheet } from "google-spreadsheet"
import { JWT } from "google-auth-library"

// Initialize Google Sheets client
export async function getGoogleSheetsClient() {
  console.log("Initializing Google Sheets client...")

  try {
    // Validate environment variables
    if (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL) {
      throw new Error("GOOGLE_SHEETS_CLIENT_EMAIL environment variable is missing")
    }

    if (!process.env.GOOGLE_SHEETS_PRIVATE_KEY) {
      throw new Error("GOOGLE_SHEETS_PRIVATE_KEY environment variable is missing")
    }

    if (!process.env.GOOGLE_SPREADSHEET_ID) {
      throw new Error("GOOGLE_SPREADSHEET_ID environment variable is missing")
    }

    console.log("Creating JWT auth...")
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    console.log("Creating GoogleSpreadsheet instance...")
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID!, serviceAccountAuth)

    console.log("Loading spreadsheet info...")
    await doc.loadInfo()

    console.log("Spreadsheet loaded successfully:", doc.title)
    return doc
  } catch (error) {
    console.error("Failed to initialize Google Sheets client:", error)
    throw error
  }
}

// Upload CSV data to Raw_Upload tab
export async function uploadToRawUploadTab(csvData: string[][]) {
  console.log("Starting upload to Raw_Upload tab...")

  try {
    const doc = await getGoogleSheetsClient()
    console.log("Available sheets:", Object.keys(doc.sheetsByTitle))

    // Get or create the Raw_Upload sheet
    let sheet = doc.sheetsByTitle["Raw_Upload"]
    if (!sheet) {
      console.log("Raw_Upload sheet not found, creating it...")
      sheet = await doc.addSheet({ title: "Raw_Upload" })
      console.log("Raw_Upload sheet created successfully")
    } else {
      console.log("Raw_Upload sheet found")
    }

    // Clear existing data
    console.log("Clearing existing data...")
    await sheet.clear()

    // Add headers first
    if (csvData.length > 0) {
      console.log("Setting headers:", csvData[0])
      await sheet.setHeaderRow(csvData[0])

      if (csvData.length > 1) {
        console.log("Adding data rows...")
        const dataRows = csvData.slice(1).map((row) => {
          const rowObject: { [key: string]: string } = {}
          csvData[0].forEach((header, index) => {
            rowObject[header] = row[index] || ""
          })
          return rowObject
        })

        console.log("Adding", dataRows.length, "rows to sheet...")
        await sheet.addRows(dataRows)
        console.log("Data rows added successfully")
      }
    }

    const result = { success: true, rowCount: csvData.length - 1 }
    console.log("Upload completed:", result)
    return result
  } catch (error) {
    console.error("Error uploading to Google Sheets:", error)
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace",
    })
    throw new Error(
      `Failed to upload data to Google Sheets: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}

// Fetch insights from Insights tab
export async function getInsightsFromSheet() {
  try {
    const doc = await getGoogleSheetsClient()

    // Get the Insights sheet
    const sheet = doc.sheetsByTitle["Insights"]
    if (!sheet) {
      console.log("Insights sheet not found, returning default insights")
      return getDefaultInsights()
    }

    const rows = await sheet.getRows()

    if (rows.length === 0) {
      console.log("Insights sheet is empty, returning default insights")
      return getDefaultInsights()
    }

    // Parse insights from sheet structure
    // Expected format: Category | Insight | Priority
    const insights: { [key: string]: string[] } = {}

    rows.forEach((row) => {
      const category = row.get("Category") || "general"
      const insight = row.get("Insight")
      const priority = row.get("Priority") || "medium"

      if (insight) {
        if (!insights[category.toLowerCase()]) {
          insights[category.toLowerCase()] = []
        }
        insights[category.toLowerCase()].push(insight)
      }
    })

    return {
      lastUpdated: new Date().toISOString(),
      insights: {
        volume: insights.volume || [],
        winRate: insights.winrate || insights["win rate"] || [],
        conversionRates: insights.conversion || insights["conversion rates"] || [],
        performance: insights.performance || [],
        trends: insights.trends || [],
        ...insights,
      },
    }
  } catch (error) {
    console.error("Error fetching insights from Google Sheets:", error)
    return getDefaultInsights()
  }
}

// Default insights when sheet is empty or unavailable
function getDefaultInsights() {
  return {
    lastUpdated: new Date().toISOString(),
    insights: {
      volume: [
        "Upload your first CSV file to see volume insights",
        "Pipeline analysis will appear here after data processing",
      ],
      winRate: [
        "Win rate analysis will be generated from your Salesforce data",
        "Upload opportunity data to see conversion metrics",
      ],
      conversionRates: [
        "Conversion rate insights will appear after data upload",
        "Lead-to-opportunity metrics will be calculated automatically",
      ],
      performance: ["Performance highlights will be generated from your data", "Top performer analysis coming soon"],
      trends: [
        "Trend analysis will appear after sufficient data is uploaded",
        "Historical comparisons will be available with multiple uploads",
      ],
    },
  }
}

// Utility function to parse CSV content
export function parseCSV(csvContent: string): string[][] {
  const lines = csvContent.split("\n").filter((line) => line.trim())
  return lines.map((line) => {
    // Simple CSV parsing - for production, consider using a proper CSV parser
    const result: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        result.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }

    result.push(current.trim())
    return result
  })
}
