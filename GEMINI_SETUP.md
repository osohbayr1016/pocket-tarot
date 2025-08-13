# Gemini API Setup Guide

## Current Status ✅

The dream interpretation feature is now **working with mock responses** for testing purposes. The system will automatically use mock responses when no API key is configured.

## Getting Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

## Configuration

1. Open `back-end/config.env`
2. Replace `your_gemini_api_key_here` with your actual Gemini API key:
   ```
   GEMINI_API_KEY=AIzaSyC...your_actual_key_here
   ```
3. Restart the backend server: `cd back-end && npm run dev`

## Testing the Setup

1. **Test the API endpoint:**

   ```bash
   curl http://localhost:5001/api/dreams/test
   ```

   This should show `"hasApiKey": true` when properly configured.

2. **Test dream interpretation:**
   - Start the frontend: `cd front-end && npm run dev`
   - Navigate to "💭 Зүүдний Тайлал 💭" section
   - Enter a dream description and test

## Features

### With Mock Responses (Current):

- ✅ Working dream interpretation with predefined responses
- ✅ Structured format (brief, detailed, advice)
- ✅ Mongolian language responses
- ✅ Error handling and user feedback

### With Real Gemini API:

- ✅ Personalized AI-powered dream analysis
- ✅ Dynamic responses based on dream content
- ✅ Advanced interpretation with context
- ✅ All mock features plus AI intelligence

## Troubleshooting

### Error: "Gemini API тохиргоо хийгээгүй байна"

- Check if `GEMINI_API_KEY` is set in `back-end/config.env`
- Ensure the API key is valid and not the placeholder value
- Restart the backend server after making changes

### Error: "API түлхүүр буруу байна"

- Verify your API key is correct
- Check if you have quota remaining
- Ensure the API key has access to Gemini Pro model

### Error: "Сүлжээний алдаа"

- Check your internet connection
- Verify the backend server is running on port 5001
- Check if there are any firewall issues

## Security

- API key is stored in environment variables
- Requests are validated on both frontend and backend
- Rate limiting is implemented to prevent abuse
- Mock responses work without exposing API keys

## Next Steps

1. Get your Gemini API key from Google AI Studio
2. Update the `back-end/config.env` file
3. Restart the backend server
4. Test the feature with real AI responses

The system will automatically switch from mock to real AI responses once the API key is properly configured! 🎉
