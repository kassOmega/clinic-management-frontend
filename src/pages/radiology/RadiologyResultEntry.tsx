import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IconCheck, IconScan, IconX } from "../../components/icons";
import { Badge, statusToVariant } from "../../components/UI/Badge";
import { Button } from "../../components/UI/Button";
import { Card, CardHeader, CardTitle } from "../../components/UI/Card";
import { useToast } from "../../context/ToastContext";
import { usePermissions } from "../../hooks/usePermissions";
import { api } from "../../services/api";
import { ORDER_STATUS_LABELS } from "../../types";

interface RadioResultForm {
  findings: string;
  impression: string;
}

export default function RadiologyResultEntry() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = usePermissions();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const orderId = Number(searchParams.get("orderId"));
  const [edits, setEdits] = useState<Record<string, RadioResultForm>>({});
  const [editingTests, setEditingTests] = useState<Set<string>>(new Set());

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
    queryKey: ["radioResults", "order", orderId],
    queryFn: () => api.getRadiologyResultsByOrder(orderId),
    enabled: !!orderId,
  });

  const order = orders?.find((o) => o.id === orderId);
  const patient = patients?.find((p) => p.id === order?.patientId);
  const radioTests = order?.tests.filter((t) => t.type === "radiology") || [];

  // Derive existing values from query data
  const existingValues = useMemo<Record<string, RadioResultForm>>(() => {
    if (!existingResults) return {};
    const mapped: Record<string, RadioResultForm> = {};
    existingResults.forEach((r) => {
      mapped[r.testId] = { findings: r.findings, impression: r.impression };
    });
    return mapped;
  }, [existingResults]);

  // Merge existing values with user edits
  const getResult = (testId: string): RadioResultForm =>
    edits[testId] ?? existingValues[testId] ?? { findings: "", impression: "" };

  const updateResult = (
    testId: string,
    field: "findings" | "impression",
    value: string,
  ) => {
    setEdits((prev) => ({
      ...prev,
      [testId]: {
        ...(prev[testId] ??
          existingValues[testId] ?? { findings: "", impression: "" }),
        [field]: value,
      },
    }));
  };

  const toggleEdit = (testId: string) => {
    setEditingTests((prev) => {
      const next = new Set(prev);
      if (next.has(testId)) {
        next.delete(testId);
        // Revert edits when cancelling
        setEdits((prev) => {
          const next = { ...prev };
          delete next[testId];
          return next;
        });
      } else {
        next.add(testId);
      }
      return next;
    });
  };

  const hasAnyChanges = radioTests.some((t) => {
    if (t.status === "COMPLETED") {
      if (!editingTests.has(t.testId)) return false;
      const existingResult = existingResults?.find(
        (r) => r.testId === t.testId,
      );
      if (!existingResult) return false;
      const current = getResult(t.testId);
      return (
        current.findings !== existingResult.findings ||
        current.impression !== existingResult.impression
      );
    }
    const current = getResult(t.testId);
    return current.findings !== "" || current.impression !== "";
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!order || !user) return;
      for (const test of radioTests) {
        const form = getResult(test.testId);

        if (test.status === "COMPLETED") {
          // Only update if values actually changed
          const existingResult = existingResults?.find(
            (r) => r.testId === test.testId,
          );
          if (
            existingResult &&
            (form.findings !== existingResult.findings ||
              form.impression !== existingResult.impression)
          ) {
            await api.updateRadiologyResult(existingResult.id, {
              findings: form.findings,
              impression: form.impression,
            });
          }
        } else {
          // Create new result
          if (!form.findings || !form.impression) continue;
          await api.createRadiologyResult({
            orderId: order.id,
            patientId: order.patientId,
            testId: test.testId,
            testName: test.testName,
            findings: form.findings,
            impression: form.impression,
            createdAt: new Date().toISOString(),
            createdBy: user.id,
          });
          await api.updateOrderTestStatus(order.id, test.testId, "COMPLETED");
        }
      }
      await api.recalcOrderStatus(order.id);

      const updatedOrder = await api.getOrderById(order.id);
      if (updatedOrder?.status === "RESULTS_READY") {
        await api.updatePatientStatus(order.patientId, "TESTS_COMPLETED");
      } else if (updatedOrder?.status === "IN_PROGRESS") {
        await api.updatePatientStatus(order.patientId, "IN_RADIOLOGY");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["radioResults"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setEdits({});
      setEditingTests(new Set());
      addToast("Radiology results saved successfully", "success");
      navigate("/radiology/orders");
    },
    onError: () => addToast("Failed to save results", "error"),
  });

  if (!order || !patient) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
          Radiology Result Entry
        </h1>
        <Card>
          <div className="text-center py-12">
            <IconScan className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-sm text-slate-500">
              Select an order from the Radiology Orders page
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/radiology/orders")}
            >
              Back to Radiology Orders
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
          Radiology Results
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
          <IconScan className="w-5 h-5 text-violet-600" />
        </CardHeader>
        <div className="space-y-6">
          {radioTests.map((test) => {
            const isCompleted = test.status === "COMPLETED";
            const isEditing = editingTests.has(test.testId);
            const isReadOnly = isCompleted && !isEditing;
            const form = getResult(test.testId);

            return (
              <div
                key={test.testId}
                className={`p-4 rounded-lg border ${
                  isCompleted && !isEditing
                    ? "bg-emerald-50/50 border-emerald-200"
                    : isEditing
                      ? "bg-amber-50/50 border-amber-300 ring-2 ring-amber-400/20"
                      : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-900">
                    {test.testName}
                  </h4>
                  <div className="flex items-center gap-2">
                    {isCompleted && !isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleEdit(test.testId)}
                      >
                        Edit
                      </Button>
                    )}
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleEdit(test.testId)}
                        className="text-slate-500"
                      >
                        <IconX className="w-3 h-3" />
                        Cancel
                      </Button>
                    )}
                    {isCompleted && !isEditing && (
                      <Badge variant="success">Completed</Badge>
                    )}
                    {isEditing && <Badge variant="warning">Editing</Badge>}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">
                      Findings
                    </label>
                    <textarea
                      value={form.findings}
                      onChange={(e) =>
                        updateResult(test.testId, "findings", e.target.value)
                      }
                      rows={3}
                      placeholder="Describe the radiological findings..."
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors resize-none disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">
                      Impression
                    </label>
                    <textarea
                      value={form.impression}
                      onChange={(e) =>
                        updateResult(test.testId, "impression", e.target.value)
                      }
                      rows={2}
                      placeholder="Radiological impression / diagnosis..."
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors resize-none disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={() => navigate("/radiology/orders")}
          >
            Cancel
          </Button>
          <Button
            onClick={() => submitMutation.mutate()}
            loading={submitMutation.isPending}
            disabled={!hasAnyChanges}
          >
            <IconCheck className="w-4 h-4" />
            Save Results
          </Button>
        </div>
      </Card>
    </div>
  );
}
