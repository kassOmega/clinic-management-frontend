import { NavLink } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";
import {
  IconChart,
  IconClipboard,
  IconDashboard,
  IconFlask,
  IconList,
  IconPayment,
  IconPill,
  IconPlus,
  IconScan,
  IconTestTube,
  IconUsers,
} from "../icons";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  permission?: string;
}

const allNavItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: <IconDashboard /> },
  {
    to: "/reception/register",
    label: "Register Patient",
    icon: <IconPlus />,
    permission: "create_patient",
  },
  {
    to: "/reception/patients",
    label: "Patient List",
    icon: <IconList />,
    permission: "view_patient",
  },
  {
    to: "/reception/payments",
    label: "Payments",
    icon: <IconPayment />,
    permission: "process_payment",
  },
  {
    to: "/opd/queue",
    label: "Patient Queue",
    icon: <IconClipboard />,
    permission: "create_investigation_order",
  },
  {
    to: "/opd/investigations",
    label: "Investigations",
    icon: <IconClipboard />,
    permission: "create_investigation_order",
  },
  {
    to: "/opd/prescriptions",
    label: "Prescriptions",
    icon: <IconPill />,
    permission: "create_prescription",
  },
  {
    to: "/lab/orders",
    label: "Lab Orders",
    icon: <IconFlask />,
    permission: "create_lab_result",
  },
  {
    to: "/lab/results",
    label: "Lab Results",
    icon: <IconTestTube />,
    permission: "create_lab_result",
  },
  {
    to: "/radiology/orders",
    label: "Radiology Orders",
    icon: <IconScan />,
    permission: "create_radiology_result",
  },
  {
    to: "/radiology/results",
    label: "Radiology Results",
    icon: <IconScan />,
    permission: "create_radiology_result",
  },
  {
    to: "/admin/users",
    label: "Users",
    icon: <IconUsers />,
    permission: "manage_users",
  },
  {
    to: "/admin/tests",
    label: "Test Catalog",
    icon: <IconTestTube />,
    permission: "manage_tests",
  },
  {
    to: "/admin/reports",
    label: "Reports",
    icon: <IconChart />,
    permission: "view_reports",
  },
];

export function Sidebar() {
  const { hasPermission } = usePermissions();
  const items = allNavItems.filter(
    (item) => !item.permission || hasPermission(item.permission),
  );

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 flex flex-col z-40">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
          <IconFlask className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-sm font-[family-name:var(--font-display)]">
            MedFlow
          </h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-wider">
            Clinic Management
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-600/15 text-brand-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <p className="text-slate-600 text-xs text-center">MedFlow v1.0.0</p>
      </div>
    </aside>
  );
}
