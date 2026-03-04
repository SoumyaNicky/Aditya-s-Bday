// Client-side helper for uploading a file to the server, which in turn
// forwards it to Vercel Blob.  The browser can't directly call `@vercel/blob`
// because that package expects to run in a Node environment with access to
// the secret token.  We convert the file to base64 and send it to
// `/api/upload` where the server code performs the actual `put`.

export async function uploadToBlobStorage(file: File | Blob, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        // FileReader result is a "data:" URL like "data:image/png;base64,...."
        const result = reader.result as string;
        const base64 = result.split(",")[1];

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename, data: base64 }),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || 'upload endpoint returned non‑OK');
        }

        const json = await res.json();
        resolve(json.url as string);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));    
    };

    reader.readAsDataURL(file);
  });
}
