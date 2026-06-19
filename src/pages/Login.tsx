import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconFlask } from "../components/icons";
import { Button } from "../components/UI/Button";
import { Input } from "../components/UI/Input";
import { Select } from "../components/UI/Select";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../services/api";
import { ROLE_LABELS, type Role } from "../types";

const roleAccounts: Record<Role, { email: string; password: string }> = {
  admin: { email: "admin@clinic.com", password: "admin" },
  reception: { email: "reception@clinic.com", password: "reception" },
  opd: { email: "opd@clinic.com", password: "opd" },
  lab: { email: "lab@clinic.com", password: "lab" },
  radiology: { email: "radio@clinic.com", password: "radio" },
};

export default function Login() {
  const [role, setRole] = useState<Role>("reception");
  const [email, setEmail] = useState("reception@clinic.com");
  const [password, setPassword] = useState("reception");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleRoleChange = (r: string) => {
    const selected = r as Role;
    setRole(selected);
    setEmail(roleAccounts[selected].email);
    setPassword(roleAccounts[selected].password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await api.login(email, password);
      login(user);
      addToast(`Welcome back, ${user.name}`, "success");
      navigate("/dashboard");
    } catch (err: any) {
      addToast(err.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-800 to-slate-900" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-brand-400 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-teal-400 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <IconFlask className="w-7 h-7 text-brand-300" />
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold font-[family-name:var(--font-display)]">
                MedFlow
              </h1>
              <p className="text-brand-300 text-xs uppercase tracking-widest">
                Clinic Management
              </p>
            </div>
          </div>
          <h2 className="text-white text-4xl font-bold font-[family-name:var(--font-display)] leading-tight mb-4">
            Streamline Your Clinic Operations
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed max-w-md">
            Manage patients, investigations, lab results, and prescriptions —
            all in one place. Role-based access keeps everything organized and
            secure.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4">
            {[
              "Patient Registration",
              "Investigation Orders",
              "Lab & Radiology",
              "Prescriptions",
            ].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 text-slate-300 text-sm"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center">
              <IconFlask className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-white text-xl font-bold font-[family-name:var(--font-display)]">
              MedFlow
            </h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
                Sign In
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Select a role to explore the system
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Select
                label="Login As"
                value={role}
                onChange={(e) => handleRoleChange(e.target.value)}
                options={Object.entries(ROLE_LABELS).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="submit"
                loading={loading}
                className="w-full"
                size="lg"
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 font-medium mb-2">
                Demo Accounts
              </p>
              <div className="space-y-1">
                {Object.entries(ROLE_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleRoleChange(key)}
                    className={`w-full text-left text-xs px-2 py-1 rounded hover:bg-slate-200 transition-colors ${role === key ? "bg-brand-50 text-brand-700 font-medium" : "text-slate-600"}`}
                  >
                    {label} — {roleAccounts[key as Role].email}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
