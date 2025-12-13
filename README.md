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
---
## **Deployment**

The application is deployed on Vercel.


---
## **Future Improvements**

Voice input support

ERP system integration

Role-based approval flow

Advanced inventory optimization logic

---
## **Hackathon Notes**

This project prioritizes real-world usability and minimal, reproducible agent behavior.
The focus is on completing a functional AI agent rather than maximizing feature count.
