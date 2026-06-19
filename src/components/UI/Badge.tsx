type Variant = "default" | "success" | "warning" | "danger" | "info" | "purple";

const styles: Record<Variant, string> = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  danger: "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20",
  info: "bg-sky-50 text-sky-700 ring-1 ring-sky-600/20",
  purple: "bg-violet-50 text-violet-700 ring-1 ring-violet-600/20",
};

interface Props {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className = "",
}: Props) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function statusToVariant(status: string): Variant {
  const map: Record<string, Variant> = {
    REGISTERED: "default",
    REGISTRATION_PAID: "info",
    IN_OPD: "purple",
    PENDING_PAYMENT: "warning",
    PAYMENT_CONFIRMED: "info",
    IN_LAB: "purple",
    IN_RADIOLOGY: "purple",
    IN_PROGRESS: "purple",
    TESTS_COMPLETED: "success",
    RESULTS_READY: "success",
    PRESCRIBED: "success",
    COMPLETED: "success",
    PAID: "success",
    PENDING: "warning",
  };
  return map[status] || "default";
}
