import { getKeywordIcon } from "../lib/keywords";

interface BadgeProps {
  label: string;
  showLabel?: boolean;
  children?: React.ReactNode;
}

function Badge({ label: keyword, showLabel = true, children }: BadgeProps) {
  const icon = getKeywordIcon(keyword);

  return (
    <span className="badge">
      {icon.type === "emoji" ? (
        icon.value
      ) : (
        <img className="image-as-emoji" src={icon.value} alt={keyword} />
      )}
      {showLabel && " " + keyword}
      {children}
    </span>
  );
}

export default Badge;
