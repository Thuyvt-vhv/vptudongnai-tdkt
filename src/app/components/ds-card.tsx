import { HTMLAttributes, ReactNode } from "react";

export type CardVariant = "default" | "elevated" | "flat" | "paper";
export type CardPadding = "none" | "sm" | "md" | "lg";

/* ─── Root card ──────────────────────────────────────────────────────────── */

export interface DsCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Phong cách đổ bóng & viền */
  variant?: CardVariant;
  /** Padding toàn bộ card (chỉ dùng khi KHÔNG dùng Header/Body/Footer) */
  padding?: CardPadding;
  /** Bật hiệu ứng hover & active */
  hoverable?: boolean;
  children: ReactNode;
}

export function DsCard({
  variant = "default",
  padding = "none",
  hoverable = false,
  children,
  className = "",
  ...rest
}: DsCardProps) {
  const cls = [
    "ds-card",
    `ds-card-${variant}`,
    padding !== "none" ? `ds-card-p-${padding}` : "",
    hoverable ? "ds-card-hoverable cursor-pointer" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
  compact?: boolean;
  children: ReactNode;
}

/** Phần đầu card — có viền dưới */
function CardHeader({ compact = false, children, className = "", ...rest }: CardSectionProps) {
  return (
    <div
      className={`ds-card-header ${compact ? "ds-card-header-sm" : ""} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Phần thân chính của card */
function CardBody({ compact = false, children, className = "", ...rest }: CardSectionProps) {
  return (
    <div
      className={`ds-card-body ${compact ? "ds-card-body-sm" : ""} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Phần chân card — nền nhạt, có viền trên */
function CardFooter({ compact = false, children, className = "", ...rest }: CardSectionProps) {
  return (
    <div
      className={`ds-card-footer ${compact ? "ds-card-footer-sm" : ""} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Tiêu đề trong Header */
function CardTitle({
  children,
  className = "",
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={`flex-1 min-w-0 ${className}`}
      style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 18 }}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Hành động (buttons) góc phải trong Header hoặc Footer */
function CardActions({
  children,
  className = "",
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={`flex items-center gap-2 shrink-0 ${className}`} {...rest}>
      {children}
    </div>
  );
}

/* ─── Attach sub-components ─────────────────────────────────────────────── */
DsCard.Header  = CardHeader;
DsCard.Body    = CardBody;
DsCard.Footer  = CardFooter;
DsCard.Title   = CardTitle;
DsCard.Actions = CardActions;
