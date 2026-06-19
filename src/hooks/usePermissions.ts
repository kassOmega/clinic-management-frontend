import { useAuth } from "../context/AuthContext";

export function usePermissions() {
  const { user, hasPermission, logout } = useAuth();
  return {
    user,
    isReception: user?.role === "reception",
    isOpd: user?.role === "opd",
    isLab: user?.role === "lab",
    isRadiology: user?.role === "radiology",
    isAdmin: user?.role === "admin",
    hasPermission,
    logout,
  };
}
