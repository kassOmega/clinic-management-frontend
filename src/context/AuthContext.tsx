import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Role, User } from "../types";

interface AuthContextType {
  user: User | null;
  login: (response: User & { accessToken: string }) => void;
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
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("clinic_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (responseData: User & { accessToken: string }) => {
    const { accessToken, ...userData } = responseData;
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("clinic_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("clinic_user");
    setUser(null);
  };

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

  // Fall back to localStorage when React state hasn't flushed yet
  // This happens during login → navigate when AppLayout renders before setUser propagates
  const user = useMemo(() => {
    if (ctx.user) return ctx.user;
    try {
      const stored = localStorage.getItem("clinic_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, [ctx.user]);

  return { ...ctx, user };
}
