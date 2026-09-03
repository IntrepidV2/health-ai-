import React from 'react';
import { Patient, Appointment } from '../types';
import { HealthStatusCard } from '../components/HealthStatusCard';
import { DataEntry } from '../components/DataEntry';
import { VitalsChart } from '../components/VitalsChart';

interface OverviewProps {
  patient: Patient;
  appointments: Appointment[];
  onPatientUpdate: (p: Patient) => void;
  onNavigate: (view: string) => void;
}

export const Overview: React.FC<OverviewProps> = ({ patient, appointments, onPatientUpdate, onNavigate }) => {
  // Find the closest upcoming appointment
  const nextApt = appointments
    .filter(a => a.status === 'Upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <div className="space-y-6">
      
      {/* Welcome Header */}
      <div className="flex items-end justify-between pb-4 border-b border-zinc-200">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Dashboard</h1>
            <p className="text-zinc-500 mt-1">Overview of your health metrics and tasks.</p>
          </div>
          <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-zinc-900">{new Date().toLocaleDateString(undefined, {weekday:'long', month:'long', day:'numeric'})}</p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (Status) - Span 4 */}
        <div className="lg:col-span-4 space-y-6">
          <HealthStatusCard risk={patient.currentRisk} />
          <DataEntry onUpdate={onPatientUpdate} />
        </div>

        {/* Right Column (Analytics) - Span 8 */}
        <div className="lg:col-span-8 space-y-6">
           
           {/* Appointment Card (Dynamic) */}
           <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <h3 className="font-bold text-zinc-900 text-sm uppercase tracking-wide">Next Appointment</h3>
                </div>
                <button onClick={() => onNavigate('appointments')} className="text-xs text-red-600 font-bold hover:underline">View All</button>
            </div>
            
            {nextApt ? (
                <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-red-600 font-bold border border-zinc-200 shadow-sm text-lg">
                    {new Date(nextApt.date).getDate()}
                </div>
                <div>
                    <p className="font-bold text-zinc-900">{nextApt.doctor}</p>
                    <p className="text-xs text-zinc-500">
                        {nextApt.specialty} • {new Date(nextApt.date).toLocaleString(undefined, { weekday:'short', hour:'2-digit', minute:'2-digit' })}
                    </p>
                </div>
                </div>
            ) : (
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-center">
                    <p className="text-zinc-500 text-sm font-medium">No upcoming appointments.</p>
                </div>
            )}
          </div>

          <div className="h-[400px]">
             <VitalsChart data={patient.vitalsHistory} key={patient.vitalsHistory.length} />
          </div>
        </div>
      </div>
    </div>
  );
};