import { existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

export interface ImageMeta {
  width: number;
  height: number;
  /** MIME type, e.g. image/jpeg. */
  type: string;
}

const MIME: Record<string, string> = {
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  svg: "image/svg+xml",
};

const cache = new Map<string, Promise<ImageMeta | undefined>>();

/**
 * Dimensions and type of an image under public/, by its site-root path
 * (e.g. /images/foo.jpg). Read at build time and cached per path.
 *
 * Facebook needs the dimensions up front: without og:image:width/height its
 * crawler fetches the image asynchronously and the first share of a URL
 * renders with no image at all.
 */
export function publicImageMeta(sitePath: string): Promise<ImageMeta | undefined> {
  let pending = cache.get(sitePath);
  if (!pending) {
    pending = readMeta(sitePath);
    cache.set(sitePath, pending);
  }
  return pending;
}

async function readMeta(sitePath: string): Promise<ImageMeta | undefined> {
  const file = join(process.cwd(), "public", decodeURI(sitePath));
  if (!existsSync(file)) {
    console.warn(`[images] ${sitePath} is not in public/; no og:image dimensions for it.`);
    return undefined;
  }
  try {
    const { width, height, format } = await sharp(file).metadata();
    if (!width || !height || !format) return undefined;
    return { width, height, type: MIME[format] ?? `image/${format}` };
  } catch (error) {
    console.warn(`[images] could not read ${sitePath}: ${(error as Error).message}`);
    return undefined;
  }
}
