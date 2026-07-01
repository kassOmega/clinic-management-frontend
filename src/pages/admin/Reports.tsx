import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardHeader, CardTitle } from "../../components/UI/Card";
import { api } from "../../services/api";
import { ORDER_STATUS_LABELS, PATIENT_STATUS_LABELS } from "../../types";

const COLORS = [
  "#0d9488",
  "#0ea5e9",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#6b7280",
  "#10b981",
  "#ec4899",
];

export default function Reports() {
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
  const { data: payments } = useQuery({
    queryKey: ["payments"],
    queryFn: api.getPayments,
  });

  if (!stats || !patients || !orders || !payments) return null;

  const statusData = Object.entries(stats.patientsByStatus || {})
    .map(([status, count]) => ({
      name:
        PATIENT_STATUS_LABELS[status as keyof typeof PATIENT_STATUS_LABELS] ||
        status,
      value: count as number,
    }))
    .filter((d) => d.value > 0);

  const orderStatusData = orders.reduce<Record<string, typeof orders>>(
    (acc, o) => {
      (acc[o.status] ??= []).push(o);
      return acc;
    },
    {},
  );

  const orderPieData = Object.entries(orderStatusData).map(([status, os]) => ({
    name:
      ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS] || status,
    value: os.length,
  }));

  const revenueByType = [
    {
      name: "Registration",
      value: payments
        .filter((p) => p.type === "registration" && p.status === "PAID")
        .reduce((s, p) => s + p.amount, 0),
    },
    {
      name: "Investigation",
      value: payments
        .filter((p) => p.type === "investigation" && p.status === "PAID")
        .reduce((s, p) => s + p.amount, 0),
    },
  ];

  const testsByType = [
    {
      name: "Lab",
      value: orders.reduce(
        (s, o) => s + o.tests.filter((t) => t.type === "lab").length,
        0,
      ),
    },
    {
      name: "Radiology",
      value: orders.reduce(
        (s, o) => s + o.tests.filter((t) => t.type === "radiology").length,
        0,
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
          Reports & Analytics
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Comprehensive overview of clinic operations
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-slate-500">Total Patients</p>
          <p className="text-3xl font-bold text-slate-900 mt-1 font-[family-name:var(--font-display)]">
            {stats.totalPatients}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Total Revenue</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1 font-[family-name:var(--font-display)]">
            ETB {stats.totalRevenue.toLocaleString()}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Total Orders</p>
          <p className="text-3xl font-bold text-slate-900 mt-1 font-[family-name:var(--font-display)]">
            {stats.totalOrders}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Pending Payments</p>
          <p className="text-3xl font-bold text-amber-600 mt-1 font-[family-name:var(--font-display)]">
            {stats.pendingPayments}
          </p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Status Distribution</CardTitle>
          </CardHeader>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {orderPieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Type</CardTitle>
          </CardHeader>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByType}>
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

        <Card>
          <CardHeader>
            <CardTitle>Tests by Department</CardTitle>
          </CardHeader>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={testsByType}>
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
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  <Cell fill="#0d9488" />
                  <Cell fill="#8b5cf6" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Payment Summary Table */}
      <Card padding={false}>
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Payment Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                  Metric
                </th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  label: "Total Registration Revenue",
                  value: payments
                    .filter(
                      (p) => p.type === "registration" && p.status === "PAID",
                    )
                    .reduce((s, p) => s + p.amount, 0),
                },
                {
                  label: "Total Investigation Revenue",
                  value: payments
                    .filter(
                      (p) => p.type === "investigation" && p.status === "PAID",
                    )
                    .reduce((s, p) => s + p.amount, 0),
                },
                {
                  label: "Total Collected",
                  value: payments
                    .filter((p) => p.status === "PAID")
                    .reduce((s, p) => s + p.amount, 0),
                },
                {
                  label: "Pending Collection",
                  value: payments
                    .filter((p) => p.status === "PENDING")
                    .reduce((s, p) => s + p.amount, 0),
                },
                { label: "Total Lab Results", value: stats.totalLabResults },
                {
                  label: "Total Radiology Results",
                  value: stats.totalRadioResults,
                },
                {
                  label: "Total Prescriptions",
                  value: stats.totalPrescriptions,
                },
              ].map((row) => (
                <tr key={row.label} className="border-b border-slate-50">
                  <td className="px-6 py-3 text-sm text-slate-700">
                    {row.label}
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-slate-900 text-right">
                    {row.label.includes("Revenue") ||
                    row.label.includes("Collected") ||
                    row.label.includes("Pending Collection")
                      ? `ETB ${row.value.toLocaleString()}`
                      : row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
