"""
FastAPI Application Entry Point
Healthcare Doctor-Patient Translation API

Trade-offs made for MVP:
1. Polling instead of WebSockets for simplicity
2. Simple keyword search instead of full-text search
3. No authentication (documented as out of scope)
"""

from fastapi import FastAPI, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import Optional

from app.config import get_settings
from app.database import db, connect_db, disconnect_db
from app.gemini import translate_text, generate_summary, get_supported_languages
from app.schemas import (
    UserCreate, UserResponse, UsersListResponse,
    ConversationCreate, ConversationResponse,
    MessageCreate, MessageResponse, MessagesListResponse,
    SearchResponse, SearchResult,
    SummaryRequest, SummaryResponse,
    AudioUploadResponse,
    LanguagesResponse, LanguageOption,
)

settings = get_settings()

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="API for real-time doctor-patient translation with AI-powered features",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI
    redoc_url="/redoc",  # ReDoc
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============ Lifecycle Events ============

@app.on_event("startup")
async def startup():
    """Connect to database on app startup."""
    await connect_db()


@app.on_event("shutdown")
async def shutdown():
    """Disconnect from database on app shutdown."""
    await disconnect_db()


# ============ Health Check ============

@app.get("/health")
async def health_check():
    """Health check endpoint for deployment monitoring."""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


# ============ Language Endpoints ============

@app.get("/languages", response_model=LanguagesResponse)
async def get_languages():
    """Get list of supported languages for translation."""
    languages = get_supported_languages()
    return LanguagesResponse(
        languages=[
            LanguageOption(code=code, name=name) 
            for code, name in languages.items()
        ]
    )


# ============ User Endpoints ============

@app.post("/users", response_model=UserResponse)
async def create_user(data: UserCreate):
    """
    Create a new user (doctor or patient) with a unique ID.
    
    The unique ID is auto-generated in format: DOC### for doctors, PAT### for patients.
    """
    # Generate unique ID
    role_prefix = "DOC" if data.role == "doctor" else "PAT"
    
    # Count existing users of this role to generate next ID
    existing_users = await db.user.find_many(where={"role": data.role})
    next_number = len(existing_users) + 1
    unique_id = f"{role_prefix}{next_number:03d}"
    
    # Ensure uniqueness
    while await db.user.find_unique(where={"uniqueId": unique_id}):
        next_number += 1
        unique_id = f"{role_prefix}{next_number:03d}"
    
    user = await db.user.create(
        data={
            "name": data.name,
            "role": data.role,
            "uniqueId": unique_id,
            "language": data.language,
        }
    )
    
    return user


@app.get("/users", response_model=UsersListResponse)
async def get_users(role: Optional[str] = Query(None, pattern="^(doctor|patient)$")):
    """
    Get list of users. Optionally filter by role (doctor or patient).
    """
    where_clause = {"role": role} if role else {}
    users = await db.user.find_many(where=where_clause, order={"createdAt": "desc"})
    return UsersListResponse(users=users)


@app.get("/users/{unique_id}", response_model=UserResponse)
async def get_user_by_unique_id(unique_id: str):
    """Get user by their unique ID (e.g., DOC001, PAT123)."""
    user = await db.user.find_unique(where={"uniqueId": unique_id})
    
    if not user:
        raise HTTPException(404, f"User not found with ID: {unique_id}")
    
    return user


# ============ Conversation Endpoints ============

@app.post("/conversation", response_model=ConversationResponse)
async def create_conversation(data: ConversationCreate):
    """
    Create a new conversation session between a doctor and patient.
    
    This initializes a conversation with specified users and languages.
    All subsequent messages will be translated between these languages.
    """
    # Validate users exist
    doctor = await db.user.find_unique(where={"id": data.doctorId})
    if not doctor or doctor.role != "doctor":
        raise HTTPException(400, f"Invalid doctor ID: {data.doctorId}")
    
    patient = await db.user.find_unique(where={"id": data.patientId})
    if not patient or patient.role != "patient":
        raise HTTPException(400, f"Invalid patient ID: {data.patientId}")
    
    # Validate languages
    supported = get_supported_languages()
    if data.doctorLanguage not in supported:
        raise HTTPException(400, f"Unsupported doctor language: {data.doctorLanguage}")
    if data.patientLanguage not in supported:
        raise HTTPException(400, f"Unsupported patient language: {data.patientLanguage}")
    
    conversation = await db.conversation.create(
        data={
            "doctorId": data.doctorId,
            "patientId": data.patientId,
            "doctorLanguage": data.doctorLanguage,
            "patientLanguage": data.patientLanguage,
        }
    )
    
    return conversation


@app.get("/conversation/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(conversation_id: str):
    """Get conversation details by ID."""
    conversation = await db.conversation.find_unique(
        where={"id": conversation_id}
    )
    
    if not conversation:
        raise HTTPException(404, "Conversation not found")
    
    return conversation


# ============ Message Endpoints ============

@app.post("/message", response_model=MessageResponse)
async def send_message(data: MessageCreate):
    """
    Send a message in a conversation.
    
    The message is automatically translated from the sender's language
    to the recipient's language using Gemini AI.
    
    Trade-off: Synchronous translation for simplicity. 
    For production, consider background processing for long texts.
    """
    # Get conversation to determine languages
    conversation = await db.conversation.find_unique(
        where={"id": data.conversationId}
    )
    
    if not conversation:
        raise HTTPException(404, "Conversation not found")
    
    # Determine source and target languages based on role
    if data.role == "doctor":
        source_lang = conversation.doctorLanguage
        target_lang = conversation.patientLanguage
    else:  # patient
        source_lang = conversation.patientLanguage
        target_lang = conversation.doctorLanguage
    
    # Translate the message
    translated_text = await translate_text(data.text, source_lang, target_lang)
    
    # Save message to database
    message = await db.message.create(
        data={
            "conversationId": data.conversationId,
            "role": data.role,
            "originalText": data.text,
            "translatedText": translated_text,
            "sourceLanguage": source_lang,
            "targetLanguage": target_lang,
        }
    )
    
    return message


@app.get("/messages/{conversation_id}", response_model=MessagesListResponse)
async def get_messages(
    conversation_id: str,
    after: Optional[str] = Query(None, description="Get messages after this message ID (for polling)")
):
    """
    Get messages for a conversation.
    
    Supports polling by providing 'after' parameter with the last known message ID.
    Client should poll this endpoint every 1-2 seconds for near real-time updates.
    
    Trade-off: Polling instead of WebSockets for simplicity.
    For production, consider WebSockets or Server-Sent Events.
    """
    # Verify conversation exists
    conversation = await db.conversation.find_unique(
        where={"id": conversation_id}
    )
    
    if not conversation:
        raise HTTPException(404, "Conversation not found")
    
    # Build query conditions
    where_clause = {"conversationId": conversation_id}
    
    # If 'after' is provided, only get messages created after that message
    if after:
        reference_msg = await db.message.find_unique(where={"id": after})
        if reference_msg:
            where_clause["createdAt"] = {"gt": reference_msg.createdAt}
    
    # Fetch messages ordered by creation time
    messages = await db.message.find_many(
        where=where_clause,
        order={"createdAt": "asc"}
    )
    
    # Get last message ID for polling
    last_id = messages[-1].id if messages else None
    
    return MessagesListResponse(
        messages=messages,
        lastMessageId=last_id
    )


# ============ Search Endpoint ============

@app.get("/search", response_model=SearchResponse)
async def search_messages(
    q: str = Query(..., min_length=1, description="Search query"),
    conversation_id: Optional[str] = Query(None, description="Limit search to specific conversation")
):
    """
    Search messages by keyword.
    
    Searches both original and translated text.
    
    Trade-off: Simple LIKE query for MVP. For production, use:
    - PostgreSQL full-text search with ts_vector
    - Elasticsearch for advanced search features
    """
    # Build where clause
    # Using contains for case-insensitive search
    # Trade-off: OR queries with contains are not efficient at scale
    where_clause = {
        "OR": [
            {"originalText": {"contains": q, "mode": "insensitive"}},
            {"translatedText": {"contains": q, "mode": "insensitive"}}
        ]
    }
    
    if conversation_id:
        where_clause["conversationId"] = conversation_id
    
    messages = await db.message.find_many(
        where=where_clause,
        order={"createdAt": "desc"},
        take=50  # Limit results for MVP
    )
    
    results = [
        SearchResult(
            messageId=msg.id,
            conversationId=msg.conversationId,
            role=msg.role,
            originalText=msg.originalText,
            translatedText=msg.translatedText,
            createdAt=msg.createdAt
        )
        for msg in messages
    ]
    
    return SearchResponse(
        query=q,
        results=results,
        totalCount=len(results)
    )


# ============ Summary Endpoint ============

@app.post("/summary", response_model=SummaryResponse)
async def create_summary(data: SummaryRequest):
    """
    Generate an AI-powered summary of a conversation.
    
    The summary is generated using Gemini and stored in the conversation record.
    Subsequent calls will regenerate the summary (not cached).
    
    Trade-off: No caching - regenerates each time. 
    For production, consider caching and incremental updates.
    """
    # Get conversation with messages
    conversation = await db.conversation.find_unique(
        where={"id": data.conversationId},
        include={"messages": {"order_by": {"createdAt": "asc"}}}
    )
    
    if not conversation:
        raise HTTPException(404, "Conversation not found")
    
    if not conversation.messages:
        raise HTTPException(400, "No messages to summarize")
    
    # Format messages for summary generation
    messages_data = [
        {
            "role": msg.role,
            "originalText": msg.originalText,
            "translatedText": msg.translatedText
        }
        for msg in conversation.messages
    ]
    
    # Generate summary using Gemini
    summary = await generate_summary(messages_data)
    
    # Update conversation with summary
    await db.conversation.update(
        where={"id": data.conversationId},
        data={"summary": summary}
    )
    
    return SummaryResponse(
        conversationId=data.conversationId,
        summary=summary,
        generatedAt=datetime.utcnow()
    )


# ============ Audio Upload Stub ============

@app.post("/audio/upload", response_model=AudioUploadResponse)
async def upload_audio(file: UploadFile = File(...)):
    """
    STUB: Audio upload endpoint.
    
    OUT OF SCOPE for MVP:
    - Audio file processing
    - Speech-to-text conversion
    - Integration with Gemini audio capabilities
    
    For production implementation:
    1. Store audio in cloud storage (S3, GCS)
    2. Use Google Speech-to-Text or Whisper for transcription
    3. Feed transcription to translation pipeline
    """
    return AudioUploadResponse(
        message="Audio upload received. Speech-to-text processing is not implemented in MVP.",
        filename=file.filename,
        status="stub"
    )


# ============ Error Handlers ============

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Global exception handler for unexpected errors.
    Trade-off: Simple error response. For production, add logging and monitoring.
    """
    return {
        "error": "Internal server error",
        "detail": str(exc) if settings.DEBUG else "An unexpected error occurred"
    }
