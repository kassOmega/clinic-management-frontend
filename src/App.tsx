import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { RoleGuard } from "./components/layout/RoleGuard";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

import Reports from "./pages/admin/Reports";
import TestManagement from "./pages/admin/TestManagement";
import UserManagement from "./pages/admin/UserManagement";
import Dashboard from "./pages/Dashboard";
import LabOrders from "./pages/lab/LabOrders";
import LabResultEntry from "./pages/lab/LabResultEntry";
import Login from "./pages/Login";
import InvestigationOrderForm from "./pages/opd/InvestigationOrderForm";
import PatientQueue from "./pages/opd/PatientQueue";
import PrescriptionForm from "./pages/opd/PrescriptionForm";
import RadiologyOrders from "./pages/radiology/RadiologyOrders";
import RadiologyResultEntry from "./pages/radiology/RadiologyResultEntry";
import PatientList from "./pages/reception/PatientList";
import PatientRegistration from "./pages/reception/PatientRegistration";
import PaymentProcessing from "./pages/reception/PaymentProcessing";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 0, retry: false } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Reception routes */}
                <Route
                  path="/reception/register"
                  element={
                    <RoleGuard allowedRoles={["reception", "admin"]}>
                      <PatientRegistration />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/reception/patients"
                  element={
                    <RoleGuard allowedRoles={["reception", "admin"]}>
                      <PatientList />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/reception/payments"
                  element={
                    <RoleGuard allowedRoles={["reception", "admin"]}>
                      <PaymentProcessing />
                    </RoleGuard>
                  }
                />

                {/* OPD routes */}
                <Route
                  path="/opd/queue"
                  element={
                    <RoleGuard allowedRoles={["opd", "admin"]}>
                      <PatientQueue />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/opd/investigations"
                  element={
                    <RoleGuard allowedRoles={["opd", "admin"]}>
                      <InvestigationOrderForm />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/opd/prescriptions"
                  element={
                    <RoleGuard allowedRoles={["opd", "admin"]}>
                      <PrescriptionForm />
                    </RoleGuard>
                  }
                />

                {/* Lab routes */}
                <Route
                  path="/lab/orders"
                  element={
                    <RoleGuard allowedRoles={["lab", "admin"]}>
                      <LabOrders />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/lab/results"
                  element={
                    <RoleGuard allowedRoles={["lab", "admin"]}>
                      <LabResultEntry />
                    </RoleGuard>
                  }
                />

                {/* Radiology routes */}
                <Route
                  path="/radiology/orders"
                  element={
                    <RoleGuard allowedRoles={["radiology", "admin"]}>
                      <RadiologyOrders />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/radiology/results"
                  element={
                    <RoleGuard allowedRoles={["radiology", "admin"]}>
                      <RadiologyResultEntry />
                    </RoleGuard>
                  }
                />

                {/* Admin routes */}
                <Route
                  path="/admin/users"
                  element={
                    <RoleGuard allowedRoles={["admin"]}>
                      <UserManagement />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/tests"
                  element={
                    <RoleGuard allowedRoles={["admin"]}>
                      <TestManagement />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <RoleGuard allowedRoles={["admin"]}>
                      <Reports />
                    </RoleGuard>
                  }
                />

                <Route
                  path="*"
                  element={<Navigate to="/dashboard" replace />}
                />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
