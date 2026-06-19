import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

import { Badge, statusToVariant } from "../../components/UI/Badge";
import { Button } from "../../components/UI/Button";
import { Card } from "../../components/UI/Card";
import { IconPlus } from "../../components/icons";
import { ORDER_STATUS_LABELS, PATIENT_STATUS_LABELS } from "../../types";

export default function PatientQueue() {
  const navigate = useNavigate();
  const { data: patients } = useQuery({
    queryKey: ["patients"],
    queryFn: api.getPatients,
  });
  const { data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: api.getOrders,
  });

  if (!patients || !orders) return null;

  // New patients needing their first investigation order
  const newPatients = patients.filter((p) => p.status === "REGISTRATION_PAID");

  // Returning patients with existing orders that can receive additional tests
  const returningPatients = patients.filter(
    (p) =>
      [
        "TESTS_COMPLETED",
        "IN_LAB",
        "IN_RADIOLOGY",
        "PAYMENT_CONFIRMED",
      ].includes(p.status) && orders.some((o) => o.patientId === p.id),
  );

  const getPatientOrder = (patientId: number) =>
    orders.find((o) => o.patientId === patientId);

  const getOrderSummary = (patientId: number) => {
    const order = getPatientOrder(patientId);
    if (!order) return null;
    const completed = order.tests.filter(
      (t) => t.status === "COMPLETED",
    ).length;
    const total = order.tests.length;
    return { order, completed, total };
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
          Patient Queue
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {newPatients.length + returningPatients.length} patients waiting
        </p>
      </div>

      {/* New Patients */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          New Patients — Awaiting Investigation Order
        </h2>
        {newPatients.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-500 text-center py-6">
              No new patients in queue
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {newPatients.map((p) => (
              <Card
                key={p.id}
                className="hover:border-brand-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {p.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      ID: {p.id} · {p.age}y · {p.gender} · {p.bloodGroup}
                    </p>
                  </div>
                  <Badge variant={statusToVariant(p.status)}>
                    {PATIENT_STATUS_LABELS[p.status]}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500 mb-4">
                  {p.phone} · {p.address}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      navigate(`/opd/investigations?patientId=${p.id}`)
                    }
                  >
                    <IconPlus className="w-4 h-4" />
                    Create Investigation Order
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Returning Patients */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Returning Patients — Additional Tests or Prescription
        </h2>
        {returningPatients.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-500 text-center py-6">
              No returning patients
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {returningPatients.map((p) => {
              const summary = getOrderSummary(p.id);
              if (!summary) return null;
              const { order, completed, total } = summary;
              return (
                <Card
                  key={p.id}
                  className="hover:border-brand-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        {p.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        ID: {p.id} · {p.age}y · {p.gender}
                      </p>
                    </div>
                    <Badge variant={statusToVariant(p.status)}>
                      {PATIENT_STATUS_LABELS[p.status]}
                    </Badge>
                  </div>

                  {/* Order summary */}
                  <div className="bg-slate-50 rounded-lg p-3 mb-3 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-500">Order #{order.id}</span>
                      <Badge variant={statusToVariant(order.status)}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </div>
                    <p className="text-slate-600">
                      Tests: {completed}/{total} completed
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {order.tests.map((t) => (
                        <span
                          key={t.testId}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                            t.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700"
                              : t.status === "IN_PROGRESS"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              t.status === "COMPLETED"
                                ? "bg-emerald-500"
                                : t.status === "IN_PROGRESS"
                                  ? "bg-amber-500"
                                  : "bg-slate-400"
                            }`}
                          />
                          {t.testName.length > 30
                            ? t.testName.substring(0, 30) + "..."
                            : t.testName}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mb-4">
                    {p.phone} · {p.address}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigate(`/opd/investigations?orderId=${order.id}`)
                      }
                    >
                      <IconPlus className="w-4 h-4" />
                      Add Tests
                    </Button>
                    {p.status === "TESTS_COMPLETED" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          navigate(`/opd/prescriptions?patientId=${p.id}`)
                        }
                      >
                        Create Prescription
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
