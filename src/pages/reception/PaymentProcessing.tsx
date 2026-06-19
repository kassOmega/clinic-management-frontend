import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconPayment } from "../../components/icons";
import { Badge } from "../../components/UI/Badge";
import { Button } from "../../components/UI/Button";
import { Card } from "../../components/UI/Card";
import { useToast } from "../../context/ToastContext";

import { api } from "../../services/api";

export default function PaymentProcessing() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data: payments } = useQuery({
    queryKey: ["payments"],
    queryFn: api.getPayments,
  });
  const { data: patients } = useQuery({
    queryKey: ["patients"],
    queryFn: api.getPatients,
  });
  const { data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: api.getOrders,
  });

  const confirmMutation = useMutation({
    mutationFn: async (paymentId: number) => {
      const payment = payments!.find((p) => p.id === paymentId)!;
      await api.confirmPayment(paymentId);

      if (payment.type === "registration") {
        await api.updatePatientStatus(payment.patientId, "REGISTRATION_PAID");
      } else if (payment.type === "investigation" && payment.orderId) {
        await api.updateOrderStatus(payment.orderId, "PAYMENT_CONFIRMED");
        await api.updatePatientStatus(payment.patientId, "PAYMENT_CONFIRMED");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      addToast("Payment confirmed successfully", "success");
    },
    onError: () => addToast("Failed to confirm payment", "error"),
  });

  if (!payments || !patients || !orders) return null;

  const pendingPayments = payments.filter((p) => p.status === "PENDING");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
          Payment Processing
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {pendingPayments.length} pending payments
        </p>
      </div>

      {pendingPayments.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <IconPayment className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">
              All Caught Up
            </h3>
            <p className="text-sm text-slate-500">
              No pending payments at the moment
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingPayments.map((payment) => {
            const patient = patients.find((p) => p.id === payment.patientId);
            const order = payment.orderId
              ? orders.find((o) => o.id === payment.orderId)
              : null;

            return (
              <Card key={payment.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-semibold text-slate-900">
                        {patient?.name || "Unknown"}
                      </h3>
                      <Badge
                        variant={
                          payment.type === "registration" ? "info" : "warning"
                        }
                      >
                        {payment.type === "registration"
                          ? "Registration Fee"
                          : "Investigation Fee"}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mb-3">
                      Patient ID: {payment.patientId}
                      {order && (
                        <>
                          {" "}
                          · Order #{order.id} · {order.tests.length} tests
                        </>
                      )}
                    </p>

                    {order && (
                      <div className="bg-slate-50 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-slate-600 mb-2">
                          Order Details:
                        </p>
                        <div className="space-y-1">
                          {order.tests.map((t) => (
                            <div
                              key={t.testId}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-slate-600">
                                {t.testName}{" "}
                                <span className="text-slate-400">
                                  ({t.type})
                                </span>
                              </span>
                              <span className="font-medium text-slate-900">
                                ETB {t.price}
                              </span>
                            </div>
                          ))}
                          <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-200">
                            <span>Total</span>
                            <span>ETB {order.totalPrice}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
                        ETB {payment.amount}
                      </span>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                  </div>

                  <Button
                    onClick={() => confirmMutation.mutate(payment.id)}
                    loading={confirmMutation.isPending}
                  >
                    <IconCheck className="w-4 h-4" />
                    Confirm Payment
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
