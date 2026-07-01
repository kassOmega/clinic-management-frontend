import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useNavigate } from "react-router-dom";
import { IconPlus } from "../../components/icons";
import { Badge, statusToVariant } from "../../components/UI/Badge";
import { Button } from "../../components/UI/Button";
import { Card } from "../../components/UI/Card";
import { api } from "../../services/api";
import type { InvestigationOrder, OrderTest, Patient } from "../../types";
import { ORDER_STATUS_LABELS, PATIENT_STATUS_LABELS } from "../../types";

// ── Types ───────────────────────────────────────

interface PatientCardProps {
  patient: Patient;
  order?: InvestigationOrder;
  onAction?: () => void;
  actionLabel: string;
  actionIcon?: React.ReactNode;
  showOrder?: boolean;
  showTests?: boolean;
}

// ── PatientCard Component ───────────────────────

function PatientCard({
  patient,
  order,
  onAction,
  actionLabel,
  actionIcon,
  showOrder,
  showTests,
}: PatientCardProps) {
  const completedCount =
    order?.tests.filter((t: OrderTest) => t.status === "COMPLETED").length ?? 0;
  const totalTests = order?.tests.length ?? 0;

  return (
    <Card className="hover:border-brand-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {patient.name}
          </h3>
          <p className="text-sm text-slate-500">
            ID: {patient.id} · {patient.age}y · {patient.gender} ·{" "}
            {patient.bloodGroup}
          </p>
        </div>
        <Badge variant={statusToVariant(patient.status)}>
          {PATIENT_STATUS_LABELS[patient.status]}
        </Badge>
      </div>

      {showOrder && order && (
        <div className="bg-slate-50 rounded-lg p-3 mb-3 text-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-500">Order #{order.id}</span>
            <Badge variant={statusToVariant(order.status)}>
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
          </div>
          <p className="text-slate-600">
            Tests: {completedCount}/{totalTests} completed
          </p>
          {showTests && order.tests.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {order.tests.map((t: OrderTest) => (
                <TestStatusBadge key={t.testId} test={t} />
              ))}
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-slate-400 mb-4">
        {patient.phone} · {patient.address}
      </p>

      {onAction && (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={onAction}>
            {actionIcon ?? <IconPlus className="w-4 h-4" />}
            {actionLabel}
          </Button>
        </div>
      )}
    </Card>
  );
}

// ── Test Status Badge (Extracted) ───────────────

function TestStatusBadge({ test }: { test: OrderTest }) {
  const statusStyles: Record<
    string,
    { bg: string; text: string; dot: string }
  > = {
    COMPLETED: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    IN_PROGRESS: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      dot: "bg-amber-500",
    },
    PENDING: {
      bg: "bg-slate-100",
      text: "text-slate-600",
      dot: "bg-slate-400",
    },
  };

  const style = statusStyles[test.status] ?? statusStyles.PENDING;
  const displayName =
    test.testName.length > 30
      ? test.testName.substring(0, 30) + "..."
      : test.testName;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {displayName}
    </span>
  );
}

// ── Empty State Component ───────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <p className="text-sm text-slate-500 text-center py-6">{message}</p>
    </Card>
  );
}

// ── Main PatientQueue Component ─────────────────

export default function PatientQueue() {
  const navigate = useNavigate();

  const { data: newPatients = [] } = useQuery({
    queryKey: ["patients", "queue", "new"],
    queryFn: () => api.getNewQueue(),
  });

  const { data: returningPatientsWithOrders = [] } = useQuery({
    queryKey: ["patients", "queue", "returning", "with-orders"],
    queryFn: () => api.getReturningQueueWithOrders(),
  });

  const totalWaiting = newPatients.length + returningPatientsWithOrders.length;

  const handleNewPatientAction = (patient: Patient) => {
    navigate(`/opd/investigations?patientId=${patient.id}`);
  };

  const handleReturningPatientAction = (
    patient: Patient,
    order: InvestigationOrder | null,
  ) => {
    if (patient.status === "TESTS_COMPLETED") {
      navigate(`/opd/prescriptions?patientId=${patient.id}`);
    } else if (order) {
      navigate(`/opd/investigations?orderId=${order.id}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
          Patient Queue
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {totalWaiting} patient{totalWaiting !== 1 ? "s" : ""} waiting
        </p>
      </div>

      {/* New Patients Section */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          New Patients — Awaiting Investigation Order
        </h2>
        {newPatients.length === 0 ? (
          <EmptyState message="No new patients in queue" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {newPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onAction={() => handleNewPatientAction(patient)}
                actionLabel="Create Investigation Order"
              />
            ))}
          </div>
        )}
      </section>

      {/* Returning Patients Section */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Returning Patients — Additional Tests or Prescription
        </h2>
        {returningPatientsWithOrders.length === 0 ? (
          <EmptyState message="No returning patients" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {returningPatientsWithOrders.map(({ patient, order }) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                order={order ?? undefined}
                showOrder
                showTests
                onAction={
                  order
                    ? () => handleReturningPatientAction(patient, order)
                    : undefined
                }
                actionLabel={
                  patient.status === "TESTS_COMPLETED"
                    ? "Create Prescription"
                    : "Add Tests"
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
