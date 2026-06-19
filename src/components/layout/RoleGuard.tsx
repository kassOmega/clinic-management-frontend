import { Navigate } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";
import type { Role } from "../../types";

interface Props {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export function RoleGuard({ children, allowedRoles }: Props) {
  const { user } = usePermissions();

  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role))
    return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
