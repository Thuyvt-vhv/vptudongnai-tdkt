import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "dark";
type Size = "sm" | "md" | "lg";

interface DsButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const DsButton = forwardRef<HTMLButtonElement, DsButtonProps>(
  ({ variant = "secondary", size = "md", className = "", type = "button", ...rest }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={`btn btn-${size} btn-${variant} ${className}`}
        {...rest}
      />
    );
  }
);
DsButton.displayName = "DsButton";
