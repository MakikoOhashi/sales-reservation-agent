# Sales Reservation AI Agent

## Overview
This project is an AI-powered agent that helps users register sales reservations (売約) through a chat interface.

Instead of manually entering data into spreadsheets or ERP systems, users can describe their intent in natural language.  
The agent understands the request, asks follow-up questions if information is missing, and automatically registers the reservation into Google Sheets.

This project was built as part of the **AI Agents Assemble Hackathon** by WeMakeDevs.

---

## What this agent does
- Accepts natural language instructions via chat
- Extracts required fields for a sales reservation
- Asks follow-up questions when information is missing
- Converts the request into structured JSON
- Writes the data directly to Google Sheets
- Runs background checks (e.g. negative inventory detection) using Kestra

---

## Agent Flow
1. User sends a request (e.g. “Register a reservation for Company A, 100 units next week”)
2. LLM analyzes the intent and required fields
3. Missing information is requested from the user
4. Once confirmed, the agent generates structured data
5. The data is written to Google Sheets
6. Kestra runs scheduled or conditional workflows (e.g. inventory checks)

---

## Tech Stack
- **Cline** – AI-assisted development and code generation
- **Next.js** – Frontend and API routes
- **Google Sheets API** – Data storage and integration
- **Gemini** – LLM for reasoning and intent extraction
- **Kestra** – Workflow orchestration and background jobs
- **Vercel** – Deployment

---

## Why this is an AI Agent
This project goes beyond a simple chatbot.
The agent:
- Makes decisions based on user intent
- Requests missing information autonomously
- Executes real-world actions via external tools
- Operates asynchronously through workflow automation

---

## Getting Started
```bash
git clone <repo-url>
cd <repo-name>
npm install
npm run dev
```

## API Endpoints

### Chat Interface
- **URL**: `/chat`
- **Method**: GET
- **Description**: Simple chat UI for user interaction

### Register Data
- **URL**: `/api/register`
- **Method**: POST
- **Content-Type**: `application/json`
- **Description**: Receives JSON data and stores it in Google Sheets
- **Request Body Example**:
  ```json
  {
    "name": "Customer Name",
    "email": "customer@example.com",
    "message": "Sales reservation request",
    "quantity": 100,
    "product": "Product A"
  }
  ```
- **Response Example (Success)**:
  ```json
  {
    "success": true,
    "message": "Data received and stored successfully",
    "data": {
      "name": "Customer Name",
      "email": "customer@example.com",
      "message": "Sales reservation request",
      "quantity": 100,
      "product": "Product A"
    }
  }
  ```
- **Response Example (Error)**:
  ```json
  {
    "success": false,
    "message": "Failed to write to Google Sheets",
    "error": "Authentication error",
    "data": {
      "name": "Customer Name",
      "email": "customer@example.com",
      "message": "Sales reservation request",
      "quantity": 100,
      "product": "Product A"
    }
  }
  ```

## Google Sheets Integration

The application integrates with Google Sheets for data storage. To enable this functionality:

1. **Set up Google Cloud Project**:
   - Create a project in Google Cloud Console
   - Enable Google Sheets API
   - Create service account credentials

2. **Environment Variables**:
   ```bash
   GOOGLE_SHEETS_ID=your-spreadsheet-id
   GOOGLE_SHEETS_NAME=Sheet1
   GOOGLE_CLIENT_EMAIL=your-service-account-email
   GOOGLE_PRIVATE_KEY="your-private-key"
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=your-redirect-uri
   GOOGLE_ACCESS_TOKEN=your-access-token
   GOOGLE_REFRESH_TOKEN=your-refresh-token
   ```

3. **Spreadsheet Setup**:
   - Create a Google Sheet
   - Share it with your service account email
   - Note the spreadsheet ID from the URL

## Project Structure

```
src/
├── app/
│   ├── chat/
│   │   └── page.tsx          # Chat UI
│   ├── api/
│   │   └── register/
│   │       └── route.ts      # API endpoint
│   └── ... (existing files)
└── lib/
    └── utils/
        └── googleSheets.ts   # Google Sheets integration
```

## Testing

To test the implementation:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Access the chat interface:
   ```
   http://localhost:3000/chat
   ```

3. Test the API endpoint:
   ```bash
   curl -X POST -H "Content-Type: application/json" \
   -d '{"name":"Test User","email":"test@example.com","message":"Test message"}' \
   http://localhost:3000/api/register
   ```

---
## **Deployment**

The application is deployed on Vercel.


---
## **Future Improvements**

Voice input support

ERP system integration

Role-based approval flow

Advanced inventory optimization logic

Add auto-incrementing reservation IDs for each sales entry

Enable sequential tracking for easier reference and reporting


---
## **Hackathon Notes**

This project prioritizes real-world usability and minimal, reproducible agent behavior.
The focus is on completing a functional AI agent rather than maximizing feature count.
