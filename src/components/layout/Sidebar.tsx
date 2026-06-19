import { NavLink } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";
import {
  IconChart,
  IconClipboard,
  IconClock,
  IconDashboard,
  IconFlask,
  IconList,
  IconPayment,
  IconPill,
  IconPlus,
  IconScan,
  IconTestTube,
  IconUsers,
  IconX,
} from "../icons";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  permission?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
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
    to: "/reception/history",
    label: "Patient History",
    icon: <IconClock />,
    permission: "view_patient_history",
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
    to: "/pharmacy/prescriptions",
    label: "Prescriptions",
    icon: <IconPill />,
    permission: "dispense_medicine",
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

export function Sidebar({ open, onClose }: Props) {
  const { hasPermission } = usePermissions();
  const items = allNavItems.filter(
    (item) => !item.permission || hasPermission(item.permission),
  );

  return (
    <>
      {/* Desktop sidebar — always visible at lg+ */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-slate-900 lg:flex lg:flex-col lg:z-40">
        <SidebarContent items={items} />
      </aside>

      {/* Mobile sidebar — slides in/out */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-slate-900 flex flex-col z-50 lg:hidden transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
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
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close sidebar"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items — close on tap */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
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

        <div className="p-4 border-t border-slate-800">
          <p className="text-slate-600 text-xs text-center">MedFlow v1.0.0</p>
        </div>
      </aside>
    </>
  );
}

/* Shared inner content for desktop sidebar */
function SidebarContent({ items }: { items: NavItem[] }) {
  return (
    <>
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

      <div className="p-4 border-t border-slate-800">
        <p className="text-slate-600 text-xs text-center">MedFlow v1.0.0</p>
      </div>
    </>
  );
}
