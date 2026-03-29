const DIR = "/data/images";

export function getImageUrl(filename: string): string {
  return `${DIR}/${filename}`;
}

export const fallback = `${DIR}/example.png`;

const images = new Proxy({} as Record<string, string>, {
  get(_target, prop: string) {
    if (!prop || prop === "undefined" || prop === "null") return fallback;
    return `${DIR}/${prop}`;
  },
});

export default images;
