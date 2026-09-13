export const PROFILE_IMAGE_ERROR = "Please upload a PNG, JPG or WEBP image under 2 MB.";

export async function processProfileImage(file: File): Promise<string> {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024) throw new Error(PROFILE_IMAGE_ERROR);
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 384;
    const context = canvas.getContext("2d");
    if (!context) throw new Error(PROFILE_IMAGE_ERROR);
    const size = Math.min(image.naturalWidth, image.naturalHeight);
    context.drawImage(image, (image.naturalWidth - size) / 2, (image.naturalHeight - size) / 2, size, size, 0, 0, 384, 384);
    const result = canvas.toDataURL("image/webp", 0.8);
    if (result.length > 400 * 1024) throw new Error(PROFILE_IMAGE_ERROR);
    return result;
  } catch { throw new Error(PROFILE_IMAGE_ERROR); }
  finally { URL.revokeObjectURL(url); }
}
