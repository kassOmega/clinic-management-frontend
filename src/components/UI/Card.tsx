import type { HTMLAttributes, ReactNode } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: boolean;
}

export function Card({
  children,
  padding = true,
  className = "",
  ...rest
}: Props) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm ${padding ? "p-6" : ""} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={`text-lg font-semibold text-slate-900 font-[family-name:var(--font-display)] ${className}`}
    >
      {children}
    </h3>
  );
}
