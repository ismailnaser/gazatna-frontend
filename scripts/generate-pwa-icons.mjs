import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const imagesDir = path.join(root, "public", "images");
const source = path.join(imagesDir, "logo-icon.png");

const BRAND_BLUE = "#424cf3";

async function createIcon(size, outputName, { maskable = false } = {}) {
  const padding = maskable ? Math.round(size * 0.18) : Math.round(size * 0.08);
  const inner = size - padding * 2;

  const resizedLogo = await sharp(source)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const background = maskable
    ? { r: 66, g: 76, b: 243, alpha: 1 }
    : { r: 255, g: 255, b: 255, alpha: 1 };

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([{ input: resizedLogo, gravity: "centre" }])
    .png({ compressionLevel: 9, quality: 90 })
    .toFile(path.join(imagesDir, outputName));

  console.log(`Created ${outputName} (${size}x${size})`);
}

await mkdir(imagesDir, { recursive: true });

await createIcon(192, "pwa-icon-192.png");
await createIcon(512, "pwa-icon-512.png");
await createIcon(512, "pwa-icon-maskable-512.png", { maskable: true });
await createIcon(180, "apple-touch-icon.png");

console.log("PWA icons generated.");
