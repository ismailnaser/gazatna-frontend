import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, "..", "public", "images");

const sourceArg = process.argv[2];
if (!sourceArg) {
  console.error("Usage: node scripts/process-school-logo.mjs <source-image-path>");
  process.exit(1);
}

const source = path.resolve(sourceArg);

const meta = await sharp(source).metadata();
const width = meta.width ?? 1024;
const height = meta.height ?? 440;

// Full horizontal logo for navbar, footer, PDFs.
const fullLogo = await sharp(source)
  .resize(960, null, { withoutEnlargement: true, fit: "inside" })
  .png({ compressionLevel: 9, quality: 92 })
  .toBuffer();

await sharp(fullLogo).toFile(path.join(imagesDir, "logo.png"));

// Icon mark: top-right emblem area (exclude bottom English line).
const iconLeft = Math.round(width * 0.58);
const iconTop = Math.round(height * 0.04);
const iconWidth = Math.round(width * 0.38);
const iconHeight = Math.round(height * 0.62);

const iconLogo = await sharp(source)
  .extract({
    left: iconLeft,
    top: iconTop,
    width: Math.min(iconWidth, width - iconLeft),
    height: Math.min(iconHeight, height - iconTop),
  })
  .trim({ threshold: 12 })
  .resize(512, 512, {
    fit: "contain",
    background: { r: 255, g: 255, b: 255, alpha: 0 },
  })
  .png({ compressionLevel: 9, quality: 92 })
  .toBuffer();

await sharp(iconLogo).toFile(path.join(imagesDir, "logo-icon.png"));

const fullMeta = await sharp(fullLogo).metadata();
const iconMeta = await sharp(iconLogo).metadata();

console.log(`Saved logo.png (${fullMeta.width}x${fullMeta.height})`);
console.log(`Saved logo-icon.png (${iconMeta.width}x${iconMeta.height})`);
