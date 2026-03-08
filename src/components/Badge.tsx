import { getKeywordIcon } from "../lib/keywords";

interface BadgeProps {
  label: string;
  showLabel?: boolean;
}

function Badge({ label: keyword, showLabel = true }: BadgeProps) {
  const icon = getKeywordIcon(keyword);

  return (
    <span className="badge">
      {icon.type === "emoji" ? (
        icon.value
      ) : (
        <img className="icon-img" src={icon.value} alt={keyword} />
      )}
      {showLabel && " " + keyword}
    </span>
  );
}

export default Badge;
