import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  IconCalendar,
  IconClipboard,
  IconFlask,
  IconPayment,
  IconPill,
  IconScan,
  IconSearch,
  IconUsers,
} from "../../components/icons";
import { Badge, statusToVariant } from "../../components/UI/Badge";
import { Card, CardHeader, CardTitle } from "../../components/UI/Card";
import { Input } from "../../components/UI/Input";
import { api } from "../../services/api";
import { ORDER_STATUS_LABELS, PATIENT_STATUS_LABELS } from "../../types";

export default function PatientHistory() {
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get("patientId");

  const [search, setSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState(
    preselectedId || "",
  );
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );

  const { data: patients } = useQuery({
    queryKey: ["patients"],
    queryFn: api.getPatients,
  });
  const { data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: api.getOrders,
    enabled: !!selectedPatientId,
  });
  const { data: labResults } = useQuery({
    queryKey: ["labResults"],
    queryFn: api.getLabResults,
    enabled: !!selectedPatientId,
  });
  const { data: radioResults } = useQuery({
    queryKey: ["radioResults"],
    queryFn: api.getRadiologyResults,
    enabled: !!selectedPatientId,
  });
  const { data: prescriptions } = useQuery({
    queryKey: ["prescriptions"],
    queryFn: api.getPrescriptions,
    enabled: !!selectedPatientId,
  });
  const { data: payments } = useQuery({
    queryKey: ["payments"],
    queryFn: api.getPayments,
    enabled: !!selectedPatientId,
  });

  const patient = patients?.find((p) => p.id === Number(selectedPatientId));

  // Filter everything by selected date
  const isSameDate = (dateStr: string) =>
    dateStr.split("T")[0] === selectedDate;

  const dayOrders = useMemo(
    () =>
      orders?.filter(
        (o) =>
          o.patientId === Number(selectedPatientId) && isSameDate(o.createdAt),
      ) || [],
    [orders, selectedPatientId, selectedDate],
  );

  const dayLabResults = useMemo(
    () =>
      labResults?.filter(
        (r) =>
          r.patientId === Number(selectedPatientId) && isSameDate(r.createdAt),
      ) || [],
    [labResults, selectedPatientId, selectedDate],
  );

  const dayRadioResults = useMemo(
    () =>
      radioResults?.filter(
        (r) =>
          r.patientId === Number(selectedPatientId) && isSameDate(r.createdAt),
      ) || [],
    [radioResults, selectedPatientId, selectedDate],
  );

  const dayPrescriptions = useMemo(
    () =>
      prescriptions?.filter(
        (p) =>
          p.patientId === Number(selectedPatientId) && isSameDate(p.createdAt),
      ) || [],
    [prescriptions, selectedPatientId, selectedDate],
  );

  const dayPayments = useMemo(
    () =>
      payments?.filter(
        (p) =>
          p.patientId === Number(selectedPatientId) && isSameDate(p.createdAt),
      ) || [],
    [payments, selectedPatientId, selectedDate],
  );

  // Patient search results
  const searchResults =
    patients?.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toString().includes(search) ||
        p.phone.includes(search),
    ) || [];

  const hasData =
    dayOrders.length > 0 ||
    dayLabResults.length > 0 ||
    dayRadioResults.length > 0 ||
    dayPrescriptions.length > 0 ||
    dayPayments.length > 0;

  // Get all unique dates that have activity for this patient
  const activeDates = useMemo(() => {
    if (!orders && !labResults && !radioResults && !prescriptions && !payments)
      return [];
    const dateSet = new Set<string>();
    orders
      ?.filter((o) => o.patientId === Number(selectedPatientId))
      .forEach((o) => dateSet.add(o.createdAt.split("T")[0]));
    labResults
      ?.filter((r) => r.patientId === Number(selectedPatientId))
      .forEach((r) => dateSet.add(r.createdAt.split("T")[0]));
    radioResults
      ?.filter((r) => r.patientId === Number(selectedPatientId))
      .forEach((r) => dateSet.add(r.createdAt.split("T")[0]));
    prescriptions
      ?.filter((p) => p.patientId === Number(selectedPatientId))
      .forEach((p) => dateSet.add(p.createdAt.split("T")[0]));
    payments
      ?.filter((p) => p.patientId === Number(selectedPatientId))
      .forEach((p) => dateSet.add(p.createdAt.split("T")[0]));
    return [...dateSet].sort().reverse();
  }, [
    orders,
    labResults,
    radioResults,
    prescriptions,
    payments,
    selectedPatientId,
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
          Patient History
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          View tests and records by date
        </p>
      </div>

      {/* Patient Search & Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Find Patient</CardTitle>
          <IconUsers className="w-5 h-5 text-brand-600" />
        </CardHeader>

        {patient ? (
          <div className="space-y-4">
            <div className="bg-brand-50 rounded-lg p-4 border border-brand-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900 text-lg">
                    {patient.name}
                  </p>
                  <p className="text-sm text-slate-600">
                    ID: {patient.id} · {patient.age}y · {patient.gender} ·{" "}
                    {patient.bloodGroup}
                  </p>
                  <p className="text-sm text-slate-500">
                    {patient.phone} · {patient.address}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusToVariant(patient.status)}>
                    {PATIENT_STATUS_LABELS[patient.status]}
                  </Badge>
                  <button
                    onClick={() => {
                      setSelectedPatientId("");
                      setSearch("");
                    }}
                    className="text-xs text-slate-500 hover:text-rose-600 underline transition-colors"
                  >
                    Change Patient
                  </button>
                </div>
              </div>
            </div>

            {/* Date Navigation */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <IconCalendar className="w-4 h-4 text-slate-400" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-auto"
                />
              </div>

              {/* Quick date chips for days with activity */}
              {activeDates.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {activeDates.slice(0, 7).map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDate(d)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        selectedDate === d
                          ? "bg-brand-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {new Date(d + "T00:00:00").toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, ID, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                autoFocus
              />
            </div>

            {search.length > 0 && (
              <div className="border border-slate-200 rounded-lg max-h-72 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6">
                    No patients found
                  </p>
                ) : (
                  searchResults.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPatientId(p.id.toString());
                        setSearch("");
                      }}
                      className="w-full flex items-center justify-between p-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors text-left"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {p.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          ID: {p.id} · {p.age}y · {p.gender} · {p.phone}
                        </p>
                      </div>
                      <Badge variant={statusToVariant(p.status)}>
                        {PATIENT_STATUS_LABELS[p.status]}
                      </Badge>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* History Content */}
      {patient && (
        <>
          {!hasData ? (
            <Card>
              <div className="text-center py-12">
                <IconCalendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-1">
                  No Records for This Date
                </h3>
                <p className="text-sm text-slate-500">
                  No tests, results, or prescriptions found on{" "}
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
                {activeDates.length > 0 && (
                  <p className="text-xs text-slate-400 mt-2">
                    Try:{" "}
                    {activeDates
                      .map((d) =>
                        new Date(d + "T00:00:00").toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        }),
                      )
                      .join(" · ")}
                  </p>
                )}
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Payments */}
              {dayPayments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Payments</CardTitle>
                    <IconPayment className="w-5 h-5 text-emerald-600" />
                  </CardHeader>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-2">
                            ID
                          </th>
                          <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-2">
                            Type
                          </th>
                          <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-2">
                            Amount
                          </th>
                          <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-2">
                            Status
                          </th>
                          <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-2">
                            Time
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {dayPayments.map((p) => (
                          <tr key={p.id} className="border-b border-slate-50">
                            <td className="py-2.5 text-sm font-mono text-slate-600">
                              PAY-{p.id}
                            </td>
                            <td className="py-2.5 text-sm text-slate-700">
                              <Badge
                                variant={
                                  p.type === "registration" ? "info" : "purple"
                                }
                              >
                                {p.type === "registration"
                                  ? "Registration"
                                  : "Investigation"}
                              </Badge>
                            </td>
                            <td className="py-2.5 text-sm font-semibold text-slate-900">
                              ETB {p.amount}
                            </td>
                            <td className="py-2.5">
                              <Badge
                                variant={
                                  p.status === "PAID" ? "success" : "warning"
                                }
                              >
                                {p.status}
                              </Badge>
                            </td>
                            <td className="py-2.5 text-sm text-slate-500">
                              {new Date(p.createdAt).toLocaleTimeString(
                                "en-US",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-slate-200">
                          <td
                            colSpan={2}
                            className="pt-2 text-sm font-semibold text-slate-700"
                          >
                            Total Collected
                          </td>
                          <td className="pt-2 text-sm font-bold text-emerald-700">
                            ETB{" "}
                            {dayPayments
                              .filter((p) => p.status === "PAID")
                              .reduce((s, p) => s + p.amount, 0)}
                          </td>
                          <td colSpan={2} />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </Card>
              )}

              {/* Investigation Orders */}
              {dayOrders.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Investigation Orders</CardTitle>
                    <IconClipboard className="w-5 h-5 text-violet-600" />
                  </CardHeader>
                  <div className="space-y-4">
                    {dayOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-mono text-slate-500">
                              #{order.id}
                            </span>
                            <Badge variant={statusToVariant(order.status)}>
                              {ORDER_STATUS_LABELS[order.status]}
                            </Badge>
                          </div>
                          <span className="text-sm font-bold text-slate-900">
                            ETB {order.totalPrice}
                          </span>
                        </div>
                        {order.opdNotes && (
                          <p className="text-sm text-slate-500 mb-3 italic">
                            "{order.opdNotes}"
                          </p>
                        )}
                        <div className="space-y-2">
                          {order.tests.map((t) => (
                            <div
                              key={t.testId}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    t.status === "COMPLETED"
                                      ? "bg-emerald-500"
                                      : t.status === "IN_PROGRESS"
                                        ? "bg-amber-500"
                                        : "bg-slate-300"
                                  }`}
                                />
                                <span className="text-slate-700">
                                  {t.testName}
                                </span>
                                <span className="text-xs text-slate-400">
                                  ({t.type})
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-slate-500">
                                  ETB {t.price}
                                </span>
                                <Badge
                                  variant={statusToVariant(
                                    t.status === "COMPLETED"
                                      ? "COMPLETED"
                                      : t.status === "IN_PROGRESS"
                                        ? "IN_PROGRESS"
                                        : "PENDING",
                                  )}
                                >
                                  {t.status === "COMPLETED"
                                    ? "Done"
                                    : t.status === "IN_PROGRESS"
                                      ? "In Progress"
                                      : "Pending"}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Lab Results */}
              {dayLabResults.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Lab Results</CardTitle>
                    <IconFlask className="w-5 h-5 text-brand-600" />
                  </CardHeader>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-2">
                            Test
                          </th>
                          <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-2">
                            Result
                          </th>
                          <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-2">
                            Reference
                          </th>
                          <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-2">
                            Time
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {dayLabResults.map((r) => {
                          // Check if value is abnormal
                          const isAbnormal =
                            r.referenceRange &&
                            r.referenceRange !== "-" &&
                            r.referenceRange !== "Normal" &&
                            r.value !== "Normal" &&
                            !r.referenceRange.includes(
                              r.value.replace(" × 10⁶", ""),
                            );
                          return (
                            <tr
                              key={r.id}
                              className={`border-b border-slate-50 ${isAbnormal ? "bg-rose-50/50" : ""}`}
                            >
                              <td className="py-2.5 text-sm text-slate-900 font-medium">
                                {r.testName}
                              </td>
                              <td
                                className={`py-2.5 text-sm font-semibold ${isAbnormal ? "text-rose-700" : "text-slate-900"}`}
                              >
                                {r.value} {r.unit}
                                {isAbnormal && (
                                  <span className="ml-2 text-xs text-rose-500">
                                    ABNORMAL
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 text-sm text-slate-500">
                                {r.referenceRange}
                              </td>
                              <td className="py-2.5 text-sm text-slate-500">
                                {new Date(r.createdAt).toLocaleTimeString(
                                  "en-US",
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {/* Radiology Results */}
              {dayRadioResults.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Radiology Results</CardTitle>
                    <IconScan className="w-5 h-5 text-violet-600" />
                  </CardHeader>
                  <div className="space-y-4">
                    {dayRadioResults.map((r) => (
                      <div
                        key={r.id}
                        className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-slate-900">
                            {r.testName}
                          </h4>
                          <span className="text-xs text-slate-500">
                            {new Date(r.createdAt).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                              Findings
                            </p>
                            <p className="text-sm text-slate-700">
                              {r.findings}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                              Impression
                            </p>
                            <p className="text-sm font-medium text-slate-900">
                              {r.impression}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Prescriptions */}
              {dayPrescriptions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Prescriptions</CardTitle>
                    <IconPill className="w-5 h-5 text-brand-600" />
                  </CardHeader>
                  <div className="space-y-4">
                    {dayPrescriptions.map((rx) => (
                      <div
                        key={rx.id}
                        className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-mono text-slate-500">
                            RX-{rx.id}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(rx.createdAt).toLocaleTimeString(
                              "en-US",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-slate-200">
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-2">
                                  Medicine
                                </th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-2">
                                  Dosage
                                </th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-2">
                                  Frequency
                                </th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-2">
                                  Duration
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {rx.medicines.map((m, i) => (
                                <tr
                                  key={i}
                                  className="border-b border-slate-100 last:border-0"
                                >
                                  <td className="py-2 text-sm font-medium text-slate-900">
                                    {m.name}
                                  </td>
                                  <td className="py-2 text-sm text-slate-600">
                                    {m.dosage}
                                  </td>
                                  <td className="py-2 text-sm text-slate-600">
                                    {m.frequency}
                                  </td>
                                  <td className="py-2 text-sm text-slate-600">
                                    {m.duration}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {rx.notes && (
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                              Doctor's Notes
                            </p>
                            <p className="text-sm text-slate-700">{rx.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
