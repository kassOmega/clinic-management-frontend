import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { IconCheck, IconPill, IconSearch, IconX } from "../../components/icons";
import { Badge } from "../../components/UI/Badge";
import { Button } from "../../components/UI/Button";
import { Card } from "../../components/UI/Card";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";

export default function PrescriptionList() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [expandingId, setExpandingId] = useState<number | null>(null);

  const { data: prescriptions } = useQuery({
    queryKey: ["prescriptions"],
    queryFn: api.getPrescriptions,
  });
  const { data: patients } = useQuery({
    queryKey: ["patients"],
    queryFn: api.getPatients,
  });

  const pendingPrescriptions =
    prescriptions?.filter((p) => p.status === "PENDING") || [];
  const dispensedPrescriptions =
    prescriptions?.filter((p) => p.status === "DISPENSED") || [];

  // Search across all prescriptions
  const searchResults =
    prescriptions?.filter((rx) => {
      if (!search) return false;
      const patient = patients?.find((p) => p.id === rx.patientId);
      if (!patient) return false;
      return (
        patient.name.toLowerCase().includes(search.toLowerCase()) ||
        patient.id.toString().includes(search) ||
        patient.phone.includes(search)
      );
    }) || [];

  const dispenseMutation = useMutation({
    mutationFn: async (prescriptionId: number) => {
      const rx = prescriptions!.find((p) => p.id === prescriptionId)!;
      await api.updatePrescriptionStatus(prescriptionId, "DISPENSED");
      await api.updatePatientStatus(rx.patientId, "COMPLETED");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      addToast(
        "Prescription marked as dispensed. Patient assessment completed.",
        "success",
      );
      setExpandingId(null);
    },
    onError: () => addToast("Failed to dispense", "error"),
  });

  const getPatient = (patientId: number) =>
    patients?.find((p) => p.id === patientId);

  if (!prescriptions || !patients) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
          Prescriptions
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {pendingPrescriptions.length} pending ·{" "}
          {dispensedPrescriptions.length} dispensed
        </p>
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Look up patient by name, ID, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-slate-100 text-slate-400"
            >
              <IconX className="w-4 h-4" />
            </button>
          )}
        </div>
      </Card>

      {/* Search Results */}
      {search && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Search Results ({searchResults.length})
          </h2>
          {searchResults.length === 0 ? (
            <Card>
              <p className="text-sm text-slate-500 text-center py-6">
                No prescriptions found for this patient
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {searchResults.map((rx) => {
                const patient = getPatient(rx.patientId);
                if (!patient) return null;
                const isExpanded = expandingId === rx.id;
                return (
                  <Card key={rx.id}>
                    <button
                      onClick={() => setExpandingId(isExpanded ? null : rx.id)}
                      className="w-full flex items-start justify-between text-left"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-base font-semibold text-slate-900">
                            {patient.name}
                          </h3>
                          <Badge
                            variant={
                              rx.status === "DISPENSED" ? "success" : "warning"
                            }
                          >
                            {rx.status === "DISPENSED"
                              ? "Dispensed"
                              : "Pending"}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500">
                          Patient ID: {patient.id} · RX-{rx.id} ·{" "}
                          {rx.medicines.length} medicine
                          {rx.medicines.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
                        <div className="bg-brand-50 rounded-lg p-3 border border-brand-200">
                          <p className="text-sm font-medium text-slate-900">
                            {patient.name}
                          </p>
                          <p className="text-xs text-slate-600">
                            ID: {patient.id} · {patient.age}y · {patient.gender}{" "}
                            · {patient.bloodGroup} · {patient.phone}
                          </p>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                            Prescribed Medicines
                          </p>
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-slate-200">
                                <th className="text-left text-xs font-semibold text-slate-500 pb-1.5">
                                  Medicine
                                </th>
                                <th className="text-left text-xs font-semibold text-slate-500 pb-1.5">
                                  Dosage
                                </th>
                                <th className="text-left text-xs font-semibold text-slate-500 pb-1.5">
                                  Frequency
                                </th>
                                <th className="text-left text-xs font-semibold text-slate-500 pb-1.5">
                                  Duration
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {rx.medicines.map((m, i) => (
                                <tr
                                  key={i}
                                  className="border-b border-slate-100 last:border-0"
                                >
                                  <td className="py-2 text-sm font-medium text-slate-900">
                                    {m.name}
                                  </td>
                                  <td className="py-2 text-sm text-slate-600">
                                    {m.dosage}
                                  </td>
                                  <td className="py-2 text-sm text-slate-600">
                                    {m.frequency}
                                  </td>
                                  <td className="py-2 text-sm text-slate-600">
                                    {m.duration}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {rx.notes && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                              Doctor's Notes
                            </p>
                            <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-200">
                              {rx.notes}
                            </p>
                          </div>
                        )}

                        <div className="flex justify-end">
                          {rx.status === "PENDING" ? (
                            <Button
                              onClick={() => dispenseMutation.mutate(rx.id)}
                              loading={dispenseMutation.isPending}
                            >
                              <IconCheck className="w-4 h-4" />
                              Mark as Dispensed
                            </Button>
                          ) : (
                            <Badge variant="success" className="py-1.5 px-4">
                              <IconCheck className="w-3.5 h-3.5 mr-1" />
                              Dispensed on{" "}
                              {new Date(rx.createdAt).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Default View: Pending Prescriptions */}
      {!search && (
        <>
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Pending Dispensing
            </h2>
            {pendingPrescriptions.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <IconPill className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-1">
                    All Caught Up
                  </h3>
                  <p className="text-sm text-slate-500">
                    No pending prescriptions
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {pendingPrescriptions.map((rx) => {
                  const patient = getPatient(rx.patientId);
                  if (!patient) return null;
                  const isExpanded = expandingId === rx.id;
                  return (
                    <Card key={rx.id}>
                      <button
                        onClick={() =>
                          setExpandingId(isExpanded ? null : rx.id)
                        }
                        className="w-full flex items-start justify-between text-left"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-base font-semibold text-slate-900">
                              {patient.name}
                            </h3>
                            <Badge variant="warning">Pending</Badge>
                          </div>
                          <p className="text-sm text-slate-500">
                            Patient ID: {patient.id} · RX-{rx.id} ·{" "}
                            {rx.medicines.length} medicine
                            {rx.medicines.length !== 1 ? "s" : ""}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(rx.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
                          <div className="bg-brand-50 rounded-lg p-3 border border-brand-200">
                            <p className="text-sm font-medium text-slate-900">
                              {patient.name}
                            </p>
                            <p className="text-xs text-slate-600">
                              ID: {patient.id} · {patient.age}y ·{" "}
                              {patient.gender} · {patient.bloodGroup} ·{" "}
                              {patient.phone}
                            </p>
                          </div>

                          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                              Prescribed Medicines
                            </p>
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-slate-200">
                                  <th className="text-left text-xs font-semibold text-slate-500 pb-1.5">
                                    Medicine
                                  </th>
                                  <th className="text-left text-xs font-semibold text-slate-500 pb-1.5">
                                    Dosage
                                  </th>
                                  <th className="text-left text-xs font-semibold text-slate-500 pb-1.5">
                                    Frequency
                                  </th>
                                  <th className="text-left text-xs font-semibold text-slate-500 pb-1.5">
                                    Duration
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {rx.medicines.map((m, i) => (
                                  <tr
                                    key={i}
                                    className="border-b border-slate-100 last:border-0"
                                  >
                                    <td className="py-2 text-sm font-medium text-slate-900">
                                      {m.name}
                                    </td>
                                    <td className="py-2 text-sm text-slate-600">
                                      {m.dosage}
                                    </td>
                                    <td className="py-2 text-sm text-slate-600">
                                      {m.frequency}
                                    </td>
                                    <td className="py-2 text-sm text-slate-600">
                                      {m.duration}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {rx.notes && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                Doctor's Notes
                              </p>
                              <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-200">
                                {rx.notes}
                              </p>
                            </div>
                          )}

                          <div className="flex justify-end">
                            <Button
                              onClick={() => dispenseMutation.mutate(rx.id)}
                              loading={dispenseMutation.isPending}
                            >
                              <IconCheck className="w-4 h-4" />
                              Mark as Dispensed
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recently Dispensed */}
          {dispensedPrescriptions.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Recently Dispensed
              </h2>
              <div className="space-y-2">
                {dispensedPrescriptions.slice(0, 5).map((rx) => {
                  const patient = getPatient(rx.patientId);
                  if (!patient) return null;
                  return (
                    <div
                      key={rx.id}
                      className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-slate-200"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {patient.name}{" "}
                          <span className="text-slate-400 font-normal">
                            (ID: {patient.id})
                          </span>
                        </p>
                        <p className="text-xs text-slate-500">
                          RX-{rx.id} ·{" "}
                          {rx.medicines.map((m) => m.name).join(", ")}
                        </p>
                      </div>
                      <Badge variant="success">Dispensed</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
