import { getSheetsClient } from './sheets-auth.js';

async function main() {
  try {
    const sheets = await getSheetsClient();

    const spreadsheetId = '1FouNaJnUh_h5LsdBiCn1xQ0j1dB_keOSMTby9luu5Rc'; // Replace with your actual Google Sheet ID (from the URL)
    const range = 'Insights!A1:A'; // Adjust range if needed

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    console.log('Insights Data:', rows);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
