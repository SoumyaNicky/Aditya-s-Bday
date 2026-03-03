// Utility for uploading files to Vercel Blob
import { put } from "@vercel/blob";

export async function uploadToBlobStorage(file: File | Blob, filename: string): Promise<string> {
  const { url } = await put(filename, file, { access: "public" });
  return url;
}
