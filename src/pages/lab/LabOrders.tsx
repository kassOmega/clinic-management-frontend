import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { IconEye, IconFlask } from "../../components/icons";
import { Badge, statusToVariant } from "../../components/UI/Badge";
import { Button } from "../../components/UI/Button";
import { Card } from "../../components/UI/Card";
import { api } from "../../services/api";
import type {
  InvestigationOrder,
  OrderTest,
  Patient,
  PatientStatus,
  TestStatus,
} from "../../types";
import { ORDER_STATUS_LABELS, PATIENT_STATUS_LABELS } from "../../types";

// ── Types ───────────────────────────────────────

interface TestItem {
  test: OrderTest;
  isCompleted: boolean;
  isInProgress: boolean;
}

interface OrderCardProps {
  order: InvestigationOrder;
  patient: Patient | undefined;
  tests: TestItem[];
  allCompleted: boolean;
  total: number;
  patientStatus: PatientStatus | string;
  onEnterResults: (orderId: number) => void;
}

// ── Helper Functions ────────────────────────────

function getTestStatusVariant(
  status: TestStatus,
): "success" | "warning" | "default" {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "IN_PROGRESS":
      return "warning";
    default:
      return "default";
  }
}

function getTestStatusLabel(status: TestStatus): string {
  switch (status) {
    case "COMPLETED":
      return "Done";
    case "IN_PROGRESS":
      return "In Progress";
    default:
      return "Pending";
  }
}

function getStatusDotColor(status: TestStatus): string {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-500";
    case "IN_PROGRESS":
      return "bg-amber-500";
    default:
      return "bg-slate-300";
  }
}

// ── Test Row Component ──────────────────────────

function TestRow({ test }: { test: TestItem }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${getStatusDotColor(test.test.status)}`}
        />
        <span className="text-slate-700">{test.test.testName}</span>
        <span className="text-slate-400 text-xs">({test.test.type})</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-slate-500">ETB {test.test.price}</span>
        <Badge variant={getTestStatusVariant(test.test.status)}>
          {getTestStatusLabel(test.test.status)}
        </Badge>
      </div>
    </div>
  );
}

// ── Order Card Component ────────────────────────

function OrderCard({
  order,
  patient,
  tests,
  allCompleted,
  total,
  patientStatus,
  onEnterResults,
}: OrderCardProps) {
  return (
    <Card>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-base font-semibold text-slate-900">
              {patient?.name ?? "Unknown"}
            </h3>
            <Badge variant={statusToVariant(order.status)}>
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
          </div>
          <p className="text-sm text-slate-500">
            Order #{order.id} · Patient ID: {order.patientId} · {order.opdNotes}
          </p>
        </div>
        <div className="text-right">
          <Badge variant="info">Lab Only</Badge>
        </div>
      </div>

      {/* Tests List */}
      <div className="bg-slate-50 rounded-lg p-3 mb-4">
        <div className="space-y-2">
          {tests.map((item) => (
            <TestRow key={item.test.testId} test={item} />
          ))}
          <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-200">
            <span>Total</span>
            <span>ETB {total}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400">
          Patient:{" "}
          <span className="text-slate-600 font-medium">
            {patientStatus
              ? PATIENT_STATUS_LABELS[
                  patientStatus as keyof typeof PATIENT_STATUS_LABELS
                ]
              : "—"}
          </span>
        </span>
        {allCompleted ? (
          <Badge variant="success" className="py-1.5 px-3">
            All Lab Tests Completed
          </Badge>
        ) : (
          <Button size="sm" onClick={() => onEnterResults(order.id)}>
            <IconEye className="w-4 h-4" />
            Enter Results
          </Button>
        )}
      </div>
    </Card>
  );
}

// ── Empty State Component ───────────────────────

function EmptyState() {
  return (
    <Card>
      <div className="text-center py-12">
        <IconFlask className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-1">
          No Lab Orders
        </h3>
        <p className="text-sm text-slate-500">
          No pending lab orders at the moment
        </p>
      </div>
    </Card>
  );
}

// ── Main Component ──────────────────────────────

export default function LabOrders() {
  const navigate = useNavigate();

  const { data: orders = [] } = useQuery<InvestigationOrder[]>({
    queryKey: ["orders", "lab", "queue"],
    queryFn: api.getLabQueue,
  });

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: api.getPatients,
  });

  const getPatient = (patientId: number): Patient | undefined =>
    patients.find((p) => p.id === patientId);

  const processOrder = (order: InvestigationOrder) => {
    const patient = getPatient(order.patientId);
    const labTests = order.tests.filter((t) => t.type === "lab");

    const testItems: TestItem[] = labTests.map((test) => ({
      test,
      isCompleted: test.status === "COMPLETED",
      isInProgress: test.status === "IN_PROGRESS",
    }));

    const allCompleted = labTests.every((t) => t.status === "COMPLETED");

    const total = labTests.reduce((sum, t) => sum + t.price, 0);

    const patientStatus: PatientStatus | string = allCompleted
      ? order.status
      : (patient?.status ?? "IN_LAB");

    return {
      order,
      patient,
      tests: testItems,
      allCompleted,
      total,
      patientStatus,
    };
  };

  const handleEnterResults = (orderId: number) => {
    navigate(`/lab/results?orderId=${orderId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
          Lab Orders
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {orders.length} order{orders.length !== 1 ? "s" : ""} with pending lab
          tests
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const processed = processOrder(order);
            return (
              <OrderCard
                key={order.id}
                order={processed.order}
                patient={processed.patient}
                tests={processed.tests}
                allCompleted={processed.allCompleted}
                total={processed.total}
                patientStatus={processed.patientStatus}
                onEnterResults={handleEnterResults}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
