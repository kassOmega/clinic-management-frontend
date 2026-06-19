import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IconPill, IconPlus, IconX } from "../../components/icons";
import { Badge, statusToVariant } from "../../components/UI/Badge";
import { Button } from "../../components/UI/Button";
import { Card, CardHeader, CardTitle } from "../../components/UI/Card";
import { Input } from "../../components/UI/Input";
import { useToast } from "../../context/ToastContext";
import { usePermissions } from "../../hooks/usePermissions";
import { api } from "../../services/api";
import { PATIENT_STATUS_LABELS } from "../../types";

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export default function PrescriptionForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = usePermissions();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const preselectedPatientId = searchParams.get("patientId");
  const [selectedPatientId, setSelectedPatientId] = useState(
    preselectedPatientId || "",
  );
  const [medicines, setMedicines] = useState<Medicine[]>([
    { name: "", dosage: "", frequency: "", duration: "" },
  ]);
  const [notes, setNotes] = useState("");

  const { data: patients } = useQuery({
    queryKey: ["patients"],
    queryFn: api.getPatients,
  });
  const { data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: api.getOrders,
  });
  const { data: labResults } = useQuery({
    queryKey: ["labResults"],
    queryFn: api.getLabResults,
  });
  const { data: radioResults } = useQuery({
    queryKey: ["radioResults"],
    queryFn: api.getRadiologyResults,
  });

  const queuePatients =
    patients?.filter((p) => p.status === "TESTS_COMPLETED") || [];
  const selectedPatient = patients?.find(
    (p) => p.id === Number(selectedPatientId),
  );
  const patientOrders =
    orders?.filter((o) => o.patientId === Number(selectedPatientId)) || [];
  const completedOrder = patientOrders.find(
    (o) => o.status === "RESULTS_READY",
  );
  const patientLabResults =
    labResults?.filter((r) => r.patientId === Number(selectedPatientId)) || [];
  const patientRadioResults =
    radioResults?.filter((r) => r.patientId === Number(selectedPatientId)) ||
    [];

  const addMedicine = () =>
    setMedicines((prev) => [
      ...prev,
      { name: "", dosage: "", frequency: "", duration: "" },
    ]);
  const removeMedicine = (index: number) =>
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  const updateMedicine = (
    index: number,
    field: keyof Medicine,
    value: string,
  ) => {
    setMedicines((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    );
  };

  const hasPrescription = patientOrders.some((o) => o.status === "COMPLETED");

  const mutation = useMutation({
    mutationFn: async () => {
      const patientId = Number(selectedPatientId);
      if (!completedOrder) throw new Error("No completed order found");

      await api.createPrescription({
        patientId,
        orderId: completedOrder.id,
        medicines: medicines.filter((m) => m.name),
        notes,
        status: "PENDING",
        createdAt: new Date().toISOString(),
        createdBy: user!.id,
      });

      await api.updateOrderStatus(completedOrder.id, "COMPLETED");
      await api.updatePatientStatus(patientId, "PRESCRIBED");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      addToast("Prescription created. Patient sent to pharmacy.", "success");
      navigate("/opd/queue");
    },
    onError: (err) => {
      const message =
        err instanceof Error ? err.message : "Failed to create prescription";
      addToast(message, "error");
    },
  });

  if (!patients || !orders) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
          Prescription
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Create prescription and send patient to pharmacy
        </p>
      </div>

      {/* Patient Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Patient</CardTitle>
        </CardHeader>
        {queuePatients.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">
            No patients with completed tests
          </p>
        ) : (
          <div className="space-y-3">
            {queuePatients.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPatientId(p.id.toString())}
                className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${
                  Number(selectedPatientId) === p.id
                    ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-500">
                    ID: {p.id} · {p.age}y · {p.gender}
                  </p>
                </div>
                <Badge variant={statusToVariant(p.status)}>
                  {PATIENT_STATUS_LABELS[p.status]}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Patient Results Review */}
      {selectedPatient && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
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
                <Badge variant={statusToVariant(selectedPatient.status)}>
                  {PATIENT_STATUS_LABELS[selectedPatient.status]}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Lab Results */}
          {patientLabResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Lab Results</CardTitle>
                <Badge variant="success">
                  {patientLabResults.length} tests
                </Badge>
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
                    </tr>
                  </thead>
                  <tbody>
                    {patientLabResults.map((r) => (
                      <tr key={r.id} className="border-b border-slate-100">
                        <td className="py-2 text-sm text-slate-900">
                          {r.testName}
                        </td>
                        <td className="py-2 text-sm font-medium text-slate-900">
                          {r.value} {r.unit}
                        </td>
                        <td className="py-2 text-sm text-slate-500">
                          {r.referenceRange}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Radiology Results */}
          {patientRadioResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Radiology Results</CardTitle>
                <Badge variant="success">
                  {patientRadioResults.length} tests
                </Badge>
              </CardHeader>
              <div className="space-y-4">
                {patientRadioResults.map((r) => (
                  <div key={r.id} className="bg-slate-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">
                      {r.testName}
                    </h4>
                    <p className="text-sm text-slate-600 mb-1">
                      <span className="font-medium text-slate-700">
                        Findings:
                      </span>{" "}
                      {r.findings}
                    </p>
                    <p className="text-sm text-slate-600">
                      <span className="font-medium text-slate-700">
                        Impression:
                      </span>{" "}
                      {r.impression}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Prescription Form */}
          <Card>
            <CardHeader>
              <CardTitle>Prescription</CardTitle>
              <IconPill className="w-5 h-5 text-brand-600" />
            </CardHeader>

            {hasPrescription ? (
              <div className="text-center py-6">
                <p className="text-sm text-slate-500">
                  Prescription already created for this patient and sent to
                  pharmacy.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Medicine List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-700">
                      Medicines
                    </p>
                    <Button variant="ghost" size="sm" onClick={addMedicine}>
                      <IconPlus className="w-4 h-4" /> Add Medicine
                    </Button>
                  </div>

                  {medicines.map((med, index) => (
                    <div
                      key={index}
                      className="relative bg-slate-50 rounded-lg p-4 border border-slate-200"
                    >
                      {medicines.length > 1 && (
                        <button
                          onClick={() => removeMedicine(index)}
                          className="absolute top-2 right-2 p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <IconX className="w-4 h-4" />
                        </button>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Medicine Name"
                          value={med.name}
                          onChange={(e) =>
                            updateMedicine(index, "name", e.target.value)
                          }
                          placeholder="e.g. Amoxicillin"
                        />
                        <Input
                          label="Dosage"
                          value={med.dosage}
                          onChange={(e) =>
                            updateMedicine(index, "dosage", e.target.value)
                          }
                          placeholder="e.g. 500mg"
                        />
                        <Input
                          label="Frequency"
                          value={med.frequency}
                          onChange={(e) =>
                            updateMedicine(index, "frequency", e.target.value)
                          }
                          placeholder="e.g. Three times daily"
                        />
                        <Input
                          label="Duration (total days)"
                          type="number"
                          value={med.duration}
                          onChange={(e) =>
                            updateMedicine(index, "duration", e.target.value)
                          }
                          placeholder="e.g. 7"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Additional Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Dietary advice, follow-up instructions, referrals..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/opd/queue")}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => mutation.mutate()}
                    loading={mutation.isPending}
                    disabled={medicines.filter((m) => m.name).length === 0}
                  >
                    Create Prescription & Send to Pharmacy
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
