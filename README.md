# Spur AI Live Chat Support Agent

A mini AI support agent for a live chat widget built as a take-home assignment.

## Project Overview

This project implements a simple customer support chat where an AI agent (powered by Google Gemini) answers user questions about a fictional e-commerce store called "TechGadgets Store".

## Tech Stack

- **Backend:** Node.js + TypeScript + Express
- **Frontend:** React
- **Database:** MySQL
- **AI:** Google Gemini API

## Features

### Chat UI
- ✅ Scrollable message list
- ✅ Clear distinction between user and AI messages
- ✅ Input box with send button (Enter to send)
- ✅ Auto-scroll to latest message
- ✅ Disabled send button while request in flight
- ✅ "Agent is typing…" indicator

### Backend
- ✅ POST /chat/message endpoint
- ✅ GET /chat/history/:sessionId endpoint
- ✅ Persists all messages to MySQL database
- ✅ Associates messages with sessions/conversations
- ✅ Real LLM API integration (Google Gemini)

### AI Integration
- ✅ Google Gemini API integration
- ✅ Conversation history for contextual replies
- ✅ Error handling for API failures
- ✅ Max token limits for cost control

### FAQ Knowledge
The AI is seeded with knowledge about:
- Shipping policy
- Return/refund policy
- Support hours
- Payment methods
- Popular products
- Contact information

### Robustness
- ✅ Input validation (empty messages, length limits)
- ✅ Graceful error handling
- ✅ No hardcoded secrets (uses .env)
- ✅ Clean error messages to users

## Project Structure

```
assessment/
├── backend/
│   ├── src/
│   │   ├── database/
│   │   │   ├── connection.ts    # MySQL connection pool
│   │   │   └── init.ts          # Database initialization
│   │   ├── data/
│   │   │   └── storeKnowledge.ts # FAQ/store information
│   │   ├── routes/
│   │   │   └── chatRoutes.ts    # API routes
│   │   ├── services/
│   │   │   ├── chatService.ts   # Database operations
│   │   │   └── llmService.ts    # Gemini AI integration
│   │   └── index.ts             # Express server
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js               # Main chat component
│   │   ├── App.css              # Chat styles
│   │   ├── index.js             # React entry point
│   │   └── index.css            # Global styles
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MySQL (running locally)
- Google API Key for Gemini

### 1. Clone and Navigate
```bash
cd assessment
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit .env file and add your MySQL credentials

# Start the server
npm run dev
```

The backend will:
- Auto-create the database if it doesn't exist
- Create required tables (conversations, messages)
- Start on http://localhost:3001

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will start on http://localhost:3000

### 4. Using the App

1. Open http://localhost:3000 in your browser
2. Start chatting with the AI support agent!
3. Try asking questions like:
   - "What's your return policy?"
   - "Do you ship to USA?"
   - "What are your support hours?"
   - "What products do you sell?"

## API Documentation

### POST /chat/message
Send a message and receive AI reply.

**Request:**
```json
{
  "message": "What's your return policy?",
  "sessionId": "optional-uuid"
}
```

**Response:**
```json
{
  "reply": "We have a 30-day return policy...",
  "sessionId": "uuid-of-conversation"
}
```

### GET /chat/history/:sessionId
Get conversation history.

**Response:**
```json
{
  "sessionId": "uuid",
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

## Error Handling

The app handles various error scenarios:
- Empty messages: Returns 400 error
- Very long messages: Truncated or rejected
- API failures: Shows friendly error message
- Database errors: Logged and handled gracefully
- Network issues: Frontend displays error state

## Assumptions & Decisions

1. **Session Management:** Using localStorage for session persistence (no auth required)
2. **Message Length:** Limited to 2000 characters
3. **History Context:** Last 10 messages sent to LLM for context
4. **Max Tokens:** AI responses limited to 500 tokens for cost control
5. **Database:** MySQL chosen as specified by user

## Future Improvements

If I had more time, I would add:
- User authentication
- Redis caching for frequent queries
- Markdown rendering in chat
- File upload support
- Rate limiting
- Unit tests
- Docker setup

---

Built by Sparsh Bisen for Spur Take-Home Assignment
