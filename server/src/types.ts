export type Role = 'PATIENT' | 'DOCTOR';
export type RiskLevel = 'NORMAL' | 'WORSENING' | 'CRITICAL';

export interface VitalRecordDTO {
  id: string;
  timestamp: string;
  source: 'MANUAL' | 'HOSPITAL_UPLOAD' | 'WEARABLE';
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  glucose?: number;
  notes?: string;
}

export interface AppointmentDTO {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  type: string;
  status: 'Upcoming' | 'Completed';
  location: string;
}

export interface LabResultDTO {
  id: string;
  timestamp: string;
  testName: string;
  value: string;
  unit: string;
  range: string;
  flag: 'NORMAL' | 'HIGH' | 'LOW';
  source: 'HOSPITAL_UPLOAD';
}

export interface RiskAnalysisDTO {
  level: RiskLevel;
  summary: string;
  actionItems: string[];
  alertTriggered: boolean;
  trend: 'IMPROVING' | 'STABLE' | 'WORSENING';
}

export interface PatientDTO {
  id: string;
  name: string;
  age: number;
  condition: string;
  vitalsHistory: VitalRecordDTO[];
  labHistory: LabResultDTO[];
  currentRisk: RiskAnalysisDTO;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}
