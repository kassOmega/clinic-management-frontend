import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { IconClipboard, IconEye } from "../../components/icons";
import { Badge, statusToVariant } from "../../components/UI/Badge";
import { Button } from "../../components/UI/Button";
import { Card } from "../../components/UI/Card";
import { api } from "../../services/api";
import { PATIENT_STATUS_LABELS } from "../../types";

export default function PatientQueue() {
  const navigate = useNavigate();
  const { data: patients } = useQuery({
    queryKey: ["patients"],
    queryFn: api.getPatients,
  });

  if (!patients) return null;

  // Patients waiting to be seen: registration paid OR tests completed (back for prescription)
  const queue = patients.filter((p) =>
    ["REGISTRATION_PAID", "TESTS_COMPLETED"].includes(p.status),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
          Patient Queue
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {queue.length} patients waiting
        </p>
      </div>

      {queue.length === 0 ? (
        <Card>
          <div className="text-center py-12"></div>
          <IconClipboard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">
            No Patients in Queue
          </h3>
          <p className="text-sm text-slate-500">
            All patients have been attended to
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {queue.map((p) => (
            <Card
              key={p.id}
              className="hover:border-brand-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {p.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    ID: {p.id} · {p.age}y · {p.gender} · {p.bloodGroup}
                  </p>
                </div>
                <Badge variant={statusToVariant(p.status)}>
                  {PATIENT_STATUS_LABELS[p.status]}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                {p.phone} · {p.address}
              </p>
              <div className="flex gap-2">
                {p.status === "REGISTRATION_PAID" && (
                  <Button
                    size="sm"
                    onClick={() =>
                      navigate(`/opd/investigations?patientId=${p.id}`)
                    }
                  >
                    Create Investigation Order
                  </Button>
                )}
                {p.status === "TESTS_COMPLETED" && (
                  <Button
                    size="sm"
                    onClick={() =>
                      navigate(`/opd/prescriptions?patientId=${p.id}`)
                    }
                  >
                    Create Prescription
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(`/reception/patients`)}
                >
                  <IconEye className="w-4 h-4" />
                  View
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
