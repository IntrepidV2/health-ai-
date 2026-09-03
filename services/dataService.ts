
import { Patient, VitalRecord, RiskAnalysis, Appointment, DeviceIntegration } from "../types";
import { INITIAL_PATIENT, MOCK_APPOINTMENTS } from "../constants";
import { analyzePatientRisk, extractDataFromDocument } from "./geminiService";

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
      iconColor: 'text-white'
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
      iconColor: 'text-zinc-900'
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
      iconColor: 'text-green-600'
    },
    { 
      id: 'fitbit', 
      name: 'Fitbit Sense', 
      provider: 'Fitbit', 
      type: 'Wearable', 
      status: 'Disconnected',
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-600'
    },
    { 
      id: 'whoop', 
      name: 'Whoop 4.0', 
      provider: 'Whoop', 
      type: 'Wearable', 
      status: 'Disconnected',
      iconBg: 'bg-zinc-800',
      iconColor: 'text-white'
    }
  ];

  constructor() {
    // Load patient
    const storedPatient = localStorage.getItem('pulsera_patient');
    this.patient = storedPatient ? JSON.parse(storedPatient) : INITIAL_PATIENT;

    // Load appointments
    const storedApts = localStorage.getItem('pulsera_appointments');
    this.appointments = storedApts ? JSON.parse(storedApts) : (MOCK_APPOINTMENTS as Appointment[]);
  }

  getPatient(): Patient {
    return this.patient;
  }

  getAppointments(): Appointment[] {
    return this.appointments;
  }

  getDevices(): DeviceIntegration[] {
    return this.devices;
  }

  async toggleDeviceConnection(id: string): Promise<DeviceIntegration[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    this.devices = this.devices.map(d => {
        if (d.id === id) {
            const isConnected = d.status === 'Connected';
            return {
                ...d,
                status: isConnected ? 'Disconnected' : 'Connected',
                lastSync: isConnected ? undefined : 'Just now',
                batteryLevel: isConnected ? undefined : Math.floor(Math.random() * 40) + 60
            };
        }
        return d;
    });
    return [...this.devices];
  }

  async syncAllDevices(): Promise<DeviceIntegration[]> {
    // Simulate syncing connected devices
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.devices = this.devices.map(d => {
        if (d.status === 'Connected') {
            return { ...d, lastSync: 'Just now' };
        }
        return d;
    });
    return [...this.devices];
  }

  async addAppointment(apt: Appointment): Promise<Appointment[]> {
    this.appointments = [apt, ...this.appointments];
    this.save();
    return this.appointments;
  }

  async removeAppointment(id: string | number): Promise<Appointment[]> {
    this.appointments = this.appointments.filter(a => a.id !== id);
    this.save();
    return this.appointments;
  }

  // Helper to send formatted data to n8n
  private sendToWebhook(record: VitalRecord) {
    const baseUrl = 'https://greatt.app.n8n.cloud/webhook-test/550f11ff-b16f-4ac2-b5f7-43c08f078bfc';
    
    // Strategy: Send data via URL Query Params AND FormData. 
    // This ensures n8n sees the individual fields regardless of body parsing config.
    
    const params = new URLSearchParams();
    const formData = new FormData();

    const appendData = (key: string, value: any) => {
        if (value !== undefined && value !== null) {
            const strVal = String(value);
            params.append(key, strVal);
            formData.append(key, strVal);
        }
    };

    appendData('id', record.id);
    appendData('timestamp', record.timestamp);
    appendData('source', record.source);
    appendData('systolic', record.systolic);
    appendData('diastolic', record.diastolic);
    appendData('heartRate', record.heartRate);
    appendData('glucose', record.glucose);
    appendData('temperature', record.temperature);
    appendData('notes', record.notes);

    // Append params to URL for guaranteed visibility in n8n 'query' object
    const fullUrl = `${baseUrl}?${params.toString()}`;

    // Send as POST with FormData body
    // mode: 'no-cors' prevents CORS errors but makes response opaque
    fetch(fullUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: formData 
    }).catch(err => console.error("n8n Webhook Error:", err));
  }

  async addVitalRecord(record: Omit<VitalRecord, 'id' | 'timestamp'>): Promise<Patient> {
    const newRecord: VitalRecord = {
      ...record,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString()
    };

    // Send to n8n webhook if Manual entry
    if (newRecord.source === 'MANUAL') {
        this.sendToWebhook(newRecord);
    }

    const updatedHistory = [...this.patient.vitalsHistory, newRecord];
    const tempPatient = { ...this.patient, vitalsHistory: updatedHistory };

    const analysis: RiskAnalysis = await analyzePatientRisk(tempPatient, newRecord);

    this.patient = {
      ...tempPatient,
      currentRisk: analysis
    };

    this.save();
    return this.patient;
  }

  async processHospitalUpload(file: File): Promise<Patient> {
    // 1. Perform OCR extraction using Gemini
    let extractedData: Partial<VitalRecord>;
    try {
        extractedData = await extractDataFromDocument(file);
    } catch (e) {
        console.error("OCR Extraction failed", e);
        throw new Error("Could not extract data from the document. Please ensure it's a valid medical report.");
    }

    // 2. Create Record with extracted data
    const newRecord: VitalRecord = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      source: 'HOSPITAL_UPLOAD',
      systolic: extractedData.systolic,
      diastolic: extractedData.diastolic,
      heartRate: extractedData.heartRate,
      glucose: extractedData.glucose,
      temperature: extractedData.temperature,
      notes: extractedData.notes || `Extracted from ${file.name}`
    };

    // 3. Send extracted data to n8n webhook
    this.sendToWebhook(newRecord);

     // 4. Update History & Analyze Risk
     const updatedHistory = [...this.patient.vitalsHistory, newRecord];
     const tempPatient = { ...this.patient, vitalsHistory: updatedHistory };
     const analysis: RiskAnalysis = await analyzePatientRisk(tempPatient, newRecord);
 
     this.patient = {
       ...tempPatient,
       currentRisk: analysis
     };
     
     this.save();
     return this.patient;
  }

  private save() {
    localStorage.setItem('pulsera_patient', JSON.stringify(this.patient));
    localStorage.setItem('pulsera_appointments', JSON.stringify(this.appointments));
  }
}

export const dataService = new DataService();
