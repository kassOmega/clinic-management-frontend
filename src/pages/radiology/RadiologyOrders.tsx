import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { IconScan } from "../../components/icons";
import { Badge, statusToVariant } from "../../components/UI/Badge";
import { Button } from "../../components/UI/Button";
import { Card } from "../../components/UI/Card";
import { api } from "../../services/api";
import { ORDER_STATUS_LABELS } from "../../types";

export default function RadiologyOrders() {
  const navigate = useNavigate();
  const { data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: api.getOrders,
  });
  const { data: patients } = useQuery({
    queryKey: ["patients"],
    queryFn: api.getPatients,
  });

  if (!orders || !patients) return null;

  const radioOrders = orders.filter(
    (o) =>
      o.tests.some((t) => t.type === "radiology") &&
      ["PAYMENT_CONFIRMED", "IN_PROGRESS", "RESULTS_READY"].includes(o.status),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
          Radiology Orders
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {radioOrders.length} orders with radiology tests
        </p>
      </div>

      {radioOrders.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <IconScan className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">
              No Radiology Orders
            </h3>
            <p className="text-sm text-slate-500">
              No pending radiology orders at the moment
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {radioOrders.map((order) => {
            const patient = patients.find((p) => p.id === order.patientId);
            const radioTests = order.tests.filter(
              (t) => t.type === "radiology",
            );
            const allRadioDone = radioTests.every(
              (t) => t.status === "COMPLETED",
            );

            return (
              <Card key={order.id}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-base font-semibold text-slate-900">
                        {patient?.name || "Unknown"}
                      </h3>
                      <Badge variant={statusToVariant(order.status)}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500">
                      Order #{order.id} · Patient ID: {order.patientId} ·{" "}
                      {order.opdNotes}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Payment</p>
                    <Badge variant="success">Confirmed</Badge>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                  <div className="space-y-2">
                    {radioTests.map((t) => (
                      <div
                        key={t.testId}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${t.status === "COMPLETED" ? "bg-emerald-500" : t.status === "IN_PROGRESS" ? "bg-amber-500" : "bg-slate-300"}`}
                          />
                          <span className="text-slate-700">{t.testName}</span>
                        </div>
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
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  {!allRadioDone && (
                    <Button
                      size="sm"
                      onClick={() =>
                        navigate(`/radiology/results?orderId=${order.id}`)
                      }
                    >
                      Enter Results
                    </Button>
                  )}
                  {allRadioDone && (
                    <Badge variant="success" className="py-1.5 px-3">
                      All Radiology Tests Completed
                    </Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
