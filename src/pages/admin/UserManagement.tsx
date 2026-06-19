import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { IconPlus, IconX } from "../../components/icons";
import { Badge } from "../../components/UI/Badge";
import { Button } from "../../components/UI/Button";
import { Card } from "../../components/UI/Card";
import { Input } from "../../components/UI/Input";
import { Modal } from "../../components/UI/Modal";
import { Select } from "../../components/UI/Select";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";
import { ROLE_LABELS, type Role } from "../../types";

interface FormData {
  name: string;
  email: string;
  role: Role;
  phone: string;
}

export default function UserManagement() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    role: "reception",
    phone: "",
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: api.getUsers,
  });

  const openCreate = () => {
    setEditId(null);
    setForm({ name: "", email: "", role: "reception", phone: "" });
    setModalOpen(true);
  };

  const openEdit = (user: FormData & { id: number }) => {
    setEditId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    });
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editId) {
        await api.updateUser(editId, form);
      } else {
        await api.createUser({ ...form, active: true });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      addToast(editId ? "User updated" : "User created", "success");
      setModalOpen(false);
    },
    onError: () => addToast("Failed to save user", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      addToast("User deleted", "success");
    },
    onError: () => addToast("Failed to delete user", "error"),
  });

  const toggleActive = useMutation({
    mutationFn: async (user: { id: number; active: boolean }) => {
      await api.updateUser(user.id, { active: !user.active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      addToast("User status updated", "success");
    },
  });

  if (!users) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
            User Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {users.length} system users
          </p>
        </div>
        <Button onClick={openCreate}>
          <IconPlus className="w-4 h-4" /> Add User
        </Button>
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                  Name
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                  Email
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                  Role
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                  Phone
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                  Status
                </th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-3 text-sm font-medium text-slate-900">
                    {u.name}
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-600">
                    {u.email}
                  </td>
                  <td className="px-6 py-3">
                    <Badge variant="purple">{ROLE_LABELS[u.role]}</Badge>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-600">
                    {u.phone}
                  </td>
                  <td className="px-6 py-3">
                    <Badge variant={u.active ? "success" : "default"}>
                      {u.active ? "Active" : "Disabled"}
                    </Badge>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(u)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive.mutate(u)}
                      >
                        {u.active ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        onClick={() => deleteMutation.mutate(u.id)}
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
        title={editId ? "Edit User" : "Add User"}
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Enter name"
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="email@clinic.com"
          />
          <Select
            label="Role"
            value={form.role}
            onChange={(e) =>
              setForm((p) => ({ ...p, role: e.target.value as Role }))
            }
            options={Object.entries(ROLE_LABELS).map(([v, l]) => ({
              value: v,
              label: l,
            }))}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            placeholder="09XXXXXXXX"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              loading={saveMutation.isPending}
            >
              {editId ? "Update" : "Create"} User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
