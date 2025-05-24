import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  keyFile: './dark-geography-312814-2ec36ed23aaf.json', // Make sure the file is in this folder
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export async function getSheetsClient() {
  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient });
  return sheets;
}
