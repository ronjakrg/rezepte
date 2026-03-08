import ovenIcon from "../assets/oven.png";

export interface KeywordIcon {
  type: "emoji" | "image";
  value: string;
}

const keywordIcons: Record<string, KeywordIcon> = {
  "Pfanne": { type: "emoji", value: "🍳" },
  "Pasta": { type: "emoji", value: "🍝" },
  "Reis": { type: "emoji", value: "🍚" },
  "One-Pot": { type: "emoji", value: "🥘" },
  "One-Pot Gericht": { type: "emoji", value: "🥘" },
  "Ofen": { type: "image", value: ovenIcon },
};

const fallback: KeywordIcon = { type: "emoji", value: "🏷️" };

export function getKeywordIcon(keyword: string): KeywordIcon {
  return keywordIcons[keyword] ?? fallback;
}
