import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, "..", "public", "images");

async function removeNearWhiteBackground(pipeline, { threshold = 242 } = {}) {
  const { data, info } = await pipeline.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const pixels = Buffer.from(data);

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const alpha = pixels[i + 3];

    if (r >= threshold && g >= threshold && b >= threshold) {
      pixels[i + 3] = 0;
      continue;
    }

    const minChannel = Math.min(r, g, b);
    const edgeStart = threshold - 28;
    if (minChannel >= edgeStart) {
      const fade = Math.round(((minChannel - edgeStart) / 28) * alpha);
      pixels[i + 3] = Math.max(0, alpha - fade);
    }
  }

  return sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  });
}

async function buildTransparentLogo(source) {
  const processed = await removeNearWhiteBackground(
    sharp(source).resize(960, null, { withoutEnlargement: true, fit: "inside" })
  );

  return processed
    .trim({ threshold: 12 })
    .png({ compressionLevel: 9, quality: 92 })
    .toBuffer();
}

async function buildTransparentIcon(source) {
  const meta = await sharp(source).metadata();
  const width = meta.width ?? 1024;
  const height = meta.height ?? 440;

  const iconLeft = Math.round(width * 0.58);
  const iconTop = Math.round(height * 0.04);
  const iconWidth = Math.round(width * 0.38);
  const iconHeight = Math.round(height * 0.62);

  const processed = await removeNearWhiteBackground(
    sharp(source).extract({
      left: iconLeft,
      top: iconTop,
      width: Math.min(iconWidth, width - iconLeft),
      height: Math.min(iconHeight, height - iconTop),
    })
  );

  return processed
    .trim({ threshold: 12 })
    .resize(512, 512, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9, quality: 92 })
    .toBuffer();
}

const sourceArg = process.argv[2];
const source = sourceArg
  ? path.resolve(sourceArg)
  : path.join(imagesDir, "logo.png");

const fullLogo = await buildTransparentLogo(source);
await sharp(fullLogo).toFile(path.join(imagesDir, "logo.png"));

const iconLogo = await buildTransparentIcon(source);
await sharp(iconLogo).toFile(path.join(imagesDir, "logo-icon.png"));

const fullMeta = await sharp(fullLogo).metadata();
const iconMeta = await sharp(iconLogo).metadata();

console.log(`Saved logo.png (${fullMeta.width}x${fullMeta.height}) with transparent background`);
console.log(`Saved logo-icon.png (${iconMeta.width}x${iconMeta.height}) with transparent background`);
