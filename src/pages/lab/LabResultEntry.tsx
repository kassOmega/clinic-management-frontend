import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { usePermissions } from "../../hooks/usePermissions";
import { api } from "../../services/api";

import { IconCheck, IconFlask } from "../../components/icons";
import { Badge, statusToVariant } from "../../components/UI/Badge";
import { Button } from "../../components/UI/Button";
import { Card, CardHeader, CardTitle } from "../../components/UI/Card";
import { Input } from "../../components/UI/Input";
import { ORDER_STATUS_LABELS } from "../../types";

export default function LabResultEntry() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = usePermissions();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const orderId = Number(searchParams.get("orderId"));
  const [results, setResults] = useState<Record<string, string>>({});

  const { data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: api.getOrders,
    enabled: !!orderId,
  });
  const { data: patients } = useQuery({
    queryKey: ["patients"],
    queryFn: api.getPatients,
  });
  const { data: existingResults } = useQuery({
    queryKey: ["labResults", "order", orderId],
    queryFn: () => api.getLabResultsByOrder(orderId),
    enabled: !!orderId,
  });

  const order = orders?.find((o) => o.id === orderId);
  const patient = patients?.find((p) => p.id === order?.patientId);
  const labTests = order?.tests.filter((t) => t.type === "lab") || [];

  // Populate existing results
  useEffect(() => {
    if (existingResults) {
      const mapped: Record<string, string> = {};
      existingResults.forEach((r) => {
        mapped[r.testId] = r.value;
      });
      setResults(mapped);
    }
  }, [existingResults]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!order || !user) return;
      for (const test of labTests) {
        const value = results[test.testId];
        if (!value || test.status === "COMPLETED") continue;

        await api.createLabResult({
          orderId: order.id,
          patientId: order.patientId,
          testId: test.testId,
          testName: test.testName,
          value,
          unit: test.unit || "",
          referenceRange: test.referenceRange || "",
          createdAt: new Date().toISOString(),
          createdBy: user.id,
        });

        await api.updateOrderTestStatus(order.id, test.testId, "COMPLETED");
      }
      await api.recalcOrderStatus(order.id);

      // Check if all tests in order (including radiology) are done
      const updatedOrder = await api.getOrderById(order.id);
      if (updatedOrder?.status === "RESULTS_READY") {
        await api.updatePatientStatus(order.patientId, "TESTS_COMPLETED");
      } else if (updatedOrder?.status === "IN_PROGRESS") {
        // Some radio tests still pending
        await api.updatePatientStatus(order.patientId, "IN_LAB");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["labResults"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      addToast("Lab results saved successfully", "success");
      navigate("/lab/orders");
    },
    onError: () => addToast("Failed to save results", "error"),
  });

  if (!order || !patient) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
          Lab Result Entry
        </h1>
        <Card>
          <div className="text-center py-12">
            <IconFlask className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-sm text-slate-500">
              Select an order from the Lab Orders page
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/lab/orders")}
            >
              Back to Lab Orders
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
          Enter Lab Results
        </h1>
        <p className="text-slate-500 text-sm mt-1">Order #{order.id}</p>
      </div>

      {/* Patient Info */}
      <Card>
        <CardHeader>
          <CardTitle>Patient</CardTitle>
          <Badge variant={statusToVariant(order.status)}>
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
        </CardHeader>
        <div className="bg-brand-50 rounded-lg p-4 border border-brand-200">
          <p className="font-semibold text-slate-900">{patient.name}</p>
          <p className="text-sm text-slate-600">
            ID: {patient.id} · {patient.age}y · {patient.gender} ·{" "}
            {patient.bloodGroup}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Clinical Notes: {order.opdNotes}
          </p>
        </div>
      </Card>

      {/* Result Entry */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <IconFlask className="w-5 h-5 text-brand-600" />
        </CardHeader>
        <div className="space-y-6">
          {labTests.map((test) => {
            const isCompleted = test.status === "COMPLETED";
            return (
              <div
                key={test.testId}
                className={`p-4 rounded-lg border ${isCompleted ? "bg-emerald-50/50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      {test.testName}
                    </h4>
                    {test.referenceRange && test.referenceRange !== "-" && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        Reference Range: {test.referenceRange}
                      </p>
                    )}
                  </div>
                  {isCompleted && <Badge variant="success">Completed</Badge>}
                </div>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Input
                      label="Result Value"
                      value={results[test.testId] || ""}
                      onChange={(e) =>
                        setResults((prev) => ({
                          ...prev,
                          [test.testId]: e.target.value,
                        }))
                      }
                      placeholder="Enter result value"
                      disabled={isCompleted}
                    />
                  </div>
                  {test.unit && test.unit !== "-" && (
                    <div className="pb-6">
                      <span className="text-sm text-slate-500 whitespace-nowrap">
                        {test.unit}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-200">
          <Button variant="outline" onClick={() => navigate("/lab/orders")}>
            Cancel
          </Button>
          <Button
            onClick={() => submitMutation.mutate()}
            loading={submitMutation.isPending}
            disabled={labTests.every((t) => t.status === "COMPLETED")}
          >
            <IconCheck className="w-4 h-4" />
            Save Results
          </Button>
        </div>
      </Card>
    </div>
  );
}
