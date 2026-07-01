import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  IconClipboard,
  IconClock,
  IconFlask,
  IconPayment,
  IconScan,
  IconUsers,
} from "../components/icons";
import { Badge, statusToVariant } from "../components/UI/Badge";
import { Card } from "../components/UI/Card";
import { usePermissions } from "../hooks/usePermissions";
import { api } from "../services/api";
import { ORDER_STATUS_LABELS, PATIENT_STATUS_LABELS } from "../types";

const PIE_COLORS = [
  "#0d9488",
  "#0ea5e9",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#6b7280",
  "#10b981",
  "#ec4899",
  "#f97316",
  "#6366f1",
];

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1 font-[family-name:var(--font-display)]">
            {value}
          </p>
        </div>
        <div
          className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { isAdmin, isReception, isOpd, isLab, isRadiology } = usePermissions();
  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: api.getStats,
  });
  const { data: patients } = useQuery({
    queryKey: ["patients"],
    queryFn: api.getPatients,
  });
  const { data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: api.getOrders,
  });

  if (!stats || !patients || !orders)
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-slate-200 rounded-xl" />
        <div className="h-24 bg-slate-200 rounded-xl" />
      </div>
    );

  const pieData = Object.entries(stats.patientsByStatus || {})
    .map(([status, count]) => ({
      name:
        PATIENT_STATUS_LABELS[status as keyof typeof PATIENT_STATUS_LABELS] ||
        status,
      value: count as number,
    }))
    .filter((d) => d.value > 0);

  const recentPatients = [...patients].sort((a, b) => b.id - a.id).slice(0, 5);
  const recentOrders = [...orders].sort((a, b) => b.id - a.id).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
          Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Overview of clinic operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isReception && (
          <>
            <StatCard
              label="Total Patients"
              value={stats.totalPatients}
              icon={<IconUsers className="w-5 h-5 text-brand-600" />}
              color="bg-brand-50"
            />
            <StatCard
              label="Pending Payments"
              value={stats.pendingPayments}
              icon={<IconPayment className="w-5 h-5 text-amber-600" />}
              color="bg-amber-50"
            />
          </>
        )}
        {isOpd && (
          <>
            <StatCard
              label="OPD Queue"
              value={stats.inOpdQueue}
              icon={<IconClipboard className="w-5 h-5 text-violet-600" />}
              color="bg-violet-50"
            />
            <StatCard
              label="Pending Results"
              value={stats.ordersInProgress}
              icon={<IconClock className="w-5 h-5 text-sky-600" />}
              color="bg-sky-50"
            />
          </>
        )}
        {isLab && (
          <StatCard
            label="In Lab"
            value={stats.inLab}
            icon={<IconFlask className="w-5 h-5 text-brand-600" />}
            color="bg-brand-50"
          />
        )}
        {isRadiology && (
          <StatCard
            label="In Radiology"
            value={stats.inRadiology}
            icon={<IconScan className="w-5 h-5 text-violet-600" />}
            color="bg-violet-50"
          />
        )}
        {isAdmin && (
          <>
            <StatCard
              label="Total Patients"
              value={stats.totalPatients}
              icon={<IconUsers className="w-5 h-5 text-brand-600" />}
              color="bg-brand-50"
            />
            <StatCard
              label="Total Revenue"
              value={`ETB ${stats.totalRevenue.toLocaleString()}`}
              icon={<IconPayment className="w-5 h-5 text-emerald-600" />}
              color="bg-emerald-50"
            />
            <StatCard
              label="Active Orders"
              value={stats.ordersInProgress}
              icon={<IconClipboard className="w-5 h-5 text-violet-600" />}
              color="bg-violet-50"
            />
            <StatCard
              label="Lab Results"
              value={stats.totalLabResults}
              icon={<IconFlask className="w-5 h-5 text-sky-600" />}
              color="bg-sky-50"
            />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Status Distribution */}
        <Card>
          <h3 className="text-sm font-semibold text-slate-900 mb-4 font-[family-name:var(--font-display)]">
            Patients by Status
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {pieData.map((d, i) => (
              <div
                key={d.name}
                className="flex items-center gap-1.5 text-xs text-slate-600"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </Card>

        {/* Revenue by Payment Type */}
        <Card>
          <h3 className="text-sm font-semibold text-slate-900 mb-4 font-[family-name:var(--font-display)]">
            Revenue Overview
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Registration", value: patients.length * 100 },
                  {
                    name: "Investigations",
                    value: orders.reduce((s, o) => s + o.totalPrice, 0),
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  stroke="#94a3b8"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [
                    `ETB ${Number(value).toLocaleString()}`,
                    "Amount",
                  ]}
                />
                <Bar dataKey="value" fill="#0d9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Patients */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 font-[family-name:var(--font-display)]">
              Recent Patients
            </h3>
            <Link
              to="/reception/patients"
              className="text-xs text-brand-600 hover:text-brand-700 font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentPatients.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-500">
                    ID: {p.id} · {p.age}y · {p.gender}
                  </p>
                </div>
                <Badge variant={statusToVariant(p.status)}>
                  {PATIENT_STATUS_LABELS[p.status]}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Orders */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 font-[family-name:var(--font-display)]">
              Recent Orders
            </h3>
            <Link
              to="/opd/investigations"
              className="text-xs text-brand-600 hover:text-brand-700 font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((o) => {
              const patient = patients.find((p) => p.id === o.patientId);
              return (
                <div
                  key={o.id}
                  className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {patient?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Order #{o.id} · {o.tests.length} tests · ETB{" "}
                      {o.totalPrice}
                    </p>
                  </div>
                  <Badge variant={statusToVariant(o.status)}>
                    {ORDER_STATUS_LABELS[o.status]}
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
