interface SiteSettingsFieldProps {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}

export function SiteSettingsField({ label, id, error, children }: SiteSettingsFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
