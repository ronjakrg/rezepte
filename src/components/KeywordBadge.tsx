import { getKeywordIcon } from "../lib/keywords";

interface KeywordBadgeProps {
  keyword: string;
  showLabel?: boolean;
}

function KeywordBadge({ keyword, showLabel = true }: KeywordBadgeProps) {
  const icon = getKeywordIcon(keyword);

  return (
    <span className="keyword-badge">
      {icon.type === "emoji" ? (
        icon.value
      ) : (
        <img className="keyword-icon-img" src={icon.value} alt={keyword} />
      )}
      {showLabel && " " + keyword}
    </span>
  );
}

export default KeywordBadge;
