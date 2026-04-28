import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface BaseProps {
  /** Field id — used for label htmlFor and input id */
  id: string;
  label: string;
  /** Validation error message from React Hook Form */
  error?: string;
  className?: string;
}

interface InputProps extends BaseProps {
  as?: "input";
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
}

interface TextareaProps extends BaseProps {
  as: "textarea";
  inputProps?: TextareaHTMLAttributes<HTMLTextAreaElement>;
}

type FormFieldProps = InputProps | TextareaProps;

/**
 * FormField molecule — Label + Input/Textarea + error message.
 * All form fields must use this component. No raw <input> tags outside atoms/.
 * Receives all data via props, emits actions via inputProps callbacks.
 */
export function FormField({ id, label, error, className, ...rest }: FormFieldProps) {
  const baseInputClass = cn(
    "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors",
    "focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring",
    error ? "border-destructive" : "border-border",
    className,
  );

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>

      {rest.as === "textarea" ? (
        <textarea
          id={id}
          className={cn(baseInputClass, "resize-none")}
          aria-invalid={error !== undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...rest.inputProps}
        />
      ) : (
        <input
          id={id}
          className={baseInputClass}
          aria-invalid={error !== undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...(rest as InputProps).inputProps}
        />
      )}

      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
