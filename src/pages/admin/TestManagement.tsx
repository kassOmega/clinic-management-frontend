import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";

import { IconFlask, IconPlus, IconScan, IconX } from "../../components/icons";
import { Badge } from "../../components/UI/Badge";
import { Button } from "../../components/UI/Button";
import { Card } from "../../components/UI/Card";
import { Input } from "../../components/UI/Input";
import { Modal } from "../../components/UI/Modal";
import { Select } from "../../components/UI/Select";
import { type TestType } from "../../types";

interface FormData {
  name: string;
  type: TestType;
  price: number;
  unit: string;
  referenceRange: string;
  description: string;
  active: boolean;
}

const emptyForm: FormData = {
  name: "",
  type: "lab",
  price: 0,
  unit: "",
  referenceRange: "",
  description: "",
  active: true,
};

export default function TestManagement() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);

  const { data: tests } = useQuery({
    queryKey: ["testCatalog"],
    queryFn: api.getTestCatalog,
  });

  const labTests = tests?.filter((t) => t.type === "lab") || [];
  const radioTests = tests?.filter((t) => t.type === "radiology") || [];

  const saveMutation = useMutation({
    mutationFn: async () => {
      const existing = tests?.find(
        (t) => t.name === form.name && t.type === form.type,
      );
      if (existing) {
        await api.updateTest(existing.id, form);
      } else {
        await api.createTest(form);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testCatalog"] });
      addToast("Test saved", "success");
      setModalOpen(false);
      setForm(emptyForm);
    },
    onError: () => addToast("Failed to save test", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteTest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testCatalog"] });
      addToast("Test deleted", "success");
    },
  });

  const toggleActive = useMutation({
    mutationFn: async (test: { id: string; active: boolean }) => {
      await api.updateTest(test.id, { active: !test.active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testCatalog"] });
      addToast("Test status updated", "success");
    },
  });

  if (!tests) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
            Test Catalog
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {tests.length} tests configured
          </p>
        </div>
        <Button
          onClick={() => {
            setForm(emptyForm);
            setModalOpen(true);
          }}
        >
          <IconPlus className="w-4 h-4" /> Add Test
        </Button>
      </div>

      {/* Lab Tests */}
      <Card padding={false}>
        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
          <IconFlask className="w-5 h-5 text-brand-600" />
          <h3 className="font-semibold text-slate-900">
            Lab Tests ({labTests.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-2">
                  Name
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-2">
                  Unit
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-2">
                  Reference
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-2">
                  Price
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-2">
                  Status
                </th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-2">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {labTests.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-slate-50 hover:bg-slate-50"
                >
                  <td className="px-6 py-3 text-sm font-medium text-slate-900">
                    {t.name}
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-600">
                    {t.unit || "-"}
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-500">
                    {t.referenceRange || "-"}
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-slate-900">
                    ETB {t.price}
                  </td>
                  <td className="px-6 py-3">
                    <Badge variant={t.active ? "success" : "default"}>
                      {t.active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive.mutate(t)}
                      >
                        {t.active ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:bg-rose-50"
                        onClick={() => deleteMutation.mutate(t.id)}
                      >
                        <IconX className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Radiology Tests */}
      <Card padding={false}>
        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
          <IconScan className="w-5 h-5 text-violet-600" />
          <h3 className="font-semibold text-slate-900">
            Radiology Tests ({radioTests.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-2">
                  Name
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-2">
                  Description
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-2">
                  Price
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-2">
                  Status
                </th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-2">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {radioTests.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-slate-50 hover:bg-slate-50"
                >
                  <td className="px-6 py-3 text-sm font-medium text-slate-900">
                    {t.name}
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-500">
                    {t.description}
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-slate-900">
                    ETB {t.price}
                  </td>
                  <td className="px-6 py-3">
                    <Badge variant={t.active ? "success" : "default"}>
                      {t.active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive.mutate(t)}
                      >
                        {t.active ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:bg-rose-50"
                        onClick={() => deleteMutation.mutate(t.id)}
                      >
                        <IconX className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Test"
      >
        <div className="space-y-4">
          <Input
            label="Test Name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Complete Blood Count"
          />
          <Select
            label="Type"
            value={form.type}
            onChange={(e) =>
              setForm((p) => ({ ...p, type: e.target.value as TestType }))
            }
            options={[
              { value: "lab", label: "Laboratory" },
              { value: "radiology", label: "Radiology" },
            ]}
          />
          <Input
            label="Price (ETB)"
            type="number"
            value={form.price}
            onChange={(e) =>
              setForm((p) => ({ ...p, price: Number(e.target.value) }))
            }
            placeholder="0"
          />
          {form.type === "lab" && (
            <>
              <Input
                label="Unit"
                value={form.unit}
                onChange={(e) =>
                  setForm((p) => ({ ...p, unit: e.target.value }))
                }
                placeholder="e.g. mg/dL"
              />
              <Input
                label="Reference Range"
                value={form.referenceRange}
                onChange={(e) =>
                  setForm((p) => ({ ...p, referenceRange: e.target.value }))
                }
                placeholder="e.g. 70-100"
              />
            </>
          )}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              rows={2}
              placeholder="Brief description"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              loading={saveMutation.isPending}
            >
              Save Test
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
