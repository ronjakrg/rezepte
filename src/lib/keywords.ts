import ovenIcon from "../assets/oven.png";

export interface KeywordIcon {
  type: "emoji" | "image";
  value: string;
}

const keywordIcons: Record<string, KeywordIcon> = {
  Auflauf: { type: "emoji", value: "🍲" },
  Frühstück: { type: "emoji", value: "☕️" },
  Ofen: { type: "image", value: ovenIcon },
  "One-Pot": { type: "emoji", value: "🥘" },
  "One-Pot Gericht": { type: "emoji", value: "🥘" },
  Pasta: { type: "emoji", value: "🍝" },
  Pfanne: { type: "emoji", value: "🍳" },
  Reis: { type: "emoji", value: "🍚" },
  Schnell: { type: "emoji", value: "⚡" },
  Sonstiges: { type: "emoji", value: "🍴" },
};

const fallback: KeywordIcon = { type: "emoji", value: "🏷️" };

export function getKeywordIcon(keyword: string): KeywordIcon {
  return keywordIcons[keyword] ?? fallback;
}
