
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import VoiceInterface from './components/VoiceInterface';
import AdminInterface from './components/AdminInterface';
import LandingPage from './components/LandingPage';
import { Appointment, CallLog, Language } from './types';
import { LANDING_PAGE_SPECS } from './landingPageData';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'agent' | 'admin'>('home');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [currentLang, setCurrentLang] = useState<Language>(Language.MK);
  const [settings, setSettings] = useState({
    autoCloseDelay: 10
  });

  // Load data from local storage
  useEffect(() => {
    const savedApts = localStorage.getItem('andro_appointments');
    const savedLogs = localStorage.getItem('andro_call_logs');
    const savedSettings = localStorage.getItem('andro_settings');
    
    if (savedApts) setAppointments(JSON.parse(savedApts));
    if (savedLogs) setCallLogs(JSON.parse(savedLogs));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  const handleNewAppointment = (apt: Appointment) => {
    setAppointments(prev => {
      const updated = [apt, ...prev];
      localStorage.setItem('andro_appointments', JSON.stringify(updated));
      return updated;
    });
  };

  const handleNewCallLog = (log: CallLog) => {
    setCallLogs(prev => {
      const updated = [log, ...prev];
      localStorage.setItem('andro_call_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveSettings = (newSettings: any) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    localStorage.setItem('andro_settings', JSON.stringify(merged));
  };

  const goToAgent = () => {
    setActiveTab('agent');
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        currentLang={currentLang}
        onLangChange={setCurrentLang}
      />
      
      <main className="w-full">
        {activeTab === 'home' && (
          <LandingPage 
            spec={LANDING_PAGE_SPECS[currentLang]} 
            onStartCall={goToAgent} 
            onOpenAdmin={() => setActiveTab('admin')}
          />
        )}
        {activeTab === 'agent' && (
          <VoiceInterface 
            onNewAppointment={handleNewAppointment} 
            onClose={() => setActiveTab('home')}
            onCallEnded={handleNewCallLog}
            autoCloseDelay={settings.autoCloseDelay}
            currentLang={currentLang}
          />
        )}
        {activeTab === 'admin' && (
          <AdminInterface 
            appointments={appointments} 
            callLogs={callLogs}
            onSaveSettings={handleSaveSettings}
            currentSettings={settings}
          />
        )}
      </main>

      {/* Global Status Toast */}
      {appointments.length > 0 && appointments[0].createdAt > Date.now() - 5000 && (
         <div className="fixed bottom-24 right-4 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-4 flex items-center gap-4 z-[100] border border-green-500/50">
            <div className="bg-white/20 p-1.5 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xs uppercase tracking-widest">Success</span>
              <span className="font-bold text-sm opacity-90">Termin successfully saved!</span>
            </div>
         </div>
      )}
    </div>
  );
};

export default App;
