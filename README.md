# Zemenay Hackathon

## Chat Widget
- Floating Q^A chat button appears bottom-right on all pages.
- Sends POST /api/chat with `{ prompt }` and displays the response.

## Environment
Create `.env.local` with one of:

```
GEMINI_API_KEY=your_gemini_key
# or
GOOGLE_API_KEY=your_gemini_key
```

Restart dev server after changes.