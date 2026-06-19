import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Button } from "../../components/UI/Button";
import { Card, CardHeader, CardTitle } from "../../components/UI/Card";
import { Input } from "../../components/UI/Input";

import { IconFlask, IconPlus, IconScan, IconX } from "../../components/icons";
import { Badge } from "../../components/UI/Badge";
import { useToast } from "../../context/ToastContext";
import { usePermissions } from "../../hooks/usePermissions";
import { api } from "../../services/api";
import { PATIENT_STATUS_LABELS } from "../../types";

export default function InvestigationOrderForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = usePermissions();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const preselectedPatientId = searchParams.get("patientId");
  const [selectedPatientId, setSelectedPatientId] = useState(
    preselectedPatientId || "",
  );
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [showPatientSelect, setShowPatientSelect] =
    useState(!preselectedPatientId);

  const { data: patients } = useQuery({
    queryKey: ["patients"],
    queryFn: api.getPatients,
  });
  const { data: testCatalog } = useQuery({
    queryKey: ["testCatalog"],
    queryFn: api.getTestCatalog,
  });

  const queuePatients =
    patients?.filter((p) => p.status === "REGISTRATION_PAID") || [];

  const labTests =
    testCatalog?.filter((t) => t.type === "lab" && t.active) || [];
  const radioTests =
    testCatalog?.filter((t) => t.type === "radiology" && t.active) || [];

  const selectedPatient = patients?.find(
    (p) => p.id === Number(selectedPatientId),
  );
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
      const patientId = Number(selectedPatientId);
      const tests = selectedTests.map((testId) => {
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

      const order = await api.createOrder({
        patientId,
        tests,
        totalPrice,
        status: "PENDING_PAYMENT",
        opdNotes: notes,
        createdAt: new Date().toISOString(),
        createdBy: user!.id,
      });

      await api.createPayment({
        patientId,
        orderId: order.id,
        amount: totalPrice,
        type: "investigation",
        status: "PENDING",
        createdAt: new Date().toISOString(),
        processedBy: user!.id,
      });

      await api.updatePatientStatus(patientId, "PENDING_PAYMENT");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      addToast(
        "Investigation order created. Payment request sent to reception.",
        "success",
      );
      navigate("/opd/queue");
    },
    onError: () => addToast("Failed to create order", "error"),
  });

  if (!patients || !testCatalog) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
          Investigation Order
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Create investigation order and send to reception for payment
        </p>
      </div>

      {/* Patient Selection */}
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

      {/* Test Selection */}
      {selectedPatientId && (
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
    </div>
  );
}
