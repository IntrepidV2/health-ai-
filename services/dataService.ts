import { Patient, VitalRecord, Appointment, DeviceIntegration } from '../types';
import { INITIAL_PATIENT, MOCK_APPOINTMENTS } from '../constants';
import { apiClient } from './apiClient';

class DataService {
  private patient: Patient;
  private appointments: Appointment[];
  private devices: DeviceIntegration[] = [
    {
      id: 'apple-health',
      name: 'Apple Health',
      provider: 'Apple',
      type: 'App',
      status: 'Connected',
      lastSync: '10 mins ago',
      iconBg: 'bg-zinc-900',
      iconColor: 'text-white',
    },
    {
      id: 'oura',
      name: 'Oura Ring Gen 3',
      provider: 'Oura',
      type: 'Wearable',
      status: 'Connected',
      lastSync: 'Just now',
      batteryLevel: 82,
      iconBg: 'bg-zinc-100',
      iconColor: 'text-zinc-900',
    },
    {
      id: 'dexcom',
      name: 'Dexcom G7',
      provider: 'Dexcom',
      type: 'Medical Device',
      status: 'Connected',
      lastSync: '5 mins ago',
      batteryLevel: 100,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      id: 'fitbit',
      name: 'Fitbit Sense',
      provider: 'Fitbit',
      type: 'Wearable',
      status: 'Disconnected',
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-600',
    },
    {
      id: 'whoop',
      name: 'Whoop 4.0',
      provider: 'Whoop',
      type: 'Wearable',
      status: 'Disconnected',
      iconBg: 'bg-zinc-800',
      iconColor: 'text-white',
    },
  ];

  constructor() {
    const storedPatient = localStorage.getItem('pulsera_patient');
    this.patient = storedPatient ? JSON.parse(storedPatient) : INITIAL_PATIENT;

    const storedApts = localStorage.getItem('pulsera_appointments');
    this.appointments = storedApts ? JSON.parse(storedApts) : (MOCK_APPOINTMENTS as Appointment[]);
  }

  async fetchPatient(): Promise<Patient> {
    try {
      const data = await apiClient.get<Patient>('/api/vitals');
      this.patient = data;
      this.save();
      return this.patient;
    } catch (err) {
      console.warn('Could not fetch patient from backend, using local data:', err);
      return this.patient;
    }
  }

  getPatient(): Patient {
    return this.patient;
  }

  async fetchAppointments(): Promise<Appointment[]> {
    try {
      const data = await apiClient.get<Appointment[]>('/api/appointments');
      this.appointments = data;
      this.save();
      return this.appointments;
    } catch (err) {
      console.warn('Could not fetch appointments from backend, using local data:', err);
      return this.appointments;
    }
  }

  getAppointments(): Appointment[] {
    return this.appointments;
  }

  getDevices(): DeviceIntegration[] {
    return this.devices;
  }

  async toggleDeviceConnection(id: string): Promise<DeviceIntegration[]> {
    await new Promise((resolve) => setTimeout(resolve, 1200));

    this.devices = this.devices.map((d) => {
      if (d.id === id) {
        const isConnected = d.status === 'Connected';
        return {
          ...d,
          status: isConnected ? 'Disconnected' : 'Connected',
          lastSync: isConnected ? undefined : 'Just now',
          batteryLevel: isConnected ? undefined : Math.floor(Math.random() * 40) + 60,
        };
      }
      return d;
    });
    return [...this.devices];
  }

  async syncAllDevices(): Promise<DeviceIntegration[]> {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    this.devices = this.devices.map((d) => {
      if (d.status === 'Connected') {
        return { ...d, lastSync: 'Just now' };
      }
      return d;
    });
    return [...this.devices];
  }

  async addAppointment(apt: Appointment): Promise<Appointment[]> {
    try {
      const updated = await apiClient.post<Appointment[]>('/api/appointments', apt);
      this.appointments = updated;
      this.save();
      return this.appointments;
    } catch (err) {
      console.warn('Failed to add appointment on backend, updating locally:', err);
      this.appointments = [apt, ...this.appointments];
      this.save();
      return this.appointments;
    }
  }

  async removeAppointment(id: string | number): Promise<Appointment[]> {
    try {
      const updated = await apiClient.delete<Appointment[]>(`/api/appointments/${id}`);
      this.appointments = updated;
      this.save();
      return this.appointments;
    } catch (err) {
      console.warn('Failed to remove appointment on backend, updating locally:', err);
      this.appointments = this.appointments.filter((a) => a.id !== id);
      this.save();
      return this.appointments;
    }
  }

  async addVitalRecord(record: Omit<VitalRecord, 'id' | 'timestamp'>): Promise<Patient> {
    try {
      const updatedPatient = await apiClient.post<Patient>('/api/vitals', record);
      this.patient = updatedPatient;
      this.save();
      return this.patient;
    } catch (err) {
      console.warn('Failed to add vital on backend, falling back to local simulation:', err);
      const newRecord: VitalRecord = {
        ...record,
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toISOString(),
      };
      this.patient = {
        ...this.patient,
        vitalsHistory: [...this.patient.vitalsHistory, newRecord],
      };
      this.save();
      return this.patient;
    }
  }

  async processHospitalUpload(file: File): Promise<Patient> {
    try {
      const updatedPatient = await apiClient.upload<Patient>('/api/vitals/upload-document', file);
      this.patient = updatedPatient;
      this.save();
      return this.patient;
    } catch (err) {
      console.error('Server hospital upload failed:', err);
      throw new Error('Could not analyze document with server. Please check your connection.');
    }
  }

  private save() {
    localStorage.setItem('pulsera_patient', JSON.stringify(this.patient));
    localStorage.setItem('pulsera_appointments', JSON.stringify(this.appointments));
  }
}

export const dataService = new DataService();
