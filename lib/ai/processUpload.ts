import { classifyImage, DetectedAttributes } from "@/lib/ai/vision";

export interface ProcessedUpload {
  detected: DetectedAttributes;
  imageDataUrl: string;
  filename: string;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function downscale(img: HTMLImageElement, maxDim = 480): string {
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return img.src;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.82);
}

/** Client-side pipeline: read file -> downscale for storage -> run the mock/demo classifier. */
export async function processUpload(file: File): Promise<ProcessedUpload> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const detected = classifyImage(img, file.name);
    const imageDataUrl = downscale(img);
    return { detected, imageDataUrl, filename: file.name };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
