# Backend - Spur AI Chat Agent

This is the backend server for the AI Live Chat Support Agent.

## Tech Stack
- Node.js + TypeScript
- Express.js
- MySQL
- Google Gemini AI

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create MySQL database:
- Make sure MySQL is running on your machine
- The database will be auto-created when you start the server

3. Configure environment variables:
- Copy `.env.example` to `.env`
- Add your Google API key
- Configure MySQL credentials

4. Run the server:
```bash
npm run dev
```

## API Endpoints

### POST /chat/message
Send a message and get AI reply.

Request:
```json
{
  "message": "What is your return policy?",
  "sessionId": "optional-session-id"
}
```

Response:
```json
{
  "reply": "AI response here...",
  "sessionId": "session-uuid"
}
```

### GET /chat/history/:sessionId
Get conversation history for a session.

Response:
```json
{
  "sessionId": "session-uuid",
  "messages": [
    {
      "id": "message-uuid",
      "sender": "user",
      "text": "Hello",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /health
Health check endpoint.
