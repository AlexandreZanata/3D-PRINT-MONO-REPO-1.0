import { useId, useState } from "react";
import { Upload } from "lucide-react";
import { adminUploadImage } from "@/api/uploads.api";
import { isPublicImageRef } from "@/lib/publicImageRef";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring transition-colors";

export interface ImageUrlInputWithUploadProps {
  readonly id: string;
  /** When omitted with `hideLabel`, use `ariaLabel` for the text field. */
  readonly label?: string;
  /** May be undefined before the form is reset or for optional keys. */
  readonly value: string | undefined;
  readonly onChange: (next: string) => void;
  readonly onBlur?: () => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly hideLabel?: boolean;
  readonly ariaLabel?: string;
}

export function ImageUrlInputWithUpload({
  id,
  label,
  value,
  onChange,
  onBlur,
  disabled = false,
  placeholder = "https://… or /api/v1/uploads/…",
  hideLabel = false,
  ariaLabel,
}: ImageUrlInputWithUploadProps) {
  const pickId = useId();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const text = value ?? "";
  const showPreview = text.trim().length > 0 && isPublicImageRef(text);

  return (
    <div className="space-y-2">
      {!hideLabel && label ? (
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          id={id}
          name={id}
          type="text"
          value={text}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled || busy}
          placeholder={placeholder}
          className={cn(inputCls, err && "border-destructive")}
          autoComplete="off"
          aria-label={hideLabel ? (ariaLabel ?? "Image URL") : undefined}
        />
        <label className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-input bg-muted/40 px-3 py-2 text-sm font-medium hover:bg-muted/60 sm:shrink-0">
          <Upload className="h-4 w-4" aria-hidden />
          {busy ? "Uploading…" : "Upload"}
          <input
            id={`${pickId}-file`}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={disabled || busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              setErr(null);
              setBusy(true);
              void adminUploadImage(file)
                .then((url) => onChange(url))
                .catch(() => setErr("Upload failed. Try a smaller JPEG, PNG, or WebP file."))
                .finally(() => setBusy(false));
            }}
          />
        </label>
      </div>
      {err && <p className="text-xs text-destructive">{err}</p>}
      {showPreview ? (
        <div className="overflow-hidden rounded-lg border border-border bg-muted/20 p-2">
          <img
            src={text}
            alt="Preview"
            className="mx-auto max-h-40 w-auto max-w-full object-contain"
          />
        </div>
      ) : null}
    </div>
  );
}
