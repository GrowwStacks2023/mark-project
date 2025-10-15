# MeetingHub Setup Guide

## ✅ Configuration Complete!

Your Google Calendar OAuth is now properly configured.

## How to Use the Application

### 1. Start the Application
The dev server should already be running. If not, run:
```bash
npm run dev
```

### 2. Connect Your Google Calendar
1. Open the application in your browser (usually http://localhost:5173)
2. Click the "Connect Google Calendar" button
3. You'll be redirected to Google's authorization page
4. Sign in with your Google account
5. Grant calendar permissions
6. You'll be redirected back to the dashboard

### 3. Dashboard Features

**Stats Bar:**
- View total meetings today
- See active recordings count
- Track upcoming meetings
- Time until next meeting

**Meeting Cards:**
- Click "Join Meeting" to open Google Meet/Zoom link
- Click "Start Recording" to invite Fireflies bot
- Live status indicators for ongoing meetings
- Recording status with pulsing animation

**Filters & Search:**
- Search meetings by title, description, or attendee
- Filter by: All, Today, This Week, Recorded
- Toggle between Grid and List view

**Auto-Sync:**
- Calendar syncs every 3 minutes automatically
- Manual refresh button available in header
- Green dot = synced, Yellow dot = syncing

## Redirect URI Configuration

Your authorized redirect URI is:
```
http://localhost:5173/auth/callback
```

For production, you'll need to add your production URL:
```
https://yourdomain.com/auth/callback
```

## Fireflies Integration

The Fireflies bot will be automatically invited when you click "Start Recording" on any meeting with a valid meeting link (Google Meet or Zoom).

## Troubleshooting

**"Access blocked" error:**
- Make sure the redirect URI is added to Google Cloud Console
- Check that you're using the correct Client ID

**Calendar not syncing:**
- Check browser console for errors
- Verify your access token hasn't expired
- Try logging out and logging back in

**Recording not starting:**
- Ensure the meeting has a valid meeting link
- Check that your Fireflies API key is correct in .env
- Verify the meeting link is accessible

## Environment Variables

Make sure your `.env` file contains:
```
VITE_GOOGLE_CLIENT_ID=your_client_id
VITE_GOOGLE_CLIENT_SECRET=your_client_secret
VITE_FIREFLIES_API_KEY=your_fireflies_key
```

Enjoy your premium meeting dashboard! 🎉
