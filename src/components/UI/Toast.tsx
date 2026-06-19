import { useToast } from "../../context/ToastContext";
import { IconCheck, IconX } from "../icons";

const typeStyles: Record<string, string> = {
  success: "bg-emerald-600",
  error: "bg-rose-600",
  warning: "bg-amber-600",
  info: "bg-sky-600",
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${typeStyles[t.type]} text-white px-4 py-3 rounded-xl shadow-lg flex items-start gap-3 animate-[slideIn_0.2s_ease-out]`}
        >
          <IconCheck className="w-5 h-5 mt-0.5 shrink-0" />
          <p className="text-sm flex-1">{t.message}</p>
          <button
            onClick={() => removeToast(t.id)}
            className="shrink-0 hover:opacity-80"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>
      ))}
      <style>{`@keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }`}</style>
    </div>
  );
}
