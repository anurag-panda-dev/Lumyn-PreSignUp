# Lumyn Band - Deployment Guide

## Project Structure

```
/
├── index.html          # Main landing page
├── style.css           # All styling
├── app.js              # Client-side JavaScript
├── package.json        # Dependencies
├── vercel.json         # Vercel deployment config
│
├── api/
│   └── signup.js       # Serverless API endpoint
│
├── scripts/
│   ├── dev-server.js   # Local development server
│   └── setup-db.js     # Database setup script
│
└── Documentation files (README.md, SETUP.md, etc.)
```

## Quick Start (Local Development)

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Open http://localhost:3000
```

The dev server includes:
- Static file serving (HTML, CSS, JS)
- API endpoint at `/api/signup`
- Demo mode (emails stored in memory)
- No database required locally

## Deployment to Vercel

### 1. Connect to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Import in Vercel
- Visit vercel.com/new
- Import your GitHub repository
- Vercel auto-detects the configuration

### 3. Environment Variables (Optional)

If you want to use the Neon database in production:

1. Get your connection string from [neon.tech](https://neon.tech)
2. In Vercel Settings → Environment Variables, add:
   ```
   POSTGRES_URL_NO_SSL=your_neon_connection_string
   ```
3. Run setup script:
   ```bash
   node scripts/setup-db.js
   ```

**Without environment variables**, the API works in demo mode (in-memory storage).

### 4. Deploy

Click "Deploy" in Vercel. That's it!

## File Descriptions

### Frontend Files (Root)
- **index.html** - Semantic HTML5 with the Lumyn logo, hero section, features, and email signup form
- **style.css** - Complete styling with CSS custom properties (vars) for colors, responsive design, animations
- **app.js** - Form validation, submission handler, success/error feedback

### Backend Files
- **api/signup.js** - Vercel serverless function that handles email signup
  - Takes POST requests with email
  - Optional: stores in Neon PostgreSQL
  - Returns 201 on success, proper error codes on failure
  - Validates email format and prevents duplicates

- **scripts/dev-server.js** - Local development server
  - Serves static files from root
  - Handles `/api/signup` in demo mode (no DB)
  - CORS enabled for browser requests

- **scripts/setup-db.js** - One-time database setup
  - Creates `subscribers` table in Neon
  - Sets up unique constraint on email
  - Only needed if using database

## Features

✓ **Responsive Design** - Mobile-first, works on all devices
✓ **Form Validation** - Client + server-side email validation
✓ **Demo Mode** - Works without database (local dev)
✓ **Database Ready** - Optional Neon PostgreSQL integration
✓ **Serverless** - Deploys as Vercel Functions (no servers to manage)
✓ **Zero-Config** - Works with just `vercel.json`
✓ **CORS Support** - API accessible from any origin
✓ **Beautiful UI** - Premium neurotechnology brand aesthetic

## API Endpoint

**URL:** `POST /api/signup` (or `/api/signup.js`)

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (201):**
```json
{
  "message": "Successfully registered for early access",
  "subscriber": {
    "id": "abc123",
    "email": "user@example.com",
    "created_at": "2026-07-02T16:12:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Invalid or missing email
- `409` - Email already registered
- `500` - Server error

## Troubleshooting

### Form not submitting?
1. Check browser console for errors
2. Verify API endpoint is accessible
3. Check that email is valid format

### API returns 500 error?
1. Check Vercel function logs: `vercel logs`
2. If using database, verify `POSTGRES_URL_NO_SSL` is set
3. In production, run: `node scripts/setup-db.js`

### Form works locally but not in production?
1. Ensure environment variables are set in Vercel
2. Check that function is deployed: `vercel functions list`
3. Test API directly: `curl -X POST https://your-domain.vercel.app/api/signup -H "Content-Type: application/json" -d '{"email":"test@example.com"}'`

## Next Steps

- Replace logo with your own: update img src in `index.html`
- Customize copy and features to your product
- Add email notifications (Resend, SendGrid, etc.)
- Add analytics (Vercel Analytics, Posthog, etc.)
- Set up custom domain in Vercel
- Add A/B testing with Vercel Flags

## Tech Stack

- **Frontend:** Pure HTML, CSS, JavaScript (no frameworks)
- **Backend:** Vercel Serverless Functions (Node.js)
- **Database:** Optional Neon PostgreSQL
- **Hosting:** Vercel (auto-scales, no ops needed)
- **Package Manager:** pnpm

## License

MIT License - See LICENSE file
