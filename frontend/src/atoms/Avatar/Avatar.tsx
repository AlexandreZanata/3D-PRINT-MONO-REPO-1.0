import { cn } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps {
  /** Image URL — shows initials fallback if not provided */
  src?: string | null;
  /** Full name used to generate initials fallback */
  name: string;
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/**
 * Avatar atom — circular user avatar with image or initials fallback.
 * Supports sm | md | lg sizes.
 */
export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const initials = getInitials(name);

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-secondary text-secondary-foreground font-medium select-none overflow-hidden",
        sizeClasses[size],
        className,
      )}
      aria-label={name}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  );
}
