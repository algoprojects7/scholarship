type KpiCardProps = {
  label: string;
  value: string;
  hint?: string;
  accent?: "default" | "warning" | "success" | "danger";
};

const accentStyles = {
  default: "border-admin-border",
  warning: "border-amber-200 bg-amber-50/50",
  success: "border-emerald-200 bg-emerald-50/50",
  danger: "border-red-200 bg-red-50/50",
};

export function KpiCard({
  label,
  value,
  hint,
  accent = "default",
}: KpiCardProps) {
  return (
    <div className={`admin-card p-4 ${accentStyles[accent]}`}>
      <p className="admin-kpi-label">{label}</p>
      <p className="admin-kpi-value mt-1">{value}</p>
      {hint && <p className="mt-1.5 text-2xs text-admin-muted">{hint}</p>}
    </div>
  );
}
