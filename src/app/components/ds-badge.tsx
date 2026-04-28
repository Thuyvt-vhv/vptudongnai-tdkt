import { HTMLAttributes, ReactNode } from "react";

export type BadgeVariant =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "gold"
  | "info"
  | "outline"
  | "dark"
  | "gold-solid";

export type BadgeSize = "sm" | "md";

export interface DsBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Phong cách màu sắc */
  variant?: BadgeVariant;
  /** Kích thước */
  size?: BadgeSize;
  /** Hiển thị chấm tròn trước text */
  dot?: boolean;
  /** Nội dung badge */
  children: ReactNode;
}

export function DsBadge({
  variant = "neutral",
  size = "md",
  dot = false,
  children,
  className = "",
  ...rest
}: DsBadgeProps) {
  const cls = [
    "badge",
    `badge-${size}`,
    `badge-${variant}`,
    dot ? "badge-dot" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={cls} {...rest}>
      {children}
    </span>
  );
}
