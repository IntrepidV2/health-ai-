import { Patient, RiskLevel } from './types';

export const MOCK_PATIENT_ID = 'p-123456';

export const INITIAL_PATIENT: Patient = {
  id: MOCK_PATIENT_ID,
  name: "Alex Rivera",
  age: 42,
  condition: "Hypertension & Type 2 Diabetes",
  vitalsHistory: [
    { id: 'v1', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), source: 'MANUAL', systolic: 120, diastolic: 80, heartRate: 72, glucose: 105, temperature: 98.4, notes: "Feeling good" },
    { id: 'v2', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), source: 'MANUAL', systolic: 125, diastolic: 82, heartRate: 75, glucose: 110, temperature: 98.6, notes: "Ate late dinner" },
    { id: 'v3', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), source: 'HOSPITAL_UPLOAD', systolic: 130, diastolic: 85, heartRate: 78, glucose: 115, temperature: 99.1, notes: "Clinic checkup" },
  ],
  labHistory: [
    { id: 'l1', timestamp: new Date(Date.now() - 86400000 * 180).toISOString(), testName: "HbA1c", value: "6.2", unit: "%", range: "4.0-5.6", flag: "HIGH", source: "HOSPITAL_UPLOAD" },
    { id: 'l2', timestamp: new Date(Date.now() - 86400000 * 90).toISOString(), testName: "HbA1c", value: "6.5", unit: "%", range: "4.0-5.6", flag: "HIGH", source: "HOSPITAL_UPLOAD" },
    { id: 'l3', timestamp: new Date(Date.now() - 86400000 * 10).toISOString(), testName: "HbA1c", value: "6.8", unit: "%", range: "4.0-5.6", flag: "HIGH", source: "HOSPITAL_UPLOAD" },
    { id: 'l4', timestamp: new Date(Date.now() - 86400000 * 180).toISOString(), testName: "Cholesterol (Total)", value: "190", unit: "mg/dL", range: "125-200", flag: "NORMAL", source: "HOSPITAL_UPLOAD" },
    { id: 'l5', timestamp: new Date(Date.now() - 86400000 * 10).toISOString(), testName: "Cholesterol (Total)", value: "210", unit: "mg/dL", range: "125-200", flag: "HIGH", source: "HOSPITAL_UPLOAD" }
  ],
  currentRisk: {
    level: 'NORMAL' as RiskLevel,
    summary: "Your vitals are slightly elevating but remain within a manageable range.",
    actionItems: ["Monitor glucose before breakfast", "Reduce sodium intake"],
    alertTriggered: false,
    trend: 'STABLE'
  }
};

export const MOCK_APPOINTMENTS = [
  { id: 1, doctor: "Dr. Emily Chen", specialty: "Endocrinologist", date: "2024-03-25T10:00:00", type: "Follow-up", status: "Upcoming", location: "Pulsera Medical Center, Suite 304" },
  { id: 2, doctor: "Dr. Sarah Connors", specialty: "Cardiologist", date: "2024-03-10T14:30:00", type: "Annual Physical", status: "Completed", location: "Heart & Vascular Institute" },
  { id: 3, doctor: "Lab Corp", specialty: "Diagnostics", date: "2024-03-08T09:00:00", type: "Blood Work", status: "Completed", location: "Main St Lab" },
];

export const MOCK_DOCUMENTS = [
  { id: 1, name: "Blood Work Analysis.pdf", date: "2024-03-08", type: "Lab Report", size: "1.2 MB", status: "Analyzed" },
  { id: 2, name: "Cardiology Referral.pdf", date: "2024-02-15", type: "Referral", size: "450 KB", status: "Archived" },
  { id: 3, name: "Annual Physical Summary.pdf", date: "2024-01-20", type: "Summary", size: "2.4 MB", status: "Analyzed" },
];