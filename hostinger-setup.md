# Hostinger Setup Guide for admin.asoldi.com

## Step-by-Step Instructions

### Step 1: Create the Subdomain

1. Log in to Hostinger hPanel
2. Go to **Websites** → Click **Dashboard** next to `asoldi.com`
3. In the left sidebar, click **Subdomains**
4. Enter `admin` as the subdomain name
5. Click **Create**

### Step 2: Set Up Node.js Web App

1. In hPanel, go to **Websites** → **Add Website**
2. Choose **Node.js Web App**
3. Select `admin.asoldi.com` as the domain
4. Choose Node.js version **20.x** (or latest available)

### Step 3: Connect to GitHub

1. In the Node.js app settings, find **Git Repository**
2. Click **Connect to GitHub**
3. Authorize Hostinger to access your GitHub
4. Select your repository (e.g., `asoldi-management-dashboard`)
5. Select the branch: `main`
6. Set the root directory to `/` (root)

### Step 4: Configure Build Settings

Set these in Hostinger's Node.js settings:

- **Node.js Version**: 20.x
- **Entry Point**: `server.js`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Step 5: Set Environment Variables

In Hostinger Node.js settings, add these environment variables:

```
NODE_ENV=production
PORT=3000

# REQUIRED - Change these!
JWT_SECRET=your-super-secret-key-make-it-long-and-random
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password-here

# OPTIONAL - Add when you have the API keys
MYPHONER_API_KEY=
MYPHONER_CAMPAIGN_ID=
WORDPRESS_URL=https://asoldi.com
WORDPRESS_USERNAME=
WORDPRESS_APP_PASSWORD=
```

### Step 6: Deploy

1. Click **Deploy** or push to your GitHub repo
2. Hostinger will automatically:
   - Pull the code
   - Run `npm install`
   - Run `npm run build`
   - Start the server with `npm start`

### Step 7: Verify

1. Wait 2-5 minutes for deployment
2. Visit `https://admin.asoldi.com`
3. You should see the login page
4. Log in with your credentials

---

## Troubleshooting

### App not loading?
- Check the Node.js logs in Hostinger
- Make sure all environment variables are set
- Verify the build completed successfully

### Login not working?
- Double-check ADMIN_USERNAME and ADMIN_PASSWORD in env vars
- Make sure JWT_SECRET is set

### 502 Bad Gateway?
- The app might still be building
- Check if the port matches (should be 3000)
- Review Node.js error logs

---

## Updating the App

After initial setup, updates are automatic:

1. Make changes to your code
2. Push to GitHub (`git push`)
3. Hostinger auto-deploys (or click "Deploy" manually)

---

## Alternative: Manual Upload

If GitHub connection doesn't work:

1. Run locally: `npm run build`
2. Zip the entire project folder
3. Upload via Hostinger File Manager
4. Extract to the subdomain directory
5. Configure Node.js settings as above

