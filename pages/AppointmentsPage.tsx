
import React, { useState } from 'react';
import { Appointment } from '../types';

interface AppointmentsPageProps {
  appointments: Appointment[];
  onAddAppointment: (apt: Appointment) => void;
  onRemoveAppointment: (id: string | number) => void;
}

const AVAILABLE_DOCTORS = [
  { id: 'dr1', name: "Dr. Emily Chen", specialty: "Endocrinologist" },
  { id: 'dr2', name: "Dr. Sarah Connors", specialty: "Cardiologist" },
  { id: 'dr3', name: "Dr. James Wilson", specialty: "General Practitioner" },
  { id: 'dr4', name: "Dr. Ayesha Malik", specialty: "Neurologist" }
];

export const AppointmentsPage: React.FC<AppointmentsPageProps> = ({ appointments, onAddAppointment, onRemoveAppointment }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    doctor: '',
    date: '',
    time: '',
    reason: ''
  });

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.doctor || !formData.date || !formData.time) return;

    const selectedDoc = AVAILABLE_DOCTORS.find(d => d.id === formData.doctor);
    
    const newAppointment: Appointment = {
      id: Math.random().toString(36).substring(7),
      doctor: selectedDoc?.name || "Unknown Doctor",
      specialty: selectedDoc?.specialty || "Specialist",
      date: `${formData.date}T${formData.time}`,
      type: "Requested Visit",
      status: "Upcoming",
      location: "Pulsera Medical Center"
    };

    onAddAppointment(newAppointment);
    setIsModalOpen(false);
    setFormData({ doctor: '', date: '', time: '', reason: '' }); 
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">Appointments</h2>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors"
            >
                Request New
            </button>
        </div>

        {/* Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-800">Request Appointment</h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <form onSubmit={handleRequest} className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Doctor</label>
                            <select 
                                required
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                value={formData.doctor}
                                onChange={e => setFormData({...formData, doctor: e.target.value})}
                            >
                                <option value="">-- Choose a Specialist --</option>
                                {AVAILABLE_DOCTORS.map(doc => (
                                    <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialty})</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preferred Date</label>
                                <input 
                                    type="date" 
                                    required
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                    value={formData.date}
                                    onChange={e => setFormData({...formData, date: e.target.value})}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preferred Time</label>
                                <input 
                                    type="time" 
                                    required
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                    value={formData.time}
                                    onChange={e => setFormData({...formData, time: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reason for Visit</label>
                            <textarea 
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none h-24 resize-none"
                                placeholder="Briefly describe your symptoms or reason for checking in..."
                                value={formData.reason}
                                onChange={e => setFormData({...formData, reason: e.target.value})}
                            />
                        </div>

                        <div className="pt-2 flex gap-3 justify-end">
                            <button 
                                type="button" 
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200"
                            >
                                Confirm Request
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        <div className="grid gap-4">
            {appointments.map((apt) => (
                <div key={apt.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-300 transition-colors animate-in fade-in slide-in-from-bottom-2 group">
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${apt.status === 'Upcoming' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                            <span className="font-bold text-lg">{new Date(apt.date).getDate()}</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">{apt.doctor}</h3>
                            <p className="text-slate-500 text-sm">{apt.specialty} • {apt.type}</p>
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {apt.location}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 md:text-right">
                        <div className="flex-1 md:flex-none">
                             <p className="text-sm font-semibold text-slate-900">{new Date(apt.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                             <p className="text-xs text-slate-500">{new Date(apt.date).toLocaleDateString([], {weekday: 'long', year: 'numeric', month: 'long'})}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            apt.status === 'Upcoming' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-green-50 border-green-100 text-green-700'
                        }`}>
                            {apt.status}
                        </span>
                        
                        <div className="w-px h-8 bg-slate-100 mx-2 hidden md:block"></div>

                        <button 
                            onClick={() => onRemoveAppointment(apt.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove Appointment"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
