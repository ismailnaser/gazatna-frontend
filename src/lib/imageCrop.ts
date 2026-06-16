export type CroppedAreaPixels = {
  width: number;
  height: number;
  x: number;
  y: number;
};

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.crossOrigin = "anonymous";
    img.src = url;
  });
}

export async function cropImageToFile(
  imageUrl: string,
  crop: CroppedAreaPixels,
  fileName: string,
  outputSize?: { width: number; height: number }
): Promise<File> {
  const image = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = outputSize?.width ?? crop.width;
  canvas.height = outputSize?.height ?? crop.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Failed to crop image"))),
      "image/jpeg",
      0.9
    );
  });

  return new File([blob], fileName.replace(/\.\w+$/, "") + ".jpg", {
    type: "image/jpeg",
  });
}

