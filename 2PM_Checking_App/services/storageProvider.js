import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@env";

// Simple pluggable storage provider abstraction.
// Now uses Cloudinary unsigned uploads; later we can add Firebase Storage or S3.

async function uploadToCloudinary(localUri) {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary env vars are not configured in .env");
  }

  const formData = new FormData();
  formData.append("file", {
    uri: localUri,
    type: "image/jpeg",
    name: "drawing.jpg",
  });
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const json = await uploadRes.json();
  if (!uploadRes.ok || !json?.secure_url) {
    throw new Error("Cloudinary upload failed");
  }

  return {
    url: json.secure_url,
    provider: "cloudinary",
    storagePath: json.public_id || null,
    fileSizeBytes: typeof json.bytes === "number" ? json.bytes : null,
    mimeType: json.format ? `image/${json.format}` : "image/jpeg",
  };
}

export async function uploadDrawingFile(localUri, { siteId, folderPath }) {
  // In the future we can branch on a setting to choose between Cloudinary, GCS, S3, etc.
  return uploadToCloudinary(localUri);
}

