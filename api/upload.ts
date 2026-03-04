import { put } from '@vercel/blob';

// Allow larger payloads in case users upload big images.
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb', // default is 4mb
    },
  },
};

export default async function handler(req: any, res: any) {
  if (!process.env.VERCEL_BLOB_TOKEN) {
    console.warn('VERCEL_BLOB_TOKEN is not set; blob uploads will fail.');
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { filename, data } = req.body as { filename?: string; data?: string };
  if (!filename || !data) {
    return res.status(400).json({ error: 'Missing filename or data' });
  }

  try {
    // `data` is expected to be a base64-encoded string (no data URL prefix).
    const buffer = Buffer.from(data, 'base64');
    const { url } = await put(filename, buffer, { access: 'public' });
    res.status(200).json({ url });
  } catch (err: any) {
    console.error('blob upload failed', err);
    res.status(500).json({ error: 'Upload failed', details: err.message || err });
  }
}
