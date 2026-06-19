import type {
  InvestigationOrder,
  LabResult,
  OrderStatus,
  Patient,
  PatientStatus,
  Payment,
  Prescription,
  RadiologyResult,
  TestCatalog,
  TestStatus,
  User,
} from "../types";

// ── Initial Users ──────────────────────────────────────────────
const users: User[] = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@clinic.com",
    role: "admin",
    phone: "0911000001",
    active: true,
  },
  {
    id: 2,
    name: "Helen Tadesse",
    email: "reception@clinic.com",
    role: "reception",
    phone: "0911000002",
    active: true,
  },
  {
    id: 3,
    name: "Dr. Tesfaye Bekele",
    email: "opd@clinic.com",
    role: "opd",
    phone: "0911000003",
    active: true,
  },
  {
    id: 4,
    name: "Dawit Mekonnen",
    email: "lab@clinic.com",
    role: "lab",
    phone: "0911000004",
    active: true,
  },
  {
    id: 5,
    name: "Dr. Selamawit Girma",
    email: "radio@clinic.com",
    role: "radiology",
    phone: "0911000005",
    active: true,
  },
];

// ── Test Catalog ───────────────────────────────────────────────
const testCatalog: TestCatalog[] = [
  {
    id: "L1",
    name: "Complete Blood Count (CBC)",
    type: "lab",
    price: 200,
    unit: "cells/μL",
    referenceRange: "4.5-11.0 × 10⁶",
    description: "Full blood count",
    active: true,
  },
  {
    id: "L2",
    name: "Fasting Blood Glucose",
    type: "lab",
    price: 150,
    unit: "mg/dL",
    referenceRange: "70-100",
    description: "Fasting glucose level",
    active: true,
  },
  {
    id: "L3",
    name: "Liver Function Test (LFT)",
    type: "lab",
    price: 350,
    unit: "U/L",
    referenceRange: "7-56",
    description: "Liver enzyme levels",
    active: true,
  },
  {
    id: "L4",
    name: "Kidney Function Test (KFT)",
    type: "lab",
    price: 300,
    unit: "mg/dL",
    referenceRange: "0.7-1.3",
    description: "Creatinine and BUN",
    active: true,
  },
  {
    id: "L5",
    name: "Urinalysis",
    type: "lab",
    price: 100,
    unit: "-",
    referenceRange: "Normal",
    description: "Urine analysis",
    active: true,
  },
  {
    id: "L6",
    name: "Lipid Profile",
    type: "lab",
    price: 250,
    unit: "mg/dL",
    referenceRange: "<200 total",
    description: "Cholesterol and triglycerides",
    active: true,
  },
  {
    id: "R1",
    name: "Chest X-Ray",
    type: "radiology",
    price: 400,
    description: "PA view chest radiograph",
    active: true,
  },
  {
    id: "R2",
    name: "Abdominal Ultrasound",
    type: "radiology",
    price: 600,
    description: "Abdominal US scan",
    active: true,
  },
  {
    id: "R3",
    name: "CT Scan (Head)",
    type: "radiology",
    price: 1500,
    description: "Non-contrast head CT",
    active: true,
  },
  {
    id: "R4",
    name: "MRI (Brain)",
    type: "radiology",
    price: 3000,
    description: "Brain MRI with contrast",
    active: true,
  },
  {
    id: "R5",
    name: "X-Ray (Extremity)",
    type: "radiology",
    price: 300,
    description: "Limb X-ray",
    active: true,
  },
];

// ── Patients ───────────────────────────────────────────────────
const patients: Patient[] = [
  {
    id: 101,
    name: "Abebe Kebede",
    age: 45,
    gender: "Male",
    phone: "0921000001",
    address: "Bole, Addis Ababa",
    bloodGroup: "A+",
    status: "COMPLETED",
    registrationDate: "2025-01-10T08:00:00",
    registeredBy: 2,
  },
  {
    id: 102,
    name: "Tigist Mengistu",
    age: 32,
    gender: "Female",
    phone: "0921000002",
    address: "Merkato, Addis Ababa",
    bloodGroup: "O+",
    status: "PRESCRIBED",
    registrationDate: "2025-01-10T08:30:00",
    registeredBy: 2,
  },
  {
    id: 103,
    name: "Solomon Haile",
    age: 58,
    gender: "Male",
    phone: "0921000003",
    address: "Kazanchis, Addis Ababa",
    bloodGroup: "B+",
    status: "TESTS_COMPLETED",
    registrationDate: "2025-01-10T09:00:00",
    registeredBy: 2,
  },
  {
    id: 104,
    name: "Hanna Tadesse",
    age: 27,
    gender: "Female",
    phone: "0921000004",
    address: "Piassa, Addis Ababa",
    bloodGroup: "AB+",
    status: "IN_LAB",
    registrationDate: "2025-01-10T09:15:00",
    registeredBy: 2,
  },
  {
    id: 105,
    name: "Daniel Girma",
    age: 40,
    gender: "Male",
    phone: "0921000005",
    address: "CMC, Addis Ababa",
    bloodGroup: "O-",
    status: "IN_RADIOLOGY",
    registrationDate: "2025-01-10T09:30:00",
    registeredBy: 2,
  },
  {
    id: 106,
    name: "Sara Amare",
    age: 35,
    gender: "Female",
    phone: "0921000006",
    address: "Meganagna, Addis Ababa",
    bloodGroup: "A-",
    status: "PAYMENT_CONFIRMED",
    registrationDate: "2025-01-10T10:00:00",
    registeredBy: 2,
  },
  {
    id: 107,
    name: "Yonas Abebe",
    age: 52,
    gender: "Male",
    phone: "0921000007",
    address: "Sarbet, Addis Ababa",
    bloodGroup: "B-",
    status: "PENDING_PAYMENT",
    registrationDate: "2025-01-10T10:15:00",
    registeredBy: 2,
  },
  {
    id: 108,
    name: "Meron Teklu",
    age: 23,
    gender: "Female",
    phone: "0921000008",
    address: "Hayat, Addis Ababa",
    bloodGroup: "O+",
    status: "IN_OPD",
    registrationDate: "2025-01-10T10:30:00",
    registeredBy: 2,
  },
  {
    id: 109,
    name: "Fikir Addis",
    age: 29,
    gender: "Female",
    phone: "0921000009",
    address: "Lideta, Addis Ababa",
    bloodGroup: "AB-",
    status: "REGISTRATION_PAID",
    registrationDate: "2025-01-10T11:00:00",
    registeredBy: 2,
  },
];

// ── Investigation Orders ───────────────────────────────────────
const orders: InvestigationOrder[] = [
  {
    id: 1001,
    patientId: 101,
    tests: [
      {
        testId: "L1",
        testName: "Complete Blood Count (CBC)",
        type: "lab",
        price: 200,
        unit: "cells/μL",
        referenceRange: "4.5-11.0 × 10⁶",
        status: "COMPLETED",
      },
      {
        testId: "L2",
        testName: "Fasting Blood Glucose",
        type: "lab",
        price: 150,
        unit: "mg/dL",
        referenceRange: "70-100",
        status: "COMPLETED",
      },
      {
        testId: "R1",
        testName: "Chest X-Ray",
        type: "radiology",
        price: 400,
        status: "COMPLETED",
      },
    ],
    totalPrice: 750,
    status: "COMPLETED",
    opdNotes: "Routine checkup, fatigue complaint.",
    createdAt: "2025-01-10T08:20:00",
    createdBy: 3,
  },
  {
    id: 1002,
    patientId: 102,
    tests: [
      {
        testId: "L3",
        testName: "Liver Function Test (LFT)",
        type: "lab",
        price: 350,
        unit: "U/L",
        referenceRange: "7-56",
        status: "COMPLETED",
      },
      {
        testId: "L4",
        testName: "Kidney Function Test (KFT)",
        type: "lab",
        price: 300,
        unit: "mg/dL",
        referenceRange: "0.7-1.3",
        status: "COMPLETED",
      },
      {
        testId: "R2",
        testName: "Abdominal Ultrasound",
        type: "radiology",
        price: 600,
        status: "COMPLETED",
      },
    ],
    totalPrice: 1250,
    status: "COMPLETED",
    opdNotes: "Abdominal pain, elevated liver enzymes suspected.",
    createdAt: "2025-01-10T08:50:00",
    createdBy: 3,
  },
  {
    id: 1003,
    patientId: 103,
    tests: [
      {
        testId: "L1",
        testName: "Complete Blood Count (CBC)",
        type: "lab",
        price: 200,
        unit: "cells/μL",
        referenceRange: "4.5-11.0 × 10⁶",
        status: "COMPLETED",
      },
      {
        testId: "L5",
        testName: "Urinalysis",
        type: "lab",
        price: 100,
        unit: "-",
        referenceRange: "Normal",
        status: "COMPLETED",
      },
      {
        testId: "R1",
        testName: "Chest X-Ray",
        type: "radiology",
        price: 400,
        status: "COMPLETED",
      },
    ],
    totalPrice: 700,
    status: "RESULTS_READY",
    opdNotes: "Chronic cough, need baseline workup.",
    createdAt: "2025-01-10T09:20:00",
    createdBy: 3,
  },
  {
    id: 1004,
    patientId: 104,
    tests: [
      {
        testId: "L2",
        testName: "Fasting Blood Glucose",
        type: "lab",
        price: 150,
        unit: "mg/dL",
        referenceRange: "70-100",
        status: "IN_PROGRESS",
      },
      {
        testId: "L6",
        testName: "Lipid Profile",
        type: "lab",
        price: 250,
        unit: "mg/dL",
        referenceRange: "<200 total",
        status: "PENDING",
      },
    ],
    totalPrice: 400,
    status: "IN_PROGRESS",
    opdNotes: "Family history of diabetes, screening recommended.",
    createdAt: "2025-01-10T09:40:00",
    createdBy: 3,
  },
  {
    id: 1005,
    patientId: 105,
    tests: [
      {
        testId: "R1",
        testName: "Chest X-Ray",
        type: "radiology",
        price: 400,
        status: "IN_PROGRESS",
      },
      {
        testId: "R3",
        testName: "CT Scan (Head)",
        type: "radiology",
        price: 1500,
        status: "PENDING",
      },
    ],
    totalPrice: 1900,
    status: "IN_PROGRESS",
    opdNotes: "Persistent headache with visual disturbance.",
    createdAt: "2025-01-10T09:50:00",
    createdBy: 3,
  },
  {
    id: 1006,
    patientId: 106,
    tests: [
      {
        testId: "L1",
        testName: "Complete Blood Count (CBC)",
        type: "lab",
        price: 200,
        unit: "cells/μL",
        referenceRange: "4.5-11.0 × 10⁶",
        status: "PENDING",
      },
      {
        testId: "L3",
        testName: "Liver Function Test (LFT)",
        type: "lab",
        price: 350,
        unit: "U/L",
        referenceRange: "7-56",
        status: "PENDING",
      },
      {
        testId: "R2",
        testName: "Abdominal Ultrasound",
        type: "radiology",
        price: 600,
        status: "PENDING",
      },
    ],
    totalPrice: 1150,
    status: "PAYMENT_CONFIRMED",
    opdNotes: "Right upper quadrant pain, jaundice noted.",
    createdAt: "2025-01-10T10:20:00",
    createdBy: 3,
  },
  {
    id: 1007,
    patientId: 107,
    tests: [
      {
        testId: "L2",
        testName: "Fasting Blood Glucose",
        type: "lab",
        price: 150,
        unit: "mg/dL",
        referenceRange: "70-100",
        status: "PENDING",
      },
      {
        testId: "L4",
        testName: "Kidney Function Test (KFT)",
        type: "lab",
        price: 300,
        unit: "mg/dL",
        referenceRange: "0.7-1.3",
        status: "PENDING",
      },
      {
        testId: "R1",
        testName: "Chest X-Ray",
        type: "radiology",
        price: 400,
        status: "PENDING",
      },
    ],
    totalPrice: 850,
    status: "PENDING_PAYMENT",
    opdNotes: "Hypertension follow-up, renal assessment needed.",
    createdAt: "2025-01-10T10:35:00",
    createdBy: 3,
  },
];

// ── Lab Results ────────────────────────────────────────────────
const labResults: LabResult[] = [
  {
    id: 5001,
    orderId: 1001,
    patientId: 101,
    testId: "L1",
    testName: "Complete Blood Count (CBC)",
    value: "7.2 × 10⁶",
    unit: "cells/μL",
    referenceRange: "4.5-11.0 × 10⁶",
    createdAt: "2025-01-10T09:00:00",
    createdBy: 4,
  },
  {
    id: 5002,
    orderId: 1001,
    patientId: 101,
    testId: "L2",
    testName: "Fasting Blood Glucose",
    value: "92",
    unit: "mg/dL",
    referenceRange: "70-100",
    createdAt: "2025-01-10T09:10:00",
    createdBy: 4,
  },
  {
    id: 5003,
    orderId: 1002,
    patientId: 102,
    testId: "L3",
    testName: "Liver Function Test (LFT)",
    value: "68",
    unit: "U/L",
    referenceRange: "7-56",
    createdAt: "2025-01-10T09:30:00",
    createdBy: 4,
  },
  {
    id: 5004,
    orderId: 1002,
    patientId: 102,
    testId: "L4",
    testName: "Kidney Function Test (KFT)",
    value: "1.1",
    unit: "mg/dL",
    referenceRange: "0.7-1.3",
    createdAt: "2025-01-10T09:40:00",
    createdBy: 4,
  },
  {
    id: 5005,
    orderId: 1003,
    patientId: 103,
    testId: "L1",
    testName: "Complete Blood Count (CBC)",
    value: "5.8 × 10⁶",
    unit: "cells/μL",
    referenceRange: "4.5-11.0 × 10⁶",
    createdAt: "2025-01-10T10:00:00",
    createdBy: 4,
  },
  {
    id: 5006,
    orderId: 1003,
    patientId: 103,
    testId: "L5",
    testName: "Urinalysis",
    value: "Normal",
    unit: "-",
    referenceRange: "Normal",
    createdAt: "2025-01-10T10:05:00",
    createdBy: 4,
  },
];

// ── Radiology Results ──────────────────────────────────────────
const radiologyResults: RadiologyResult[] = [
  {
    id: 6001,
    orderId: 1001,
    patientId: 101,
    testId: "R1",
    testName: "Chest X-Ray",
    findings:
      "Lung fields clear bilaterally. No consolidation or effusion. Heart size normal.",
    impression: "Normal chest radiograph.",
    createdAt: "2025-01-10T09:30:00",
    createdBy: 5,
  },
  {
    id: 6002,
    orderId: 1002,
    patientId: 102,
    testId: "R2",
    testName: "Abdominal Ultrasound",
    findings:
      "Liver shows mild hepatomegaly with increased echogenicity. Gallbladder normal. No free fluid.",
    impression: "Mild fatty liver changes. Correlate with LFT.",
    createdAt: "2025-01-10T10:10:00",
    createdBy: 5,
  },
  {
    id: 6003,
    orderId: 1003,
    patientId: 103,
    testId: "R1",
    testName: "Chest X-Ray",
    findings:
      "Hyperinflated lung fields. Flattened diaphragms. Increased retrosternal airspace.",
    impression:
      "Findings suggestive of COPD. Clinical correlation recommended.",
    createdAt: "2025-01-10T10:30:00",
    createdBy: 5,
  },
];

// ── Prescriptions ──────────────────────────────────────────────
const prescriptions: Prescription[] = [
  {
    id: 7001,
    patientId: 101,
    orderId: 1001,
    medicines: [
      {
        name: "Vitamin D3",
        dosage: "1000 IU",
        frequency: "Once daily",
        duration: "30 days",
      },
      {
        name: "Multivitamin",
        dosage: "1 tablet",
        frequency: "Once daily",
        duration: "30 days",
      },
    ],
    notes: "Fatigue likely due to vitamin D deficiency. Follow up in 1 month.",
    createdAt: "2025-01-10T11:00:00",
    createdBy: 3,
  },
  {
    id: 7002,
    patientId: 102,
    orderId: 1002,
    medicines: [
      {
        name: "Ursodeoxycholic Acid",
        dosage: "300mg",
        frequency: "Twice daily",
        duration: "60 days",
      },
      {
        name: "Silymarin",
        dosage: "140mg",
        frequency: "Three times daily",
        duration: "60 days",
      },
    ],
    notes:
      "Fatty liver disease. Dietary modification advised. Reduce fat intake. Follow up with LFT in 2 months.",
    createdAt: "2025-01-10T11:30:00",
    createdBy: 3,
  },
];

// ── Payments ───────────────────────────────────────────────────
const payments: Payment[] = [
  // Registration payments
  {
    id: 3001,
    patientId: 101,
    amount: 100,
    type: "registration",
    status: "PAID",
    createdAt: "2025-01-10T08:05:00",
    processedBy: 2,
  },
  {
    id: 3002,
    patientId: 102,
    amount: 100,
    type: "registration",
    status: "PAID",
    createdAt: "2025-01-10T08:35:00",
    processedBy: 2,
  },
  {
    id: 3003,
    patientId: 103,
    amount: 100,
    type: "registration",
    status: "PAID",
    createdAt: "2025-01-10T09:05:00",
    processedBy: 2,
  },
  {
    id: 3004,
    patientId: 104,
    amount: 100,
    type: "registration",
    status: "PAID",
    createdAt: "2025-01-10T09:20:00",
    processedBy: 2,
  },
  {
    id: 3005,
    patientId: 105,
    amount: 100,
    type: "registration",
    status: "PAID",
    createdAt: "2025-01-10T09:35:00",
    processedBy: 2,
  },
  {
    id: 3006,
    patientId: 106,
    amount: 100,
    type: "registration",
    status: "PAID",
    createdAt: "2025-01-10T10:05:00",
    processedBy: 2,
  },
  {
    id: 3007,
    patientId: 107,
    amount: 100,
    type: "registration",
    status: "PAID",
    createdAt: "2025-01-10T10:20:00",
    processedBy: 2,
  },
  {
    id: 3008,
    patientId: 108,
    amount: 100,
    type: "registration",
    status: "PAID",
    createdAt: "2025-01-10T10:35:00",
    processedBy: 2,
  },
  {
    id: 3009,
    patientId: 109,
    amount: 100,
    type: "registration",
    status: "PAID",
    createdAt: "2025-01-10T11:05:00",
    processedBy: 2,
  },
  // Investigation payments
  {
    id: 3010,
    patientId: 101,
    orderId: 1001,
    amount: 750,
    type: "investigation",
    status: "PAID",
    createdAt: "2025-01-10T08:25:00",
    processedBy: 2,
  },
  {
    id: 3011,
    patientId: 102,
    orderId: 1002,
    amount: 1250,
    type: "investigation",
    status: "PAID",
    createdAt: "2025-01-10T08:55:00",
    processedBy: 2,
  },
  {
    id: 3012,
    patientId: 103,
    orderId: 1003,
    amount: 700,
    type: "investigation",
    status: "PAID",
    createdAt: "2025-01-10T09:25:00",
    processedBy: 2,
  },
  {
    id: 3013,
    patientId: 104,
    orderId: 1004,
    amount: 400,
    type: "investigation",
    status: "PAID",
    createdAt: "2025-01-10T09:45:00",
    processedBy: 2,
  },
  {
    id: 3014,
    patientId: 105,
    orderId: 1005,
    amount: 1900,
    type: "investigation",
    status: "PAID",
    createdAt: "2025-01-10T09:55:00",
    processedBy: 2,
  },
  {
    id: 3015,
    patientId: 106,
    orderId: 1006,
    amount: 1150,
    type: "investigation",
    status: "PAID",
    createdAt: "2025-01-10T10:25:00",
    processedBy: 2,
  },
  {
    id: 3016,
    patientId: 107,
    orderId: 1007,
    amount: 850,
    type: "investigation",
    status: "PENDING",
    createdAt: "2025-01-10T10:40:00",
    processedBy: 2,
  },
];

// ── ID Generator ───────────────────────────────────────────────
let nextPatientId = 200;
let nextOrderId = 2000;
let nextLabResultId = 8000;
let nextRadioResultId = 9000;
let nextPrescriptionId = 8000;
let nextPaymentId = 4000;
let nextUserId = 10;

// ── Store ──────────────────────────────────────────────────────
export const store = {
  // Users
  getUsers: () => [...users],
  getUserById: (id: number) => users.find((u) => u.id === id),
  getUserByEmail: (email: string) => users.find((u) => u.email === email),
  addUser: (data: Omit<User, "id">) => {
    const u = { ...data, id: nextUserId++ };
    users.push(u);
    return u;
  },
  updateUser: (id: number, data: Partial<User>) => {
    const i = users.findIndex((u) => u.id === id);
    if (i >= 0) Object.assign(users[i], data);
    return users[i];
  },
  deleteUser: (id: number) => {
    const i = users.findIndex((u) => u.id === id);
    if (i >= 0) users.splice(i, 1);
  },

  // Test Catalog
  getTestCatalog: () => [...testCatalog],
  getTestCatalogById: (id: string) => testCatalog.find((t) => t.id === id),
  addTest: (data: Omit<TestCatalog, "id">) => {
    const t = {
      ...data,
      id: data.type === "lab" ? `L${nextPaymentId}` : `R${nextPaymentId}`,
    };
    testCatalog.push(t);
    return t;
  },
  updateTest: (id: string, data: Partial<TestCatalog>) => {
    const i = testCatalog.findIndex((t) => t.id === id);
    if (i >= 0) Object.assign(testCatalog[i], data);
    return testCatalog[i];
  },
  deleteTest: (id: string) => {
    const i = testCatalog.findIndex((t) => t.id === id);
    if (i >= 0) testCatalog.splice(i, 1);
  },

  // Patients
  getPatients: () => [...patients],
  getPatientById: (id: number) => patients.find((p) => p.id === id),
  addPatient: (data: Omit<Patient, "id">) => {
    const p = { ...data, id: nextPatientId++ };
    patients.push(p);
    return p;
  },
  updatePatientStatus: (id: number, status: PatientStatus) => {
    const p = patients.find((pt) => pt.id === id);
    if (p) p.status = status;
    return p;
  },

  // Orders
  getOrders: () => [...orders],
  getOrdersByPatient: (patientId: number) =>
    orders.filter((o) => o.patientId === patientId),
  getOrderById: (id: number) => orders.find((o) => o.id === id),
  addOrder: (data: Omit<InvestigationOrder, "id">) => {
    const o = { ...data, id: nextOrderId++ };
    orders.push(o);
    return o;
  },
  updateOrderStatus: (id: number, status: OrderStatus) => {
    const o = orders.find((or) => or.id === id);
    if (o) o.status = status;
    return o;
  },
  updateOrderTestStatus: (
    orderId: number,
    testId: string,
    status: TestStatus,
  ) => {
    const o = orders.find((or) => or.id === orderId);
    if (o) {
      const t = o.tests.find((ts) => ts.testId === testId);
      if (t) t.status = status;
    }
    return o;
  },
  recalcOrderStatus: (orderId: number) => {
    const o = orders.find((or) => or.id === orderId);
    if (!o) return o;
    const allDone = o.tests.every((t) => t.status === "COMPLETED");
    const anyStarted = o.tests.some(
      (t) => t.status === "IN_PROGRESS" || t.status === "COMPLETED",
    );
    if (allDone) {
      if (o.status !== "COMPLETED") o.status = "RESULTS_READY";
    } else if (anyStarted) {
      o.status = "IN_PROGRESS";
    }
    return o;
  },

  // Payments
  getPayments: () => [...payments],
  getPendingPayments: () => payments.filter((p) => p.status === "PENDING"),
  addPayment: (data: Omit<Payment, "id">) => {
    const p = { ...data, id: nextPaymentId++ };
    payments.push(p);
    return p;
  },
  confirmPayment: (id: number) => {
    const p = payments.find((pa) => pa.id === id);
    if (p) p.status = "PAID";
    return p;
  },

  // Lab Results
  getLabResults: () => [...labResults],
  getLabResultsByOrder: (orderId: number) =>
    labResults.filter((r) => r.orderId === orderId),
  getLabResultsByPatient: (patientId: number) =>
    labResults.filter((r) => r.patientId === patientId),
  addLabResult: (data: Omit<LabResult, "id">) => {
    const r = { ...data, id: nextLabResultId++ };
    labResults.push(r);
    return r;
  },

  // Radiology Results
  getRadiologyResults: () => [...radiologyResults],
  getRadiologyResultsByOrder: (orderId: number) =>
    radiologyResults.filter((r) => r.orderId === orderId),
  getRadiologyResultsByPatient: (patientId: number) =>
    radiologyResults.filter((r) => r.patientId === patientId),
  addRadiologyResult: (data: Omit<RadiologyResult, "id">) => {
    const r = { ...data, id: nextRadioResultId++ };
    radiologyResults.push(r);
    return r;
  },

  // Prescriptions
  getPrescriptions: () => [...prescriptions],
  getPrescriptionsByPatient: (patientId: number) =>
    prescriptions.filter((p) => p.patientId === patientId),
  getPrescriptionsByOrder: (orderId: number) =>
    prescriptions.filter((p) => p.orderId === orderId),
  addPrescription: (data: Omit<Prescription, "id">) => {
    const p = { ...data, id: nextPrescriptionId++ };
    prescriptions.push(p);
    return p;
  },

  // Stats
  getStats: () => ({
    totalPatients: patients.length,
    completedToday: patients.filter((p) =>
      ["COMPLETED", "PRESCRIBED"].includes(p.status),
    ).length,
    pendingPayments: payments.filter((p) => p.status === "PENDING").length,
    totalRevenue: payments
      .filter((p) => p.status === "PAID")
      .reduce((s, p) => s + p.amount, 0),
    inLab: patients.filter((p) => p.status === "IN_LAB").length,
    inRadiology: patients.filter((p) => p.status === "IN_RADIOLOGY").length,
    inOpdQueue: patients.filter((p) =>
      ["REGISTRATION_PAID", "TESTS_COMPLETED"].includes(p.status),
    ).length,
    ordersInProgress: orders.filter((o) =>
      ["IN_PROGRESS", "PAYMENT_CONFIRMED"].includes(o.status),
    ).length,
    totalOrders: orders.length,
    totalLabResults: labResults.length,
    totalRadioResults: radiologyResults.length,
    totalPrescriptions: prescriptions.length,
    patientsByStatus: patients.reduce<Record<string, Patient[]>>((acc, p) => {
      (acc[p.status] ??= []).push(p);
      return acc;
    }, {}),
  }),
};
