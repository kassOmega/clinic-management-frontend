import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../components/UI/Button";
import { Card, CardHeader, CardTitle } from "../../components/UI/Card";
import { Input } from "../../components/UI/Input";
import { Select } from "../../components/UI/Select";
import { IconPlus } from "../../components/icons";
import { useToast } from "../../context/ToastContext";
import { usePermissions } from "../../hooks/usePermissions";
import { api } from "../../services/api";

interface FormData {
  name: string;
  age: number;
  gender: "Male" | "Female";
  phone: string;
  address: string;
  bloodGroup: string;
}

export default function PatientRegistration() {
  const { user } = usePermissions();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);
  const [newPatientId, setNewPatientId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Create patient
      const patient = await api.createPatient({
        ...data,
        age: Number(data.age),
        status: "REGISTERED",
        registrationDate: new Date().toISOString(),
        registeredBy: user!.id,
      });
      // Create registration payment
      await api.createPayment({
        patientId: patient.id,
        amount: 100,
        type: "registration",
        status: "PENDING",
        createdAt: new Date().toISOString(),
        processedBy: user!.id,
      });
      return patient;
    },
    onSuccess: (patient) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setNewPatientId(patient.id);
      setShowSuccess(true);
      reset();
    },
    onError: () => addToast("Failed to register patient", "error"),
  });

  const handleProcessPayment = async () => {
    if (!newPatientId || !user) return;
    try {
      const payments = await api.getPendingPayments();
      const regPayment = payments.find(
        (p) => p.patientId === newPatientId && p.type === "registration",
      );
      if (regPayment) {
        await api.confirmPayment(regPayment.id);
        await api.updatePatientStatus(newPatientId, "REGISTRATION_PAID");
        queryClient.invalidateQueries({ queryKey: ["patients"] });
        queryClient.invalidateQueries({ queryKey: ["payments"] });
        queryClient.invalidateQueries({ queryKey: ["stats"] });
        addToast(
          "Patient registered and payment processed. Sent to OPD queue.",
          "success",
        );
      }
      setShowSuccess(false);
      setNewPatientId(null);
    } catch {
      addToast("Failed to process payment", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
          Register Patient
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Add a new patient to the system
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>

        {showSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Patient Registered Successfully
            </h3>
            <p className="text-sm text-slate-500 mb-1">
              Patient ID:{" "}
              <span className="font-mono font-bold text-slate-900">
                {newPatientId}
              </span>
            </p>
            <p className="text-sm text-slate-500 mb-6">
              Registration fee: ETB 100 (Pending)
            </p>
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSuccess(false);
                  setNewPatientId(null);
                }}
              >
                Skip Payment
              </Button>
              <Button onClick={handleProcessPayment}>
                Confirm Payment & Send to OPD
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit((data) => mutation.mutate(data))}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                {...register("name", { required: "Name is required" })}
                error={errors.name?.message}
                placeholder="Enter full name"
              />
              <Input
                label="Age"
                type="number"
                {...register("age", {
                  required: "Age is required",
                  min: { value: 0, message: "Invalid age" },
                  max: { value: 150, message: "Invalid age" },
                })}
                error={errors.age?.message}
                placeholder="Age in years"
              />
              <Select
                label="Gender"
                {...register("gender", { required: "Gender is required" })}
                error={errors.gender?.message}
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                ]}
                placeholder="Select gender"
              />
              <Select
                label="Blood Group"
                {...register("bloodGroup", {
                  required: "Blood group is required",
                })}
                error={errors.bloodGroup?.message}
                options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                  (g) => ({ value: g, label: g }),
                )}
                placeholder="Select blood group"
              />
              <Input
                label="Phone Number"
                {...register("phone", { required: "Phone is required" })}
                error={errors.phone?.message}
                placeholder="09XXXXXXXX"
              />
              <Input
                label="Address"
                {...register("address", { required: "Address is required" })}
                error={errors.address?.message}
                placeholder="City, Sub-city"
              />
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button type="submit" loading={mutation.isPending}>
                <IconPlus className="w-4 h-4" />
                Register Patient
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
