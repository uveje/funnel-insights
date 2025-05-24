import { getSheetsClient } from '../sheets-auth.js';
import formidable from 'formidable';
import fs from 'fs';
import csv from 'csv-parser';

// Disable default body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ error: 'Form parsing error' });
    }

    const file = files.file; // Adjust if your field name differs
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const rows = [];

    fs.createReadStream(file[0].filepath)
      .pipe(csv())
      .on('data', (data) => {
        rows.push(Object.values(data)); // Push row as array
      })
      .on('end', async () => {
        try {
          const sheets = await getSheetsClient();
          const spreadsheetId = '1FouNaJnUh_h5LsdBiCn1xQ0j1dB_keOSMTby9luu5Rc'; // Your Google Sheet ID

          const response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Raw_Upload!A1',
            valueInputOption: 'RAW',
            resource: { values: rows },
          });

          console.log('Data appended:', response.data.updates);
          res.status(200).json({ message: 'Data uploaded successfully', updates: response.data.updates });
        } catch (err) {
          console.error('Google Sheets error:', err);
          res.status(500).json({ error: 'Failed to upload data to Google Sheets' });
        }
      });
  });
}
