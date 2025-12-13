import { google } from 'googleapis';

interface GoogleSheetsConfig {
  spreadsheetId: string;
  sheetName: string;
  credentials: {
    client_email: string;
    private_key: string;
  };
}

export class GoogleSheetsService {
  private sheets: any;
  private config: GoogleSheetsConfig;

  constructor(config: GoogleSheetsConfig) {
    this.config = config;
    this.sheets = google.sheets('v4');
  }

  private async getAuthClient() {
    const auth = new google.auth.JWT({
      email: this.config.credentials.client_email,
      key: this.config.credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    return auth;
  }

  public async appendData(data: Record<string, any>) {
    try {
      const auth = await this.getAuthClient();

      // Convert data object to array format for Google Sheets
      const values = Object.values(data);

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.config.spreadsheetId,
        range: `${this.config.sheetName}!A:Z`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [values]
        },
        auth: auth
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error writing to Google Sheets:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
