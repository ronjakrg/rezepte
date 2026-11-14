const DIR = "/data/images";

export function getImageUrl(filename: string): string {
  return `${DIR}/${filename}`;
}

export const fallback = `${DIR}/example.png`;

// Center-crops an image file to a square JPEG data URL (max `size` px)
export async function cropToSquare(file: File, size = 800): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const out = Math.min(side, size);

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = out;
  canvas
    .getContext("2d")!
    .drawImage(
      bitmap,
      (bitmap.width - side) / 2,
      (bitmap.height - side) / 2,
      side,
      side,
      0,
      0,
      out,
      out,
    );
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}

const images = new Proxy({} as Record<string, string>, {
  get(_target, prop: string) {
    if (!prop || prop === "undefined" || prop === "null") return fallback;
    return `${DIR}/${prop}`;
  },
});

export default images;
