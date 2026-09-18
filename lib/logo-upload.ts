/** Small logos are stored as raster data URLs in sem_clients.logo_url. */
export async function readLogo(file: File): Promise<string> {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    throw new Error("Choose a PNG, JPEG or WebP image.");
  }
  if (file.size > 5 * 1024 * 1024) throw new Error("Choose an image smaller than 5 MB.");
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("This image could not be read. Choose another file.");
  });
  try {
    const scale = Math.min(1, 512 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image processing is unavailable in this browser.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const result = canvas.toDataURL("image/png");
    if (result.length > 1500000) throw new Error("Image is too large. Choose a simpler logo.");
    return result;
  } finally {
    bitmap.close();
  }
}
