import { getSheetsClient } from '../sheets-auth.js';

export default async function handler(req, res) {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = '1FouNaJnUh_h5LsdBiCn1xQ0j1dB_keOSMTby9luu5Rc'; // Your Google Sheet ID

    // 1. Read data from Raw_Upload
    const rawData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Raw_Upload!A2:H', // Skip header row
    });

    const rows = rawData.data.values || [];

    if (rows.length === 0) {
      return res.status(400).json({ message: 'No data found in Raw_Upload' });
    }

    // 2. Calculate basic insights (example)
    const total = rows.length;
    const winCount = rows.filter(r => r[3] === 'Closed Won').length;
    const winRate = (winCount / total) * 100;

    const insights = [
      `Total opportunities: ${total}`,
      `Closed Won: ${winCount}`,
      `Win Rate: ${winRate.toFixed(2)}%`
    ];

    // 3. Write insights to Insights tab
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Insights!A1',
      valueInputOption: 'RAW',
      resource: { values: insights.map(i => [i]) }
    });

    res.status(200).json({ message: 'Insights generated successfully!', insights });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
