import { InputHTMLAttributes, ReactNode, forwardRef, useId } from "react";

type InputSize   = "sm" | "md" | "lg";
type InputStatus = "default" | "error" | "success";

export interface DsInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Nhãn hiển thị phía trên input */
  label?: string;
  /** Thêm dấu * vào label */
  required?: boolean;
  /** Văn bản gợi ý phía dưới */
  hint?: string;
  /** Thông báo lỗi — đồng thời bật trạng thái error */
  error?: string;
  /** Thông báo thành công — đồng thời bật trạng thái success */
  successMsg?: string;
  /** Kích thước */
  size?: InputSize;
  /** Trạng thái input */
  status?: InputStatus;
  /** Icon hoặc node đặt trước input */
  prefix?: ReactNode;
  /** Icon hoặc node đặt sau input */
  suffix?: ReactNode;
  /** Class ngoài cùng (wrapper) */
  rootClassName?: string;
}

export const DsInput = forwardRef<HTMLInputElement, DsInputProps>(
  (
    {
      label,
      required,
      hint,
      error,
      successMsg,
      size = "md",
      status = "default",
      prefix,
      suffix,
      rootClassName = "",
      className = "",
      id,
      disabled,
      ...rest
    },
    ref
  ) => {
    const autoId = useId();
    const inputId = id ?? autoId;

    // Ưu tiên error/successMsg để xác định status
    const resolvedStatus: InputStatus = error ? "error" : successMsg ? "success" : status;

    const inputCls = [
      "ds-input",
      `ds-input-${size}`,
      prefix ? "ds-input-has-prefix" : "",
      suffix ? "ds-input-has-suffix" : "",
      resolvedStatus === "error"   ? "ds-input-error"   : "",
      resolvedStatus === "success" ? "ds-input-success" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={`ds-input-root ${rootClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className={`ds-input-label ${required ? "ds-input-label-required" : ""}`}
          >
            {label}
          </label>
        )}

        <div className="ds-input-wrap">
          {prefix && <span className="ds-input-prefix-icon">{prefix}</span>}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={inputCls}
            {...rest}
          />
          {suffix && <span className="ds-input-suffix-icon">{suffix}</span>}
        </div>

        {/* Messages — thứ tự ưu tiên: error > successMsg > hint */}
        {resolvedStatus === "error" && error && (
          <span className="ds-input-error-msg flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <circle cx="6" cy="6" r="5.25" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M6 3.5v3M6 8.25h.006" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {error}
          </span>
        )}
        {resolvedStatus === "success" && successMsg && (
          <span className="ds-input-success-msg flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <circle cx="6" cy="6" r="5.25" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M3.5 6l1.75 1.75L8.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {successMsg}
          </span>
        )}
        {resolvedStatus === "default" && hint && (
          <span className="ds-input-hint">{hint}</span>
        )}
      </div>
    );
  }
);

DsInput.displayName = "DsInput";
