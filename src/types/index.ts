export type Role =
  | "admin"
  | "reception"
  | "opd"
  | "lab"
  | "radiology"
  | "pharmacy";

export type PatientStatus =
  | "REGISTERED"
  | "REGISTRATION_PAID"
  | "IN_OPD"
  | "PENDING_PAYMENT"
  | "PAYMENT_CONFIRMED"
  | "IN_LAB"
  | "IN_RADIOLOGY"
  | "TESTS_COMPLETED"
  | "PRESCRIBED"
  | "COMPLETED";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAYMENT_CONFIRMED"
  | "IN_PROGRESS"
  | "RESULTS_READY"
  | "COMPLETED";

export type TestStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export type TestType = "lab" | "radiology";

export type PaymentStatus = "PENDING" | "PAID";

export type PaymentType = "registration" | "investigation";
export type PrescriptionStatus = "PENDING" | "DISPENSED";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone: string;
  active: boolean;
}

export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: "Male" | "Female";
  phone: string;
  address: string;
  bloodGroup: string;
  status: PatientStatus;
  registrationDate: string;
  registeredBy: number;
}

export interface TestCatalog {
  id: string;
  name: string;
  type: TestType;
  price: number;
  unit?: string;
  referenceRange?: string;
  description: string;
  active: boolean;
}

export interface OrderTest {
  testId: string;
  testName: string;
  type: TestType;
  price: number;
  unit?: string;
  referenceRange?: string;
  status: TestStatus;
}

export interface InvestigationOrder {
  id: number;
  patientId: number;
  tests: OrderTest[];
  totalPrice: number;
  status: OrderStatus;
  opdNotes: string;
  createdAt: string;
  createdBy: number;
}

export interface LabResult {
  id: number;
  orderId: number;
  patientId: number;
  testId: string;
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  createdAt: string;
  createdBy: number;
}

export interface RadiologyResult {
  id: number;
  orderId: number;
  patientId: number;
  testId: string;
  testName: string;
  findings: string;
  impression: string;
  createdAt: string;
  createdBy: number;
}

export interface PrescriptionMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Payment {
  id: number;
  patientId: number;
  orderId?: number;
  amount: number;
  type: PaymentType;
  status: PaymentStatus;
  createdAt: string;
  processedBy: number;
}
export interface Prescription {
  id: number;
  patientId: number;
  orderId: number;
  medicines: PrescriptionMedicine[];
  notes: string;
  status: PrescriptionStatus;
  createdAt: string;
  createdBy: number;
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrator",
  reception: "Receptionist",
  opd: "OPD Doctor",
  lab: "Lab Technician",
  radiology: "Radiologist",
  pharmacy: "Pharmacist",
};

export const PATIENT_STATUS_LABELS: Record<PatientStatus, string> = {
  REGISTERED: "Registered",
  REGISTRATION_PAID: "Registration Paid",
  IN_OPD: "In OPD",
  PENDING_PAYMENT: "Payment Pending",
  PAYMENT_CONFIRMED: "Payment Confirmed",
  IN_LAB: "In Lab",
  IN_RADIOLOGY: "In Radiology",
  TESTS_COMPLETED: "Tests Completed",
  PRESCRIBED: "Prescribed",
  COMPLETED: "Completed",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Payment Pending",
  PAYMENT_CONFIRMED: "Payment Confirmed",
  IN_PROGRESS: "In Progress",
  RESULTS_READY: "Results Ready",
  COMPLETED: "Completed",
};
