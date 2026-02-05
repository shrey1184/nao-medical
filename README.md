# Healthcare Doctor-Patient Translation Web Application

A minimal but production-ready MVP for real-time translation between doctors and patients during medical consultations.

## 🏗️ Architecture Overview

```
nao-medical/
├── backend/                 # FastAPI + Prisma + PostgreSQL
│   ├── app/
│   │   ├── main.py          # FastAPI routes & app setup
│   │   ├── config.py        # Environment configuration
│   │   ├── database.py      # Prisma client setup
│   │   ├── gemini.py        # AI translation & summary functions
│   │   └── schemas.py       # Pydantic request/response models
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment template
│
└── frontend/
    └── vite-project/        # React + Vite + Tailwind CSS
        ├── src/
        │   ├── components/  # UI Components
        │   │   ├── RoleSelector.jsx
        │   │   ├── ChatUI.jsx
        │   │   ├── MessageInput.jsx
        │   │   ├── MessageBubble.jsx
        │   │   ├── SummaryPanel.jsx
        │   │   └── SearchPanel.jsx
        │   ├── hooks/
        │   │   └── useMessagePolling.js
        │   ├── services/
        │   │   └── api.js
        │   └── App.jsx
        └── .env.example
```

## ✨ Features

- **Role-based Chat**: Separate views for Doctor and Patient
- **Language Selection**: 12 supported languages for translation
- **Real-time Translation**: Messages translated instantly via Gemini AI
- **Persistent Conversations**: All messages stored in PostgreSQL
- **Keyword Search**: Search through conversation history
- **AI Summaries**: Generate consultation summaries with one click

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL 14+
- Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb healthcare_translation

# Or using psql
psql -U postgres -c "CREATE DATABASE healthcare_translation;"
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your DATABASE_URL and GEMINI_API_KEY

# Generate Prisma client
prisma generate

# Run database migrations
prisma db push

# Start the server
uvicorn app.main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

### 3. Frontend Setup

```bash
cd frontend/vite-project

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start development server
npm run dev
```

Frontend runs at: http://localhost:5173

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/languages` | List supported languages |
| POST | `/conversation` | Create new conversation |
| GET | `/conversation/{id}` | Get conversation details |
| POST | `/message` | Send a message (auto-translated) |
| GET | `/messages/{conversationId}` | Get messages (supports polling) |
| GET | `/search?q={query}` | Search messages by keyword |
| POST | `/summary` | Generate AI summary |
| POST | `/audio/upload` | Audio upload (STUB) |

### Example API Usage

```bash
# Create a conversation
curl -X POST http://localhost:8000/conversation \
  -H "Content-Type: application/json" \
  -d '{"doctorLanguage": "en", "patientLanguage": "es"}'

# Send a message
curl -X POST http://localhost:8000/message \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "uuid-here", "role": "doctor", "text": "How are you feeling today?"}'

# Get messages (with polling support)
curl "http://localhost:8000/messages/uuid-here?after=last-message-id"

# Generate summary
curl -X POST http://localhost:8000/summary \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "uuid-here"}'
```

## 🔧 Configuration

### Backend (.env)

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/healthcare_translation
GEMINI_API_KEY=your_api_key
DEBUG=true
CORS_ORIGINS=["http://localhost:5173"]
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
```

## 🎨 Supported Languages

| Code | Language |
|------|----------|
| en | English |
| es | Spanish |
| fr | French |
| de | German |
| zh | Chinese (Simplified) |
| hi | Hindi |
| ar | Arabic |
| pt | Portuguese |
| ru | Russian |
| ja | Japanese |
| ko | Korean |
| vi | Vietnamese |

## 📝 Trade-offs & Design Decisions

### MVP Scope Decisions

1. **Polling vs WebSockets**: Using polling (2-second interval) for simplicity. WebSockets would provide better real-time experience but adds complexity.

2. **Simple Keyword Search**: Using PostgreSQL LIKE queries. For production, use full-text search (ts_vector) or Elasticsearch.

3. **No Authentication**: Out of scope for MVP. In production, add JWT-based auth with role verification.

4. **Audio Stub**: Speech-to-text not implemented. Endpoint exists for future integration with Google Speech-to-Text or Whisper.

5. **Gemini for Translation**: Using Gemini instead of dedicated translation API (Google Translate) for unified AI provider and medical context awareness.

### Production Recommendations

- [ ] Add authentication (Auth0, Clerk, or custom JWT)
- [ ] Implement WebSocket for real-time messaging
- [ ] Add rate limiting for API endpoints
- [ ] Use connection pooling (PgBouncer) for database
- [ ] Add proper logging (structured logs with correlation IDs)
- [ ] Implement health checks for all dependencies
- [ ] Add input sanitization for medical data compliance
- [ ] Set up HIPAA-compliant infrastructure
- [ ] Add message encryption at rest

## 🧪 Testing

```bash
# Backend - Run with pytest
cd backend
pytest

# Frontend - Run with vitest
cd frontend/vite-project
npm run test
```

## 🚢 Deployment

### Docker (Recommended)

```dockerfile
# See Dockerfile examples in each directory
docker-compose up -d
```

### Manual Deployment

1. **Backend**: Deploy to Railway, Render, or AWS ECS
2. **Frontend**: Deploy to Vercel, Netlify, or CloudFlare Pages
3. **Database**: Use managed PostgreSQL (Supabase, Neon, AWS RDS)

## 📄 License

MIT License - See LICENSE file

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with ❤️ for better healthcare communication
# nao-medical
