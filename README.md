# 🌊 LUMYN BAND - Premium Neurotechnology Landing Page

A stunning, high-converting pre-launch landing page for Lumyn Band built with **pure HTML, CSS, and Vanilla JavaScript**, powered by **Neon PostgreSQL**.

## ✨ Features

- **Premium Design** - Sleek dark theme with glowing cyan accents matching the brand aesthetic
- **Email Capture Form** - Secure signup with real-time validation
- **Neon Database** - All emails stored securely in PostgreSQL
- **Serverless Backend** - Decoupled architecture keeps credentials hidden from browser
- **Responsive Design** - Mobile-first, works beautifully on all devices
- **No Framework Bloat** - Pure vanilla stack with no React/Vue overhead

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and add your Neon database URL:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
POSTGRES_URL_NO_SSL=postgresql://username:password@host.neon.tech/database
```

Get your connection string from [Neon Console](https://console.neon.tech/):
- Go to your project
- Select the database
- Click "Connection string"
- Copy the connection string (use the "No SSL" version)

### 3. Initialize the Database

Run the setup script to create the subscribers table:

```bash
npm run setup:db
```

You should see:
```
🔄 Connecting to Neon database...
✓ Connected successfully

📦 Creating subscribers table...
✓ Subscribers table created

✅ Database setup complete!
```

### 4. Start the Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

```
🚀 Local Server: http://localhost:3000
ℹ️  Database Status: ✓ Configured
```

## 📁 Project Structure

```
lumyn-band/
├── index.html              # Main landing page (semantic HTML)
├── style.css               # Premium styling with Tailwind-like utilities
├── app.js                  # Client-side form handling & validation
├── api/
│   └── signup.js           # Vercel serverless function (for deployment)
├── scripts/
│   ├── setup-db.js         # Database initialization script
│   └── dev-server.js       # Local development server
├── .env.example            # Environment template
└── package.json            # Dependencies & scripts
```

## 🔐 Security Architecture

### Client-Side (app.js)
- ✓ Email validation
- ✓ Clean POST request to backend
- ✓ NO database credentials exposed

### Backend (api/signup.js or dev-server.js)
- ✓ Parameterized queries (SQL injection prevention)
- ✓ Environment variable isolation
- ✓ Email sanitization
- ✓ Duplicate email handling (UNIQUE constraint)
- ✓ Error handling with safe messages

**Key Rule:** Database credentials are ONLY in `.env.local` and never reach the browser.

## 🎨 Design Highlights

- **Color Palette**
  - Background: `#0f0f0f` (Matte Black)
  - Accent: `#00f0ff` (Glowing Cyan)
  - Text: `#ffffff` (Crisp White)

- **Typography**
  - Font: Inter (ultra-modern, minimal)
  - Heading spacing: Wide tracking (`L U M Y N B A N D`)
  - Line height: 1.6 for optimal readability

- **Components**
  - Floating header with logo
  - Hero section with animated gradients
  - Email capture with neon border glow
  - 3-column feature showcase with hover effects
  - Minimal footer with links

## 📝 API Reference

### POST /api/signup

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
    "id": 1,
    "email": "user@example.com",
    "created_at": "2026-07-02T12:00:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "message": "Invalid email format"
}
```

**Duplicate Email (409):**
```json
{
  "message": "This email is already registered for early access"
}
```

## 🌐 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com)
3. Add environment variable: `POSTGRES_URL_NO_SSL` (your Neon connection string)
4. Deploy!

The `/api/signup.js` file is automatically recognized as a Vercel serverless function.

### Deploy to Netlify

1. Push code to GitHub
2. Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

3. Move `api/signup.js` to `netlify/functions/signup.js` (adjust for Netlify format)
4. Deploy with Netlify CLI: `netlify deploy`

## 🐛 Troubleshooting

### "Database not initialized" error
```bash
npm run setup:db
```

### "POSTGRES_URL_NO_SSL not set"
- Check `.env.local` exists
- Verify connection string is correct
- Make sure it's not `.env` (dev server reads `.env.local` first)

### Email signup not working
1. Check browser console for errors (F12)
2. Check server terminal for logs
3. Verify database is running: `npm run setup:db`

### Can't connect to Neon
- Verify connection string format: `postgresql://user:password@host/db`
- Make sure Neon project is active
- Check IP whitelist in Neon console (allow all IPs: `0.0.0.0/0`)

## 📚 Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend:** Node.js (dev server) / Vercel Functions (production)
- **Database:** Neon PostgreSQL
- **Deployment:** Vercel / Netlify

## 📄 License

MIT - Feel free to use this as a template for your own projects!

---

**Built with ❤️ for Lumyn Band**

Questions? Issues? Feel free to create an issue or reach out!
