import { useState } from "react";
import { IconEye, IconEyeSlash, IconFlask } from "../components/icons";
import { Button } from "../components/UI/Button";
import { Input } from "../components/UI/Input";
import { Select } from "../components/UI/Select";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { ROLE_LABELS, type Role } from "../types";

const roleAccounts: Record<Role, { email: string; password: string }> = {
  admin: { email: "admin@clinic.com", password: "admin" },
  reception: { email: "reception@clinic.com", password: "reception" },
  opd: { email: "opd@clinic.com", password: "opd" },
  lab: { email: "lab@clinic.com", password: "lab" },
  radiology: { email: "radio@clinic.com", password: "radio" },
  pharmacy: { email: "pharmacy@clinic.com", password: "pharmacy" },
};

export default function Login() {
  const [role, setRole] = useState<Role>("reception");
  const [email, setEmail] = useState("reception@clinic.com");
  const [password, setPassword] = useState("reception");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleRoleChange = (r: string) => {
    const selected = r as Role;
    setRole(selected);
    setEmail(roleAccounts[selected].email);
    setPassword(roleAccounts[selected].password);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.login(email, password);
      login(response);
      // Full page navigation — avoids React state batching issue
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      let message = "Something went wrong. Please try again.";

      if (err && typeof err === "object") {
        const e = err as any;
        if (e.response?.data?.message) {
          message = e.response.data.message;
        } else if (e.response?.status === 401) {
          message =
            "Invalid credentials. Please check your email and password.";
        } else if (e.response?.status) {
          message = `Server error (${e.response.status}).`;
        } else if (e.code === "ERR_NETWORK" || e.code === "ECONNABORTED") {
          message =
            "Cannot connect to the server. Make sure the backend is running on port 3000.";
        } else if (e.message) {
          message = e.message;
        }
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left panel */}
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
              <h1 className="text-white text-4xl font-bold font-[family-name:var(--font-display)]">
                KASS
              </h1>
              <p className="text-brand-300 text-xl uppercase tracking-widest">
                Clinic Management
              </p>
            </div>
          </div>
          <h2 className="text-white text-4xl font-bold font-[family-name:var(--font-display)] leading-tight mb-4">
            Streamline Your Clinic Operations
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed max-w-md">
            Manage patients, investigations, lab results, radiology, pharmacy,
            and prescriptions — all in one place.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4">
            {[
              "Patient Registration",
              "Investigation Orders",
              "Lab & Radiology",
              "Pharmacy",
              "Prescriptions",
              "Role-based Access",
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

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center">
              <IconFlask className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white text-xl font-bold font-[family-name:var(--font-display)]">
                DR. Abeya
              </h1>
              <p className="text-slate-400 text-xs">Medium Clinic</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
                Sign In
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Select a role and enter your credentials
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-3 h-3 text-rose-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-rose-700">{error}</p>
                </div>
              </div>
            )}

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
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="you@clinic.com"
                required
                autoComplete="email"
              />
              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter password"
                    required
                    autoComplete="current-password"
                    className="w-full px-3 py-2 pr-11 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <IconEyeSlash className="w-4 h-4" />
                    ) : (
                      <IconEye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
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
                    className={`w-full text-left text-xs px-2 py-1.5 rounded hover:bg-slate-200 transition-colors flex items-center justify-between ${role === key ? "bg-brand-50 text-brand-700 font-medium" : "text-slate-600"}`}
                  >
                    <span>{label}</span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {roleAccounts[key as Role].email}
                    </span>
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
