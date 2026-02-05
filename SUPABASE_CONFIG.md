# Supabase Database Configuration

## Your Supabase Project
- Project URL: https://wuyoutrilevqnhuikbdm.supabase.co
- Publishable API Key: sb_publishable_cLhxwe65aTMTRjlKcYdPVQ_6gMi8Ylm

## ⚠️ Get PostgreSQL Connection String

The API key shown is for REST API access. For Prisma/backend deployment, you need the **PostgreSQL connection string**.

### How to Get It:

1. In your Supabase dashboard, go to:
   **Settings** (gear icon) → **Database** → **Connection string**

2. Select the **URI** tab

3. Copy the connection string that looks like:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

4. Replace `[password]` with your actual database password

### Common Formats:

**Session Mode (Direct Connection):**
```
postgresql://postgres.wuyoutrilevqnhuikbdm:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

**Transaction Mode (Pooler - Recommended for Render):**
```
postgresql://postgres.wuyoutrilevqnhuikbdm:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

## Next: Deploy Backend to Render

Once you have the connection string, use it for the `DATABASE_URL` environment variable in Render.

Would you like me to wait for the connection string, or would you like instructions on where to find it in Supabase?
