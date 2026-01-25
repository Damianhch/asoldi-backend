# How to Open Browser Console

## Different Browsers:

### Chrome / Edge / Brave
- **Windows/Linux**: Press `Ctrl + Shift + J` OR `F12`
- **Mac**: Press `Cmd + Option + J`
- Or: Right-click page → "Inspect" → Click "Console" tab

### Firefox
- **Windows/Linux**: Press `Ctrl + Shift + K` OR `F12`
- **Mac**: Press `Cmd + Option + K`
- Or: Right-click page → "Inspect Element" → Click "Console" tab

### Safari (Mac only)
- Press `Cmd + Option + C`
- Or: Safari menu → Develop → Show JavaScript Console
- (You may need to enable Developer menu first: Preferences → Advanced → "Show Develop menu")

## What to Look For:

1. **Red errors** - These show what's broken
2. **Yellow warnings** - These are less critical but worth checking
3. **Network tab** - Click "Network" tab to see API requests and their responses

## For MyPhoner Debugging:

1. Open Console (F12 or Ctrl+Shift+J)
2. Click "Network" tab
3. Try syncing MyPhoner
4. Look for requests to `/api/myphoner/...`
5. Click on the request to see the response
6. Check the "Console" tab for any error messages

## Quick Test:

Visit: `http://localhost:3000/api/myphoner/debug`

This will show you:
- If API key is set
- If connection works
- How many agents found
- Any errors

