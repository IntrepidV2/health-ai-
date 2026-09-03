
import React, { useState, useEffect } from 'react';
import { dataService } from './services/dataService';
import { Patient, Appointment } from './types';
import { Navbar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { PrivacyPage } from './components/PrivacyPage';

// Pages
import { Overview } from './pages/Overview';
import { VitalsPage } from './pages/VitalsPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { SettingsPage } from './pages/SettingsPage';
import { DevicesPage } from './pages/DevicesPage';

type AppState = 'LANDING' | 'LOGIN' | 'DASHBOARD' | 'PRIVACY';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('LANDING');
  const [currentView, setCurrentView] = useState('overview');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    setPatient(dataService.getPatient());
    setAppointments(dataService.getAppointments());
  }, []);

  const handlePatientUpdate = (updated: Patient) => {
    setPatient(updated);
  };

  const handleAddAppointment = async (apt: Appointment) => {
    const updated = await dataService.addAppointment(apt);
    setAppointments(updated);
  };

  const handleRemoveAppointment = async (id: string | number) => {
    const updated = await dataService.removeAppointment(id);
    setAppointments(updated);
  };

  const renderDashboardContent = () => {
    if (!patient) return null;

    switch(currentView) {
        case 'overview': 
            return (
              <Overview 
                patient={patient} 
                appointments={appointments}
                onPatientUpdate={handlePatientUpdate} 
                onNavigate={setCurrentView} 
              />
            );
        case 'vitals':
            return <VitalsPage patient={patient} />;
        case 'appointments':
            return (
              <AppointmentsPage 
                appointments={appointments} 
                onAddAppointment={handleAddAppointment} 
                onRemoveAppointment={handleRemoveAppointment}
              />
            );
        case 'documents':
            return <DocumentsPage patient={patient} />;
        case 'settings':
            return <SettingsPage />;
        case 'wearables':
            return <DevicesPage />;
        default:
            return (
              <Overview 
                patient={patient} 
                appointments={appointments}
                onPatientUpdate={handlePatientUpdate} 
                onNavigate={setCurrentView} 
              />
            );
    }
  };

  if (appState === 'PRIVACY') {
    return <PrivacyPage onBack={() => setAppState('LANDING')} />;
  }

  if (appState === 'LANDING') {
      return <LandingPage onGetStarted={() => setAppState('LOGIN')} onPrivacy={() => setAppState('PRIVACY')} />;
  }

  if (appState === 'LOGIN') {
      return <LoginPage onLogin={() => setAppState('DASHBOARD')} onBack={() => setAppState('LANDING')} />;
  }

  if (!patient) return <div className="min-h-screen flex items-center justify-center bg-zinc-50 text-red-600 font-medium">Loading Pulsera Dashboard...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 font-inter text-zinc-900 flex flex-col">
      <Navbar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        onGoHome={() => setAppState('LANDING')} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
          {renderDashboardContent()}
      </main>
      
      <ChatInterface patient={patient} />
    </div>
  );
};

export default App;
