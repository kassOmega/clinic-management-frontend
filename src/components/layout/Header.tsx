import { useEffect, useRef, useState } from "react";
import { usePermissions } from "../../hooks/usePermissions";
import { ROLE_LABELS } from "../../types";
import { IconChevronDown, IconLogout } from "../icons";

export function Header() {
  const { user, logout } = usePermissions();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!user) return null;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        <h2 className="text-sm text-slate-500">
          {ROLE_LABELS[user.role]} Portal
        </h2>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold">
            {user.name.charAt(0)}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500">{ROLE_LABELS[user.role]}</p>
          </div>
          <IconChevronDown className="w-4 h-4 text-slate-400" />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-slate-200 shadow-lg py-1 z-50">
            <div className="px-4 py-2 border-b border-slate-100">
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <button
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <IconLogout className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
