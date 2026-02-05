"""
Pydantic schemas for request/response validation.
Trade-off: Minimal validation for MVP. Add more constraints in production.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


# ============ User Schemas ============

class UserCreate(BaseModel):
    """Schema for creating a new user (doctor or patient)."""
    name: str = Field(..., min_length=1, max_length=100, description="User's full name")
    role: str = Field(..., pattern="^(doctor|patient)$", description="Role: 'doctor' or 'patient'")
    language: str = Field(..., min_length=2, max_length=5, description="Default language code (e.g., 'en', 'es')")


class UserResponse(BaseModel):
    """Schema for user data in responses."""
    id: str
    name: str
    role: str
    uniqueId: str
    language: str
    createdAt: datetime

    class Config:
        from_attributes = True


class UsersListResponse(BaseModel):
    """Schema for list of users."""
    users: List[UserResponse]


# ============ Conversation Schemas ============

class ConversationCreate(BaseModel):
    """Request schema for creating a new conversation."""
    doctorId: str = Field(..., description="Doctor user ID")
    patientId: str = Field(..., description="Patient user ID")
    doctorLanguage: str = Field(..., description="Language code for doctor (e.g., 'en')")
    patientLanguage: str = Field(..., description="Language code for patient (e.g., 'es')")


class ConversationResponse(BaseModel):
    """Response schema for conversation data."""
    id: str
    doctorId: str
    patientId: str
    doctorLanguage: str
    patientLanguage: str
    summary: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True


# ============ Message Schemas ============

class MessageCreate(BaseModel):
    """Request schema for sending a new message."""
    conversationId: str = Field(..., description="ID of the conversation")
    role: str = Field(..., pattern="^(doctor|patient)$", description="Sender role: 'doctor' or 'patient'")
    text: str = Field(..., min_length=1, description="Message text in sender's language")


class MessageResponse(BaseModel):
    """Response schema for message data."""
    id: str
    conversationId: str
    role: str
    originalText: str
    translatedText: str
    sourceLanguage: str
    targetLanguage: str
    createdAt: datetime

    class Config:
        from_attributes = True


class MessagesListResponse(BaseModel):
    """Response schema for list of messages with polling support."""
    messages: list[MessageResponse]
    lastMessageId: Optional[str] = None  # For polling - client can request messages after this ID


# ============ Search Schemas ============

class SearchResult(BaseModel):
    """Response schema for search results."""
    messageId: str
    conversationId: str
    role: str
    originalText: str
    translatedText: str
    createdAt: datetime

    class Config:
        from_attributes = True


class SearchResponse(BaseModel):
    """Response schema for search endpoint."""
    query: str
    results: list[SearchResult]
    totalCount: int


# ============ Summary Schemas ============

class SummaryRequest(BaseModel):
    """Request schema for generating conversation summary."""
    conversationId: str = Field(..., description="ID of the conversation to summarize")


class SummaryResponse(BaseModel):
    """Response schema for summary data."""
    conversationId: str
    summary: str
    generatedAt: datetime


# ============ Audio Upload Stub ============

class AudioUploadResponse(BaseModel):
    """
    Response schema for audio upload endpoint.
    STUB: Audio processing is out of scope for MVP.
    """
    message: str = "Audio upload received (processing not implemented)"
    filename: Optional[str] = None
    status: str = "stub"


# ============ Language Schemas ============

class LanguageOption(BaseModel):
    """Schema for language option."""
    code: str
    name: str


class LanguagesResponse(BaseModel):
    """Response schema for available languages."""
    languages: list[LanguageOption]
