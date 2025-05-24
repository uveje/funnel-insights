import { getSheetsClient } from './sheets-auth.js';

export default async function handler(req, res) {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = '1FouNaJnUh_h5LsdBiCn1xQ0j1dB_keOSMTby9luu5Rc'; // Your Google Sheet ID
    const range = 'Insights!A1:A'; // Adjust as needed

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      res.status(404).json({ message: 'No insights data found.' });
      return;
    }

    // Flatten the array of arrays into a string
    const insightsText = rows.map(row => row[0]).join('\n');

    res.status(200).json({ insights: insightsText });
  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(500).json({ error: error.message });
  }
}
