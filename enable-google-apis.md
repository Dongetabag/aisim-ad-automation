# 🔧 Enable Google APIs for AISim

## Quick Setup Guide

### Step 1: Access Google Cloud Console
1. **Open**: [https://console.cloud.google.com](https://console.cloud.google.com)
2. **Sign in** with your Google account
3. **Select project**: `165665271215` (or create a new one)

### Step 2: Enable Required APIs

#### A. Enable Places API (New)
1. **Go to**: [https://console.cloud.google.com/apis/library/places-backend.googleapis.com](https://console.cloud.google.com/apis/library/places-backend.googleapis.com)
2. **Click "ENABLE"** button
3. **Wait for confirmation** (usually instant)

#### B. Enable YouTube Data API v3
1. **Go to**: [https://console.cloud.google.com/apis/library/youtube.googleapis.com](https://console.cloud.google.com/apis/library/youtube.googleapis.com)
2. **Click "ENABLE"** button
3. **Wait for confirmation** (usually instant)

### Step 3: Wait for Propagation
- **Wait 2-3 minutes** for APIs to become active
- Google's systems need time to propagate changes

### Step 4: Test APIs
```bash
# Run the enhanced test
node test-google-api-enhanced.js

# Or run the basic test
node test-google-api.js
```

### Step 5: Start AISim System
```bash
# Once APIs are working, start the system
./startup.sh
```

## Expected Results

After enabling the APIs, you should see:
```
✅ Google Places API working
   Found X results
   First result: [Restaurant Name]

✅ YouTube API working
   Found 3 videos
   First video: [Video Title]

🎉 All APIs are working! Your AISim system is ready to use.
```

## Troubleshooting

### If APIs still don't work:
1. **Check billing**: Ensure your Google Cloud project has billing enabled
2. **Check quotas**: Verify you haven't exceeded API quotas
3. **Wait longer**: Sometimes it takes up to 10 minutes for changes to propagate
4. **Check project**: Make sure you're in the correct project (165665271215)

### API Quotas:
- **Places API**: 1000 requests/day (free tier)
- **YouTube API**: 10,000 requests/day (free tier)

## Next Steps

Once APIs are enabled:
1. **Test lead generation**: Use Google Places to find businesses
2. **Test ad inspiration**: Use YouTube to find marketing content
3. **Deploy to production**: Use the enhanced lead generation features
4. **Scale up**: Consider upgrading API quotas for production use
