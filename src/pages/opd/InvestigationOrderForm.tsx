import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  IconArrowLeft,
  IconFlask,
  IconPlus,
  IconScan,
  IconX,
} from "../../components/icons";
import { Badge, statusToVariant } from "../../components/UI/Badge";
import { Button } from "../../components/UI/Button";
import { Card, CardHeader, CardTitle } from "../../components/UI/Card";
import { Input } from "../../components/UI/Input";
import { useToast } from "../../context/ToastContext";
import { usePermissions } from "../../hooks/usePermissions";
import { api } from "../../services/api";
import type { OrderTest } from "../../types";
import { ORDER_STATUS_LABELS, PATIENT_STATUS_LABELS } from "../../types";

export default function InvestigationOrderForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = usePermissions();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const preselectedPatientId = searchParams.get("patientId");
  const existingOrderId = searchParams.get("orderId");
  const isAddingToExisting = !!existingOrderId;

  const [selectedPatientId, setSelectedPatientId] = useState(
    preselectedPatientId || "",
  );
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [showPatientSelect, setShowPatientSelect] = useState(
    !preselectedPatientId && !isAddingToExisting,
  );

  const { data: patients } = useQuery({
    queryKey: ["patients"],
    queryFn: api.getPatients,
  });
  const { data: queuePatients } = useQuery({
    queryKey: ["queue_patients"],
    queryFn: api.getQueuePatients,
  });
  const { data: testCatalog } = useQuery({
    queryKey: ["testCatalog"],
    queryFn: api.getTestCatalog,
  });

  // Existing order data when adding tests
  const existingOrder = useQuery({
    queryKey: ["orders"],
    queryFn: api.getOrders,
    enabled: isAddingToExisting,
  });
  const order = isAddingToExisting
    ? existingOrder.data?.find((o) => o.id === Number(existingOrderId))
    : null;
  const existingPatient = order
    ? patients?.find((p) => p.id === order.patientId)
    : null;

  // Filter out tests already in the existing order
  const existingTestIds = order
    ? new Set(order.tests.map((t) => t.testId))
    : new Set<string>();

  const labTests = (
    testCatalog?.filter((t) => t.type === "lab" && t.active) || []
  ).filter((t) => !existingTestIds.has(t.id));
  const radioTests = (
    testCatalog?.filter((t) => t.type === "radiology" && t.active) || []
  ).filter((t) => !existingTestIds.has(t.id));

  const selectedPatient = isAddingToExisting
    ? existingPatient
    : patients?.find((p) => p.id === Number(selectedPatientId));

  const totalPrice = selectedTests.reduce((sum, testId) => {
    const test = testCatalog?.find((t) => t.id === testId);
    return sum + (test?.price || 0);
  }, 0);

  const toggleTest = (testId: string) => {
    setSelectedTests((prev) =>
      prev.includes(testId)
        ? prev.filter((id) => id !== testId)
        : [...prev, testId],
    );
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const newTests: OrderTest[] = selectedTests.map((testId) => {
        const t = testCatalog!.find((tc) => tc.id === testId)!;
        return {
          testId: t.id,
          testName: t.name,
          type: t.type,
          price: t.price,
          unit: t.unit || "",
          referenceRange: t.referenceRange || "",
          status: "PENDING" as const,
        };
      });

      if (isAddingToExisting) {
        await api.addTestsToOrder(Number(existingOrderId), newTests);
      } else {
        const patientId = Number(selectedPatientId);
        const createdOrder = await api.createOrder({
          patientId,
          tests: newTests,
          totalPrice,
          status: "PENDING_PAYMENT",
          opdNotes: notes,
          createdAt: new Date().toISOString(),
          createdBy: user!.id,
        });

        await api.createPayment({
          patientId,
          orderId: createdOrder.id,
          amount: totalPrice,
          type: "investigation",
          status: "PENDING",
          createdAt: new Date().toISOString(),
          processedBy: user!.id,
        });

        await api.updatePatientStatus(patientId, "PENDING_PAYMENT");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      addToast(
        isAddingToExisting
          ? "Additional tests added. Payment request sent to reception."
          : "Investigation order created. Payment request sent to reception.",
        "success",
      );
      navigate("/opd/queue");
    },
    onError: () => addToast("Failed to save order", "error"),
  });

  if (!patients || !testCatalog) return null;
  if (isAddingToExisting && !order) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/opd/queue")}
        >
          <IconArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
            {isAddingToExisting
              ? "Add Additional Tests"
              : "Investigation Order"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isAddingToExisting
              ? `Adding to Order #${existingOrderId}`
              : "Create investigation order and send to reception for payment"}
          </p>
        </div>
      </div>

      {/* Patient Selection — only for new orders */}
      {!isAddingToExisting && (
        <Card>
          <CardHeader>
            <CardTitle>Select Patient</CardTitle>
            {selectedPatient && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedPatientId("");
                  setShowPatientSelect(true);
                }}
              >
                Change
              </Button>
            )}
          </CardHeader>

          {showPatientSelect ? (
            <div className="space-y-3">
              {queuePatients.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">
                  No patients in queue
                </p>
              ) : (
                queuePatients.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPatientId(p.id.toString());
                      setShowPatientSelect(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-brand-400 hover:bg-brand-50/50 transition-colors text-left"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {p.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        ID: {p.id} · {p.age}y · {p.gender}
                      </p>
                    </div>
                    <Badge variant="info">
                      {PATIENT_STATUS_LABELS[p.status]}
                    </Badge>
                  </button>
                ))
              )}
            </div>
          ) : selectedPatient ? (
            <div className="bg-brand-50 rounded-lg p-4 border border-brand-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">
                    {selectedPatient.name}
                  </p>
                  <p className="text-sm text-slate-600">
                    ID: {selectedPatient.id} · {selectedPatient.age}y ·{" "}
                    {selectedPatient.gender} · {selectedPatient.bloodGroup}
                  </p>
                  <p className="text-sm text-slate-500">
                    {selectedPatient.phone} · {selectedPatient.address}
                  </p>
                </div>
                <Badge variant="info">
                  {PATIENT_STATUS_LABELS[selectedPatient.status]}
                </Badge>
              </div>
            </div>
          ) : null}
        </Card>
      )}

      {/* Existing order info — only when adding tests */}
      {isAddingToExisting && order && existingPatient && (
        <Card>
          <CardHeader>
            <CardTitle>Patient & Existing Order</CardTitle>
            <Badge variant={statusToVariant(order.status)}>
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
          </CardHeader>
          <div className="bg-brand-50 rounded-lg p-4 border border-brand-200 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">
                  {existingPatient.name}
                </p>
                <p className="text-sm text-slate-600">
                  ID: {existingPatient.id} · {existingPatient.age}y ·{" "}
                  {existingPatient.gender} · {existingPatient.bloodGroup}
                </p>
                <p className="text-sm text-slate-500">
                  {existingPatient.phone} · {existingPatient.address}
                </p>
              </div>
              <Badge variant={statusToVariant(existingPatient.status)}>
                {PATIENT_STATUS_LABELS[existingPatient.status]}
              </Badge>
            </div>
          </div>

          {/* Show existing tests */}
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
              Existing Tests in Order #{order.id}
            </p>
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
                    <span className="text-slate-700">{t.testName}</span>
                    <span className="text-slate-400 text-xs">({t.type})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">ETB {t.price}</span>
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
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-200">
                <span>Current Total</span>
                <span>ETB {order.totalPrice}</span>
              </div>
            </div>
          </div>

          {order.opdNotes && (
            <p className="text-sm text-slate-500 mt-3">
              <span className="font-medium text-slate-700">
                Previous Notes:
              </span>{" "}
              {order.opdNotes}
            </p>
          )}
        </Card>
      )}

      {/* Test Selection */}
      {selectedPatientId && !isAddingToExisting && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Lab Tests</CardTitle>
              <IconFlask className="w-5 h-5 text-brand-600" />
            </CardHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {labTests.map((t) => {
                const isSelected = selectedTests.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleTest(t.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${isSelected ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20" : "border-slate-200 hover:border-slate-300"}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {t.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {t.description}
                        </p>
                        {t.referenceRange && t.referenceRange !== "-" && (
                          <p className="text-xs text-slate-400 mt-1">
                            Range: {t.referenceRange}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          ETB {t.price}
                        </span>
                        {isSelected ? (
                          <IconX className="w-4 h-4 text-brand-600" />
                        ) : (
                          <IconPlus className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Radiology Tests</CardTitle>
              <IconScan className="w-5 h-5 text-violet-600" />
            </CardHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {radioTests.map((t) => {
                const isSelected = selectedTests.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleTest(t.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${isSelected ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20" : "border-slate-200 hover:border-slate-300"}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {t.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {t.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          ETB {t.price}
                        </span>
                        {isSelected ? (
                          <IconX className="w-4 h-4 text-brand-600" />
                        ) : (
                          <IconPlus className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Notes & Submit */}
          <Card>
            <CardHeader>
              <CardTitle>Notes & Summary</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <Input
                label="Clinical Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reason for investigation, clinical findings..."
              />
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    Selected Tests ({selectedTests.length})
                  </span>
                  <span className="text-xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
                    ETB {totalPrice}
                  </span>
                </div>
                {selectedTests.length > 0 && (
                  <div className="space-y-1">
                    {selectedTests.map((testId) => {
                      const t = testCatalog.find((tc) => tc.id === testId)!;
                      return (
                        <div
                          key={testId}
                          className="flex justify-between text-sm text-slate-600"
                        >
                          <span>{t.name}</span>
                          <span>ETB {t.price}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => navigate("/opd/queue")}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => mutation.mutate()}
                  loading={mutation.isPending}
                  disabled={selectedTests.length === 0}
                >
                  Send to Reception for Payment
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Test Selection — when adding to existing order */}
      {isAddingToExisting && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Additional Lab Tests</CardTitle>
              <IconFlask className="w-5 h-5 text-brand-600" />
            </CardHeader>
            {labTests.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                All lab tests already in order
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {labTests.map((t) => {
                  const isSelected = selectedTests.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTest(t.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${isSelected ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20" : "border-slate-200 hover:border-slate-300"}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">
                            {t.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {t.description}
                          </p>
                          {t.referenceRange && t.referenceRange !== "-" && (
                            <p className="text-xs text-slate-400 mt-1">
                              Range: {t.referenceRange}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            ETB {t.price}
                          </span>
                          {isSelected ? (
                            <IconX className="w-4 h-4 text-brand-600" />
                          ) : (
                            <IconPlus className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Radiology Tests</CardTitle>
              <IconScan className="w-5 h-5 text-violet-600" />
            </CardHeader>
            {radioTests.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                All radiology tests already in order
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {radioTests.map((t) => {
                  const isSelected = selectedTests.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTest(t.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${isSelected ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20" : "border-slate-200 hover:border-slate-300"}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">
                            {t.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {t.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            ETB {t.price}
                          </span>
                          {isSelected ? (
                            <IconX className="w-4 h-4 text-brand-600" />
                          ) : (
                            <IconPlus className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Additional Notes & Submit */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes & Summary</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <Input
                label="Reason for Additional Tests"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Why are additional tests needed..."
              />
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    New Tests Selected ({selectedTests.length})
                  </span>
                  <span className="text-xl font-bold text-brand-700 font-[family-name:var(--font-display)]">
                    + ETB {totalPrice}
                  </span>
                </div>
                {selectedTests.length > 0 && (
                  <div className="space-y-1">
                    {selectedTests.map((testId) => {
                      const t = testCatalog.find((tc) => tc.id === testId)!;
                      return (
                        <div
                          key={testId}
                          className="flex justify-between text-sm text-slate-600"
                        >
                          <span>{t.name}</span>
                          <span>ETB {t.price}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold pt-2 mt-2 border-t border-slate-200">
                  <span>New Order Total</span>
                  <span>ETB {(order?.totalPrice || 0) + totalPrice}</span>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => navigate("/opd/queue")}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => mutation.mutate()}
                  loading={mutation.isPending}
                  disabled={selectedTests.length === 0}
                >
                  Add Tests & Send to Reception
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
