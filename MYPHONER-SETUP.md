# MyPhoner API Setup Guide

## Environment Variables

Add these to your `.env` file:

```env
# MyPhoner API Configuration
MYPHONER_SUBDOMAIN=asoldi  # Just the subdomain, NOT the full URL!
MYPHONER_API_KEY=your-sitewide-api-key-here
MYPHONER_CAMPAIGN_ID=12345  # Optional: Your list/campaign ID if needed
```

## Important Notes

### 1. MYPHONER_SUBDOMAIN Format
- ✅ **Correct**: `MYPHONER_SUBDOMAIN=asoldi`
- ❌ **Wrong**: `MYPHONER_SUBDOMAIN=https://asoldi.myphoner.com/api/v2`

The code will automatically construct: `https://asoldi.myphoner.com/api/v2`

### 2. Which API Key to Use?

**Use the Sitewide API Key** from:
- MyPhoner → **Manage** → **Configure** → **Integrations** → **API**

This is the one that says "site wide" and can access all accounts.

**DO NOT use** the account-specific API key from:
- Account Settings → My Preferences → Credentials → API Keys for Automations

The sitewide key is what you need for accessing all data across your account.

### 3. Getting Winners/Events

MyPhoner API may require a List/Campaign ID to get events. If you get errors about missing list_id:

1. Find your Campaign/List ID in MyPhoner
2. Add it to `.env`: `MYPHONER_CAMPAIGN_ID=your-list-id`
3. The code will automatically use it when querying events

### 4. Local Testing

✅ **Yes, you can test locally!**

- Images and contracts are saved in `.builds/uploads/` folder in your project
- This works both locally and on Hostinger
- Files are stored in your project directory, not in Hostinger's file system

### 5. API Endpoints

The code uses:
- `/api/v2/users` - Get agents/users
- `/api/v2/calls` - Get calls
- `/api/v2/leads` - Get leads (which contain outcomes/events)
- `/api/v2/events` - Try to get events directly (may not exist)

If the events endpoint doesn't work, the code falls back to getting leads and extracting outcomes from them.

## Testing

1. Set your environment variables in `.env`
2. Restart your dev server
3. Go to Workers page → Click "Sync MyPhoner"
4. Check the browser console for any API errors
5. If you see "list_id required" errors, add `MYPHONER_CAMPAIGN_ID` to your `.env`

## Troubleshooting

### "Events endpoint not found"
- This is normal - the code will use leads instead
- Winners are extracted from lead outcomes

### "Agent not found"
- Make sure the email in WordPress matches the email in MyPhoner
- Check that the API key has access to all accounts

### "List ID required"
- Add `MYPHONER_CAMPAIGN_ID` to your `.env` file
- Find your list/campaign ID in MyPhoner dashboard

