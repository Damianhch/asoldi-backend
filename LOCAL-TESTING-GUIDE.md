# Local Testing Guide - WordPress Sync

## Problem Solved
- ✅ **Auto-sync disabled** - No more automatic syncing every 5 minutes, on page load, or tab visibility
- ✅ **Mock mode available** - Test WordPress sync locally without making API calls
- ✅ **Resource-friendly** - Manual sync only, saves server resources

## Quick Start: Test Locally (No API Calls)

### Step 1: Enable Mock Mode

Create a `.env.local` file in the project root (or add to existing `.env`):

```env
WORDPRESS_MOCK_MODE=true
```

### Step 2: Run Locally

```bash
npm run dev
```

### Step 3: Test Sync

2. Go to **Workers** page
3. Click **"Sync WordPress"** button
4. You'll see 3 mock employees synced (John Doe, Jane Smith, Bob Johnson)
5. **No API calls are made** - everything uses mock data

## Mock Data

When `WORDPRESS_MOCK_MODE=true`, the system uses these mock employees:

- **John Doe** - john.doe@asoldi.com
- **Jane Smith** - jane.smith@asoldi.com  
- **Bob Johnson** - bob.johnson@asoldi.com

## Production Mode

For production (Hostinger), **DO NOT** set `WORDPRESS_MOCK_MODE=true`. Instead:

1. Set your WordPress credentials in Hostinger environment variables:
   - `WORDPRESS_URL=https://asoldi.com`
   - `WORDPRESS_USERNAME=your-username`
   - `WORDPRESS_APP_PASSWORD=your-app-password`

2. Sync is now **manual-only** - click the "Sync WordPress" button when needed

## What Changed

### Before (Resource Exhaustion)
- ❌ Auto-sync every 5 minutes
- ❌ Auto-sync on page load
- ❌ Auto-sync on tab visibility change
- ❌ Multiple API calls per sync
- ❌ Used up 17+ hours of resources

### After (Resource Friendly)
- ✅ Manual sync only (click button)
- ✅ Mock mode for local testing
- ✅ No automatic API calls
- ✅ Saves server resources

## Testing Checklist

- [ ] Set `WORDPRESS_MOCK_MODE=true` in `.env.local`
- [ ] Run `npm run dev`
- [ ] Navigate to Workers page
- [ ] Click "Sync WordPress" button
- [ ] Verify 3 mock employees appear
- [ ] Check browser console - should see "🔧 Using MOCK WordPress mode"
- [ ] No network requests to WordPress API

## Troubleshooting

### Mock mode not working?
- Make sure `.env.local` exists in project root
- Restart dev server after adding env variable
- Check console for "🔧 Using MOCK WordPress mode" message

### Want to test with real WordPress?
- Remove `WORDPRESS_MOCK_MODE` or set to `false`
- Add real WordPress credentials to `.env.local`
- Sync will make real API calls

### Still using too many resources?
- Make sure auto-sync is disabled (it should be by default now)
- Only sync manually when needed
- Use mock mode for development/testing

