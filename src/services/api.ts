import { store } from "../data/store";
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

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export const api = {
  // Auth
  login: async (email: string, _password: string) => {
    await delay(500);
    const user = store.getUserByEmail?.(email);
    if (!user) throw new Error("Invalid credentials");
    if (!user.active) throw new Error("Account disabled");
    return user;
  },

  // Users
  getUsers: async () => {
    await delay();
    return store.getUsers();
  },
  createUser: async (data: Omit<User, "id">) => {
    await delay();
    return store.addUser(data);
  },
  updateUser: async (id: number, data: Partial<User>) => {
    await delay();
    return store.updateUser(id, data)!;
  },
  deleteUser: async (id: number) => {
    await delay();
    store.deleteUser(id);
  },

  // Test Catalog
  getTestCatalog: async () => {
    await delay();
    return store.getTestCatalog();
  },
  createTest: async (data: Omit<TestCatalog, "id">) => {
    await delay();
    return store.addTest(data);
  },
  updateTest: async (id: string, data: Partial<TestCatalog>) => {
    await delay();
    return store.updateTest(id, data)!;
  },
  deleteTest: async (id: string) => {
    await delay();
    store.deleteTest(id);
  },

  // Patients
  getPatients: async () => {
    await delay();
    return store.getPatients();
  },
  getPatientById: async (id: number) => {
    await delay();
    return store.getPatientById(id)!;
  },
  createPatient: async (data: Omit<Patient, "id">) => {
    await delay();
    return store.addPatient(data);
  },
  updatePatientStatus: async (id: number, status: PatientStatus) => {
    await delay();
    return store.updatePatientStatus(id, status)!;
  },

  // Orders
  getOrders: async () => {
    await delay();
    return store.getOrders();
  },
  getOrdersByPatient: async (patientId: number) => {
    await delay();
    return store.getOrdersByPatient(patientId);
  },
  getOrderById: async (id: number) => {
    await delay();
    return store.getOrderById(id)!;
  },
  createOrder: async (data: Omit<InvestigationOrder, "id">) => {
    await delay();
    return store.addOrder(data);
  },
  updateOrderStatus: async (id: number, status: OrderStatus) => {
    await delay();
    return store.updateOrderStatus(id, status)!;
  },
  updateOrderTestStatus: async (
    orderId: number,
    testId: string,
    status: TestStatus,
  ) => {
    await delay();
    return store.updateOrderTestStatus(orderId, testId, status)!;
  },
  recalcOrderStatus: async (orderId: number) => {
    await delay();
    return store.recalcOrderStatus(orderId)!;
  },

  // Payments
  getPayments: async () => {
    await delay();
    return store.getPayments();
  },
  getPendingPayments: async () => {
    await delay();
    return store.getPendingPayments();
  },
  createPayment: async (data: Omit<Payment, "id">) => {
    await delay();
    return store.addPayment(data);
  },
  confirmPayment: async (id: number) => {
    await delay();
    return store.confirmPayment(id)!;
  },

  // Lab Results
  getLabResults: async () => {
    await delay();
    return store.getLabResults();
  },
  getLabResultsByOrder: async (orderId: number) => {
    await delay();
    return store.getLabResultsByOrder(orderId);
  },
  getLabResultsByPatient: async (patientId: number) => {
    await delay();
    return store.getLabResultsByPatient(patientId);
  },
  createLabResult: async (data: Omit<LabResult, "id">) => {
    await delay();
    return store.addLabResult(data);
  },

  // Radiology Results
  getRadiologyResults: async () => {
    await delay();
    return store.getRadiologyResults();
  },
  getRadiologyResultsByOrder: async (orderId: number) => {
    await delay();
    return store.getRadiologyResultsByOrder(orderId);
  },
  getRadiologyResultsByPatient: async (patientId: number) => {
    await delay();
    return store.getRadiologyResultsByPatient(patientId);
  },
  createRadiologyResult: async (data: Omit<RadiologyResult, "id">) => {
    await delay();
    return store.addRadiologyResult(data);
  },

  // Prescriptions
  getPrescriptions: async () => {
    await delay();
    return store.getPrescriptions();
  },
  getPrescriptionsByPatient: async (patientId: number) => {
    await delay();
    return store.getPrescriptionsByPatient(patientId);
  },
  getPrescriptionsByOrder: async (orderId: number) => {
    await delay();
    return store.getPrescriptionsByOrder(orderId);
  },
  createPrescription: async (data: Omit<Prescription, "id">) => {
    await delay();
    return store.addPrescription(data);
  },
  addTestsToOrder: async (
    orderId: number,
    tests: OrderTest[],
    processedBy: number,
  ) => {
    await delay();
    return store.addTestsToOrder(orderId, tests, processedBy);
  },
  updateLabResult: async (resultId: number, data: { value: string }) => {
    await delay();
    return store.updateLabResult(resultId, data)!;
  },
  updateRadiologyResult: async (
    resultId: number,
    data: { findings: string; impression: string },
  ) => {
    await delay();
    return store.updateRadiologyResult(resultId, data)!;
  },
  updatePrescriptionStatus: async (id: number, status: PrescriptionStatus) => {
    await delay();
    return store.updatePrescriptionStatus(id, status)!;
  },
  // Stats
  getStats: async () => {
    await delay();
    return store.getStats();
  },
};
