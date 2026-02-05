"""
Database connection management using Prisma.
Trade-off: Single client instance for simplicity. 
For production, consider connection pooling with PgBouncer.
"""

from prisma import Prisma

# Global Prisma client instance
# Initialized once and reused across requests
db = Prisma()


async def connect_db():
    """Connect to database. Called on app startup."""
    await db.connect()


async def disconnect_db():
    """Disconnect from database. Called on app shutdown."""
    await db.disconnect()
