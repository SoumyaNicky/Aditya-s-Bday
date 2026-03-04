<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/46576a87-3614-4457-bcd8-39a5190c3ca9

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Image uploads & Vercel Blob

The gallery allows reporters to attach archival photos.  Those images are
stored in Vercel Blob – the client sends the file as a base64 string to an
API route (`/api/upload`), and the server-side code uses the
`@vercel/blob` library to perform the upload.  This keeps the upload token
out of the browser and works around the fact that `@vercel/blob` expects a
Node environment.

To make uploads work you must provide a token:

```bash
export VERCEL_BLOB_TOKEN="<your token>"
# or, if using AI Studio, add a secret named VERCEL_BLOB_TOKEN
```

Without the token the upload endpoint will fail with a 500 error and the
client will show "Image upload failed." in the console.

