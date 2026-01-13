# Asoldi Management Dashboard

A modern management dashboard for tracking workers, integrating with MyPhoner, and managing payments.

## Features

- 👥 **Worker Management** - Track all your team members with detailed profiles
- ✅ **Onboarding Checklists** - Ensure nothing is missed during onboarding
- 📞 **MyPhoner Integration** - Sync call stats, meetings, and winners
- 💰 **Payment Tracking** - Track amounts owed and upcoming paydays
- 📊 **Reports & Analytics** - View team performance and trends
- 🔐 **Secure Authentication** - Password-protected admin access

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file with:

```env
# Authentication (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key-change-this
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password

# MyPhoner API (optional)
MYPHONER_API_KEY=your-myphoner-api-key
MYPHONER_CAMPAIGN_ID=your-campaign-id

# WordPress API (optional)
WORDPRESS_URL=https://asoldi.com
WORDPRESS_USERNAME=your-wp-username
WORDPRESS_APP_PASSWORD=your-wp-application-password

# Luca Accounting (optional)
LUCA_API_KEY=your-luca-api-key
LUCA_COMPANY_ID=your-company-id
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment to Hostinger

### Quick Setup

1. **Create Subdomain**: Hostinger → Subdomains → Create `admin`
2. **Add Node.js App**: Websites → Add Website → Node.js Web App
3. **Connect GitHub**: Link your repo, select `main` branch
4. **Set Environment Variables** (see below)
5. **Deploy**: Click deploy or push to GitHub

### Required Environment Variables

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-key-change-this
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

### Build Settings for Hostinger

- **Node.js Version**: 20.x
- **Entry Point**: `server.js`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

📖 **See `hostinger-setup.md` for detailed step-by-step instructions**

## API Integrations

### MyPhoner

1. Log in to MyPhoner
2. Go to Settings → API
3. Generate an API key
4. Add to environment variables

### WordPress

1. Log in to WordPress admin
2. Go to Users → Your Profile
3. Scroll to "Application Passwords"
4. Create a new application password
5. Add credentials to environment variables

### Luca Accounting

Contact Luca support to request API access. May require a business plan.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Auth**: JWT with HTTP-only cookies
- **State**: React hooks (no external state library needed)

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard pages
│   ├── login/            # Login page
│   └── layout.tsx        # Root layout
├── components/           # Reusable components
├── lib/                  # Utilities and integrations
│   ├── auth.ts           # Authentication
│   ├── data.ts           # Data store
│   ├── myphoner.ts       # MyPhoner API
│   ├── wordpress.ts      # WordPress API
│   └── types.ts          # TypeScript types
└── public/               # Static assets
```

## Default Login

- Username: `admin`
- Password: `admin123` (change in production!)

## Support

For questions about this dashboard, contact the Asoldi team.


