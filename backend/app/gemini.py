"""
Gemini AI helper functions for translation and summarization.
Trade-off: Using REST API directly due to Python 3.14 compatibility issues with google-generativeai.
For production, consider downgrading to Python 3.12 for full SDK support.
"""

import httpx
from app.config import get_settings

settings = get_settings()

# Gemini API endpoint
# Using gemini-2.5-flash which is the latest fast model
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"


# Supported languages for the MVP
# Trade-off: Limited set for MVP, can expand based on healthcare needs
SUPPORTED_LANGUAGES = {
    "en": "English",
    "es": "Spanish", 
    "fr": "French",
    "de": "German",
    "zh": "Chinese (Simplified)",
    "hi": "Hindi",
    "ar": "Arabic",
    "pt": "Portuguese",
    "ru": "Russian",
    "ja": "Japanese",
    "ko": "Korean",
    "vi": "Vietnamese",
}


async def call_gemini(prompt: str) -> str:
    """
    Call Gemini API directly via REST.
    Trade-off: Using REST API instead of SDK for Python 3.14 compatibility.
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{GEMINI_API_URL}?key={settings.GEMINI_API_KEY}",
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 2048,
                }
            },
            timeout=30.0
        )
        
        if response.status_code != 200:
            raise Exception(f"Gemini API error: {response.status_code} - {response.text}")
        
        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]


async def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    """
    Translate text from source language to target language using Gemini.
    
    Args:
        text: The text to translate
        source_lang: Source language code (e.g., 'en')
        target_lang: Target language code (e.g., 'es')
    
    Returns:
        Translated text string
    
    Trade-off: Using prompt engineering for translation instead of dedicated 
    translation API. Gemini handles medical terminology reasonably well.
    """
    if source_lang == target_lang:
        return text
    
    source_name = SUPPORTED_LANGUAGES.get(source_lang, source_lang)
    target_name = SUPPORTED_LANGUAGES.get(target_lang, target_lang)
    
    prompt = f"""You are a medical translator. Translate the following text from {source_name} to {target_name}.

IMPORTANT RULES:
1. Preserve medical terminology accurately
2. Maintain the original tone and intent
3. If there are medical terms, translate them appropriately for the target language
4. Return ONLY the translated text, no explanations

Text to translate:
{text}

Translation:"""

    try:
        return (await call_gemini(prompt)).strip()
    except Exception as e:
        # Trade-off: Return original text on error rather than failing
        # In production, implement proper error handling and retries
        print(f"Translation error: {e}")
        return f"[Translation failed] {text}"


async def generate_summary(messages: list[dict]) -> str:
    """
    Generate an AI-powered summary of a conversation.
    
    Args:
        messages: List of message dicts with 'role', 'originalText', 'translatedText'
    
    Returns:
        Summary string
    
    Trade-off: Simple summary for MVP. Could add structured output 
    (symptoms, diagnosis, recommendations) for production.
    """
    if not messages:
        return "No messages to summarize."
    
    # Format conversation for the prompt
    conversation_text = "\n".join([
        f"{msg['role'].upper()}: {msg['originalText']}"
        for msg in messages
    ])
    
    prompt = f"""You are a medical documentation assistant. Summarize the following doctor-patient conversation.

PROVIDE:
1. Brief overview of the consultation (1-2 sentences)
2. Key symptoms or concerns mentioned
3. Any diagnoses or assessments discussed
4. Recommended actions or follow-ups
5. Important medical terms used

Keep the summary concise and professional. Use bullet points for clarity.

CONVERSATION:
{conversation_text}

SUMMARY:"""

    try:
        return (await call_gemini(prompt)).strip()
    except Exception as e:
        print(f"Summary generation error: {e}")
        return "Unable to generate summary. Please try again."


def get_supported_languages() -> dict:
    """Return dictionary of supported language codes and names."""
    return SUPPORTED_LANGUAGES
