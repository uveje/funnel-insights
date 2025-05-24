# Funnel Insights

A modern Salesforce opportunity data analysis dashboard that automatically uploads CSV files to Google Sheets and displays AI-generated insights.

## Features

- 📊 **CSV Upload**: Drag & drop Salesforce opportunity data
- 📈 **Google Sheets Integration**: Automatic data sync to `Salesforce_Uploads` spreadsheet
- 🤖 **AI Insights**: Automated analysis and insights generation
- 📱 **Responsive Design**: Works on desktop and mobile
- 🔄 **Real-time Updates**: Automatic refresh when insights are updated

## Setup Instructions

### 1. Google Sheets Setup

1. Create a new Google Spreadsheet named `Salesforce_Uploads`
2. Create two tabs:
   - `Raw_Upload` (for uploaded CSV data)
   - `Insights` (for generated insights)

### 2. Google Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Sheets API
4. Create a Service Account:
   - Go to IAM & Admin > Service Accounts
   - Click "Create Service Account"
   - Download the JSON key file
5. Share your Google Spreadsheet with the service account email

### 3. Environment Variables

Set these environment variables in Vercel:

\`\`\`
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id-from-url
\`\`\`

### 4. Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add the environment variables
4. Deploy!

## Usage

1. **Upload CSV**: Drag and drop your Salesforce opportunity CSV file
2. **Data Processing**: File is automatically uploaded to Google Sheets `Raw_Upload` tab
3. **Generate Insights**: External system (like Cursor) processes the data and populates the `Insights` tab
4. **View Results**: Insights are automatically displayed in the dashboard

## Insights Format

The `Insights` tab should have these columns:
- `Category`: Type of insight (volume, winrate, conversion, performance, trends)
- `Insight`: The actual insight text
- `Priority`: Optional priority level

## Development

\`\`\`bash
npm install
npm run dev
\`\`\`

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Integration**: Google Sheets API
- **Deployment**: Vercel
\`\`\`
