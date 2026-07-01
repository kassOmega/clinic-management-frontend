import axios from "axios";
import type {
  InvestigationOrder,
  LabResult,
  OrderStatus,
  OrderTest,
  Patient,
  PatientStatus,
  Payment,
  Prescription,
  PrescriptionStatus,
  RadiologyResult,
  TestCatalog,
  TestStatus,
  User,
} from "../types";

const http = axios.create({
  baseURL: "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("clinic_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

function extract<T>(promise: Promise<{ data: unknown }>): Promise<T> {
  return promise.then((res) => res.data as T);
}

// ── Auth ────────────────────────────────────────
const login = (email: string, password: string) =>
  extract<{
    id: number;
    name: string;
    email: string;
    role: string;
    phone: string;
    active: boolean;
    accessToken: string;
  }>(http.post("/auth/login", { email, password })).then((data) => ({
    ...data,
    role: data.role as import("../types").Role,
  }));

// ── Users ───────────────────────────────────────
const getUsers = () => extract<User[]>(http.get("/users"));
const getUserById = (id: number) => extract<User>(http.get(`/users/${id}`));
const addUser = (dto: Record<string, unknown>) =>
  extract<User>(http.post("/users", dto));
const updateUser = (id: number, dto: Record<string, unknown>) =>
  extract<User>(http.put(`/users/${id}`, dto));
const deleteUser = (id: number) =>
  http.delete(`/users/${id}`).then(() => undefined);

// ── Test Catalog ────────────────────────────────
const getTestCatalog = () => extract<TestCatalog[]>(http.get("/tests"));
const createTest = (dto: Record<string, unknown>) =>
  extract<TestCatalog>(http.post("/tests", dto));
const updateTest = (id: string, dto: Record<string, unknown>) =>
  extract<TestCatalog>(http.put(`/tests/${id}`, dto));
const deleteTest = (id: string) =>
  http.delete(`/tests/${id}`).then(() => undefined);

// ── Patients ────────────────────────────────────
const getPatients = () => extract<Patient[]>(http.get("/patients"));
const getQueuePatients = () => extract<Patient[]>(http.get("/patients/queue"));
const getPatientById = (id: number) =>
  extract<Patient>(http.get(`/patients/${id}`));
const createPatient = (dto: Record<string, unknown>) =>
  extract<Patient>(http.post("/patients", dto));
const updatePatientStatus = (id: number, status: PatientStatus) =>
  extract<Patient>(http.patch(`/patients/${id}/status`, { status }));

// ── Orders ──────────────────────────────────────
const getOrders = () => extract<InvestigationOrder[]>(http.get("/orders"));
const getOrdersByPatient = (patientId: number) =>
  extract<InvestigationOrder[]>(http.get(`/orders/patient/${patientId}`));
const getOrderById = (id: number) =>
  extract<InvestigationOrder>(http.get(`/orders/${id}`));
const getNewQueue = () => extract<Patient[]>(http.get("/patients/queue/new"));
const getReturningQueue = () =>
  extract<Patient[]>(http.get("/patients/queue/returning"));

// ── Queue with Orders (Combined) ────────────────
export interface PatientWithOrder {
  patient: Patient;
  order: InvestigationOrder | null;
}

const getReturningQueueWithOrders = async (): Promise<PatientWithOrder[]> => {
  const patients = await getReturningQueue();
  if (patients.length === 0) return [];

  const results = await Promise.all(
    patients.map(async (patient): Promise<PatientWithOrder> => {
      const orders = await getOrdersByPatient(patient.id);
      // Get the most recent active order (not completed/cancelled)
      const activeOrder =
        orders.find((o) => o.status !== "COMPLETED") ?? orders[0] ?? null;
      return { patient, order: activeOrder };
    }),
  );

  return results;
};

const getLabQueue = () =>
  extract<InvestigationOrder[]>(http.get("/orders/lab/queue"));
const getRadiologyQueue = () =>
  extract<InvestigationOrder[]>(http.get("/orders/radiology/queue"));
const createOrder = (dto: Record<string, unknown>) =>
  extract<InvestigationOrder>(http.post("/orders", dto));
const addTestsToOrder = (orderId: number, tests: OrderTest[]) =>
  extract<InvestigationOrder>(
    http.post(`/orders/${orderId}/add-tests`, { tests }),
  );
const updateOrderStatus = (id: number, status: OrderStatus) =>
  extract<InvestigationOrder>(http.patch(`/orders/${id}/status`, { status }));
const updateOrderTestStatus = (
  orderId: number,
  testId: string,
  status: TestStatus,
) =>
  extract<InvestigationOrder>(
    http.patch(`/orders/${orderId}/test/${testId}/status`, { status }),
  );
const recalcOrderStatus = (orderId: number) =>
  extract<InvestigationOrder>(http.patch(`/orders/${orderId}/recalc-status`));

// ── Payments ────────────────────────────────────
const getPayments = () => extract<Payment[]>(http.get("/payments"));
const getPendingPayments = () =>
  extract<Payment[]>(http.get("/payments/pending"));
const createPayment = (dto: Record<string, unknown>) =>
  extract<Payment>(http.post("/payments", dto));
const confirmPayment = (id: number) =>
  extract<Payment>(http.patch(`/payments/${id}/confirm`));

// ── Lab Results ─────────────────────────────────
const getLabResults = () => extract<LabResult[]>(http.get("/lab-results"));
const getLabResultsByOrder = (orderId: number) =>
  extract<LabResult[]>(http.get(`/lab-results/order/${orderId}`));
const getLabResultsByPatient = (patientId: number) =>
  extract<LabResult[]>(http.get(`/lab-results/patient/${patientId}`));
const createLabResult = (dto: Record<string, unknown>) =>
  extract<LabResult>(http.post("/lab-results", dto));
const updateLabResult = (id: number, dto: { value: string }) =>
  extract<LabResult>(http.patch(`/lab-results/${id}`, dto));

// ── Radiology Results ───────────────────────────
const getRadiologyResults = () =>
  extract<RadiologyResult[]>(http.get("/radiology-results"));
const getRadiologyResultsByOrder = (orderId: number) =>
  extract<RadiologyResult[]>(http.get(`/radiology-results/order/${orderId}`));
const getRadiologyResultsByPatient = (patientId: number) =>
  extract<RadiologyResult[]>(
    http.get(`/radiology-results/patient/${patientId}`),
  );
const createRadiologyResult = (dto: Record<string, unknown>) =>
  extract<RadiologyResult>(http.post("/radiology-results", dto));
const updateRadiologyResult = (
  id: number,
  dto: { findings: string; impression: string },
) => extract<RadiologyResult>(http.patch(`/radiology-results/${id}`, dto));

// ── Prescriptions ───────────────────────────────
const getPrescriptions = () =>
  extract<Prescription[]>(http.get("/prescriptions"));
const getPrescriptionsByPatient = (patientId: number) =>
  extract<Prescription[]>(http.get(`/prescriptions/patient/${patientId}`));
const getPrescriptionsByOrder = (orderId: number) =>
  extract<Prescription[]>(http.get(`/prescriptions/order/${orderId}`));
const createPrescription = (dto: Record<string, unknown>) =>
  extract<Prescription>(http.post("/prescriptions", dto));
const updatePrescriptionStatus = (id: number, status: PrescriptionStatus) =>
  extract<Prescription>(http.patch(`/prescriptions/${id}/status`, { status }));

// ── Stats ──────────────────────────────────────
interface Stats {
  totalPatients: number;
  completedToday: number;
  pendingPayments: number;
  totalRevenue: number;
  inLab: number;
  inRadiology: number;
  inOpdQueue: number;
  ordersInProgress: number;
  totalOrders: number;
  totalLabResults: number;
  totalRadioResults: number;
  totalPrescriptions: number;
  patientsByStatus: Record<string, number>;
}

const getStats = () => extract<Stats>(http.get("/stats"));

// ── Export ──────────────────────────────────────
export const api = {
  login,
  getUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
  getTestCatalog,
  createTest,
  updateTest,
  deleteTest,
  getPatients,
  getQueuePatients,
  getPatientById,
  createPatient,
  updatePatientStatus,
  getNewQueue,
  getReturningQueue,
  getReturningQueueWithOrders,
  getOrders,
  getOrdersByPatient,
  getOrderById,
  createOrder,
  addTestsToOrder,
  updateOrderStatus,
  updateOrderTestStatus,
  recalcOrderStatus,
  getLabQueue,
  getRadiologyQueue,
  getPayments,
  getPendingPayments,
  createPayment,
  confirmPayment,
  getLabResults,
  getLabResultsByOrder,
  getLabResultsByPatient,
  createLabResult,
  updateLabResult,
  getRadiologyResults,
  getRadiologyResultsByOrder,
  getRadiologyResultsByPatient,
  createRadiologyResult,
  updateRadiologyResult,
  getPrescriptions,
  getPrescriptionsByPatient,
  getPrescriptionsByOrder,
  createPrescription,
  updatePrescriptionStatus,
  getStats,
};
