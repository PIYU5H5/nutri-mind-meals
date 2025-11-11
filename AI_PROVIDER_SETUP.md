# AI Provider Setup Guide

This app supports both **Gemini API** and **OpenAI API**. You can switch between them easily.

## Quick Setup

### Option 1: Use OpenAI API (Recommended if Gemini quota is exhausted)

1. **Get an OpenAI API Key:**
   - Go to https://platform.openai.com/api-keys
   - Sign up or log in
   - Create a new API key
   - **Note:** OpenAI requires billing setup (no free tier for API, but you get $5 free credits)

2. **Update your `.env` file:**
   ```env
   # Choose your provider: "openai" or "gemini"
   VITE_AI_PROVIDER=openai
   
   # OpenAI API Key
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   
   # Gemini API Key (optional, keep if you want to switch back)
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Restart your dev server:**
   ```bash
   npm run dev
   ```

### Option 2: Use Gemini API (Current)

1. **Update your `.env` file:**
   ```env
   # Choose your provider: "openai" or "gemini"
   VITE_AI_PROVIDER=gemini
   
   # Gemini API Key
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

2. **Restart your dev server**

## Comparison

### OpenAI API
- **Pros:**
  - More reliable quota system
  - Better error handling
  - $5 free credits when you sign up
  - Consistent pricing
  - Faster response times
  - Better JSON formatting support

- **Cons:**
  - Requires billing setup (credit card)
  - Costs money after free credits ($0.15 per 1M input tokens for gpt-4o-mini)
  - No permanent free tier

### Gemini API
- **Pros:**
  - Free tier available (with quotas)
  - No credit card required for free tier
  - Cheaper than OpenAI for some use cases

- **Cons:**
  - Strict quota limits on free tier
  - Quota can be exhausted quickly
  - Less reliable quota management

## Pricing Comparison

### OpenAI (gpt-4o-mini)
- **Input:** $0.15 per 1M tokens (~750,000 words)
- **Output:** $0.60 per 1M tokens
- **Free Credits:** $5 when you sign up

### Gemini (gemini-2.0-flash-exp)
- **Free Tier:** Limited quotas (can be exhausted)
- **Paid:** Check Google Cloud pricing

## Recommendation

**If you're getting quota errors with Gemini:**
1. Try OpenAI API (better quota management)
2. Or wait for Gemini quota to reset (usually hourly/daily)
3. Or upgrade your Gemini plan

**For production apps:**
- OpenAI is more reliable and predictable
- Better for handling high traffic
- More consistent pricing

## Troubleshooting

### "Missing VITE_OPENAI_API_KEY"
- Make sure you added the key to `.env` file
- Restart your dev server after adding the key
- Check that the key starts with `sk-`

### "API quota exceeded" (OpenAI)
- Check your OpenAI usage: https://platform.openai.com/usage
- Add credits to your account
- Check your rate limits

### "API quota exceeded" (Gemini)
- Wait for quota to reset (check https://ai.google.dev/usage)
- Upgrade your Gemini plan
- Switch to OpenAI API

## Switching Between Providers

You can switch anytime by:
1. Changing `VITE_AI_PROVIDER` in `.env`
2. Making sure the corresponding API key is set
3. Restarting the dev server

The app will automatically use the selected provider.

