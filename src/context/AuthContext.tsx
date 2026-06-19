import { createContext, useContext, useState, type ReactNode } from "react";
import type { Role, User } from "../types";

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const PERMISSIONS: Record<Role, string[]> = {
  admin: [
    "create_patient",
    "process_payment",
    "view_patient",
    "create_investigation_order",
    "create_prescription",
    "view_investigation_order",
    "create_lab_result",
    "create_radiology_result",
    "manage_users",
    "manage_tests",
    "view_reports",
    "view_patient_history",
    "dispense_medicine",
  ],
  reception: ["create_patient", "process_payment", "view_patient"],
  opd: [
    "view_patient",
    "create_investigation_order",
    "create_prescription",
    "view_investigation_order",
    "view_patient_history",
  ],
  lab: ["view_investigation_order", "create_lab_result", "view_patient"],
  radiology: [
    "view_investigation_order",
    "create_radiology_result",
    "view_patient",
  ],
  pharmacy: ["dispense_medicine"],
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (u: User) => setUser(u);
  const logout = () => setUser(null);

  const hasPermission = (permission: string) => {
    if (!user) return false;
    return PERMISSIONS[user.role]?.includes(permission) ?? false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
