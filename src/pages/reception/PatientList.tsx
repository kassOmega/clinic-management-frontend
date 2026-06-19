import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconEye, IconSearch } from "../../components/icons";
import { Badge, statusToVariant } from "../../components/UI/Badge";
import { Card } from "../../components/UI/Card";
import { api } from "../../services/api";
import { PATIENT_STATUS_LABELS } from "../../types";

export default function PatientList() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { data: patients } = useQuery({
    queryKey: ["patients"],
    queryFn: api.getPatients,
  });

  if (!patients) return null;

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toString().includes(search) ||
      p.phone.includes(search),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
          Patient List
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {patients.length} total patients registered
        </p>
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-sm">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  ID
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  Name
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  Age/Gender
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  Phone
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  Blood
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  Registered
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-mono text-slate-900">
                    {p.id}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {p.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {p.age}y / {p.gender}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {p.phone}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {p.bloodGroup}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusToVariant(p.status)}>
                      {PATIENT_STATUS_LABELS[p.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {new Date(p.registrationDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        navigate(`/reception/history?patientId=${p.id}`)
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
                    >
                      <IconEye className="w-3.5 h-3.5" />
                      History
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    No patients found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
