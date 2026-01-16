
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Appointment, CallLog, Service, Language } from '../types';
import { SERVICES as INITIAL_SERVICES, BUSINESS_NAME, FULL_ADDRESS, GET_SYSTEM_INSTRUCTION } from '../constants';

interface AdminProps {
  appointments: Appointment[];
  callLogs: CallLog[];
  onSaveSettings: (settings: any) => void;
  currentSettings?: {
    autoCloseDelay: number;
    services?: Service[];
    agentName?: string;
    voiceName?: string;
    voiceSpeed?: number;
    voiceTone?: number;
  };
}

const AdminInterface: React.FC<AdminProps> = ({ appointments, callLogs, onSaveSettings, currentSettings }) => {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'calls' | 'orders' | 'settings'>('dashboard');
  const [showSuccess, setShowSuccess] = useState(false);
  const [closeDelay, setCloseDelay] = useState(currentSettings?.autoCloseDelay || 10);
  const [managedServices, setManagedServices] = useState<Service[]>(currentSettings?.services || INITIAL_SERVICES);
  
  // New Agent Settings
  const [agentName, setAgentName] = useState(currentSettings?.agentName || "Ema");
  const [voiceName, setVoiceName] = useState(currentSettings?.voiceName || "Fenrir");
  const [voiceSpeed, setVoiceSpeed] = useState(currentSettings?.voiceSpeed || 1.0);
  const [voiceTone, setVoiceTone] = useState(currentSettings?.voiceTone || 1.0);

  // Stats calculation
  const stats = useMemo(() => {
    const revenue = appointments
      .filter(a => a.status === 'confirmed')
      .reduce((acc, a) => {
        // Very basic price parsing for demo
        return acc + 1500; // Placeholder average value
      }, 0);

    const distribution = appointments.reduce((acc: any, a) => {
      acc[a.serviceName] = (acc[a.serviceName] || 0) + 1;
      return acc;
    }, {});

    return {
      totalCalls: callLogs.length,
      totalOrders: appointments.length,
      totalSales: revenue,
      serviceDistribution: Object.entries(distribution).map(([name, value]) => ({ name, value: value as number })),
    };
  }, [appointments, callLogs]);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const handleSave = () => {
    onSaveSettings({ 
      autoCloseDelay: closeDelay,
      services: managedServices,
      agentName,
      voiceName,
      voiceSpeed,
      voiceTone
    });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const updateService = (id: string, field: keyof Service, value: any) => {
    setManagedServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Conversations</p>
          <p className="text-4xl font-black text-indigo-600 mt-2 tracking-tighter">{stats.totalCalls}</p>
          <div className="mt-4 h-1 w-12 bg-indigo-100 rounded-full"></div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Orders</p>
          <p className="text-4xl font-black text-emerald-600 mt-2 tracking-tighter">{stats.totalOrders}</p>
          <div className="mt-4 h-1 w-12 bg-emerald-100 rounded-full"></div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimated Value</p>
          <p className="text-4xl font-black text-slate-900 mt-2 tracking-tighter">~{stats.totalSales.toLocaleString()} ден.</p>
          <div className="mt-4 h-1 w-12 bg-slate-200 rounded-full"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tight">Product Interest</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.serviceDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} tick={{ fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} tick={{ fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={45}>
                  {stats.serviceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tight">Recent Activity</h3>
          <div className="space-y-4">
            {callLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${log.bookingStatus === 'confirmed' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  <div>
                    <p className="font-black text-slate-900 text-sm uppercase">{log.customerName || 'Anonymous Call'}</p>
                    <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">{new Date(log.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  log.status === 'completed' ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-600'
                }`}>
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCalls = () => (
    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Call Records</h3>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{callLogs.length} Total Logs</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/30">
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Outcome</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {callLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-6">
                  <p className="text-sm font-bold text-slate-900">{new Date(log.timestamp).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                </td>
                <td className="p-6">
                  <p className="text-sm font-black text-slate-900 uppercase">{log.customerName || '---'}</p>
                  <p className="text-xs font-mono text-slate-400">{log.customerPhone || '---'}</p>
                </td>
                <td className="p-6">
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    log.status === 'completed' ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {log.status}
                  </span>
                </td>
                <td className="p-6">
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    log.bookingStatus === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 
                    log.bookingStatus === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {log.bookingStatus}
                  </span>
                </td>
                <td className="p-6">
                  <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View Transcript</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Orders & Inquiries</h3>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{appointments.length} Total</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/30">
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product / Interest</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Req.</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes / Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {appointments.map((apt) => (
              <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-6">
                  <p className="text-sm font-black text-slate-900 uppercase">{apt.customerName}</p>
                  <p className="text-xs font-mono text-slate-400">{apt.customerPhone}</p>
                </td>
                <td className="p-6 font-bold text-sm text-indigo-600">{apt.serviceName}</td>
                <td className="p-6">
                  <p className="text-sm font-bold text-slate-900">{apt.date}</p>
                  <p className="text-xs text-slate-400">{apt.time}</p>
                </td>
                <td className="p-6">
                   <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    apt.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {apt.status}
                  </span>
                </td>
                <td className="p-6 text-xs text-slate-500 max-w-[200px] truncate">{apt.notes || '---'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">System Settings</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Configure business and AI agent</p>
        </div>
        <button 
          onClick={handleSave}
          className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all transform active:scale-95"
        >
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* AGENT CONFIGURATION */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
           <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8 border-b border-slate-50 pb-4">Agent Configuration</h4>
           <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Agent Name</label>
                <input 
                  type="text" 
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-900 shadow-inner focus:ring-2 focus:ring-indigo-500/20 outline-none" 
                  placeholder="e.g. Ema"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Voice Persona</label>
                <div className="relative">
                  <select 
                    value={voiceName}
                    onChange={(e) => setVoiceName(e.target.value)}
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-900 shadow-inner appearance-none focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  >
                    <option value="Fenrir">Fenrir (Male, Deep)</option>
                    <option value="Zephyr">Zephyr (Female, Balanced)</option>
                    <option value="Puck">Puck (Male, Energetic)</option>
                    <option value="Charon">Charon (Male, Deep)</option>
                    <option value="Kore">Kore (Female, Soft)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-3">
                    <div className="flex justify-between">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Speed</label>
                       <span className="text-[10px] font-bold text-indigo-600">{voiceSpeed}x</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="2.0" 
                      step="0.1"
                      value={voiceSpeed}
                      onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                      className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                 </div>
                 <div className="space-y-3">
                    <div className="flex justify-between">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tone</label>
                       <span className="text-[10px] font-bold text-indigo-600">{voiceTone.toFixed(1)}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="2.0" 
                      step="0.1"
                      value={voiceTone}
                      onChange={(e) => setVoiceTone(parseFloat(e.target.value))}
                      className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                 </div>
              </div>

              {/* SYSTEM INSTRUCTIONS PREVIEW */}
              <div className="space-y-2 mt-6 pt-6 border-t border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current System Instructions & Flow</label>
                <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 relative group">
                  <pre className="text-[10px] text-slate-300 font-mono whitespace-pre-wrap h-64 overflow-y-auto custom-scrollbar">
                    {GET_SYSTEM_INSTRUCTION(agentName)}
                  </pre>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] bg-indigo-600 text-white px-2 py-1 rounded font-bold">Read Only</span>
                  </div>
                </div>
              </div>
           </div>
        </div>

        {/* COMPANY DETAILS */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8 border-b border-slate-50 pb-4">Company Details</h4>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Name</label>
              <input type="text" defaultValue={BUSINESS_NAME} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-900 shadow-inner" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address</label>
              <input type="text" defaultValue={FULL_ADDRESS} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-900 shadow-inner" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Website URL</label>
              <input type="text" defaultValue="https://3dhub.mk" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-900 shadow-inner" />
            </div>
          </div>
        </div>

        {/* SERVICES MANAGEMENT */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm lg:col-span-2 space-y-6">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8 border-b border-slate-50 pb-4">Product Inventory Management</h4>
          <div className="space-y-8">
            {managedServices.map((service) => (
              <div key={service.id} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Product Name</label>
                    <input 
                      type="text" 
                      value={service.name} 
                      onChange={(e) => updateService(service.id, 'name', e.target.value)}
                      className="w-full p-3 bg-white rounded-xl border-none font-bold text-slate-900 shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Type</label>
                    <select 
                      value={service.type} 
                      onChange={(e) => updateService(service.id, 'type', e.target.value)}
                      className="w-full p-3 bg-white rounded-xl border-none font-bold text-slate-900 shadow-sm appearance-none"
                    >
                      <option value="printer">Printer</option>
                      <option value="material">Filament/Resin</option>
                      <option value="scanner">Scanner</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Price (MKD)</label>
                    <input 
                      type="number" 
                      value={service.price} 
                      onChange={(e) => updateService(service.id, 'price', parseInt(e.target.value) || 0)}
                      className="w-full p-3 bg-white rounded-xl border-none font-bold text-slate-900 shadow-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Specs</label>
                    <input 
                      type="text" 
                      value={service.specs || ''} 
                      onChange={(e) => updateService(service.id, 'specs', e.target.value)}
                      className="w-full p-3 bg-white rounded-xl border-none font-bold text-slate-900 shadow-sm"
                    />
                  </div>
                   <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Stock Status</label>
                     <select 
                      value={service.stockStatus} 
                      onChange={(e) => updateService(service.id, 'stockStatus', e.target.value)}
                      className="w-full p-3 bg-white rounded-xl border-none font-bold text-slate-900 shadow-sm appearance-none"
                    >
                      <option value="in_stock">In Stock</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="backorder">Backorder</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row md:pt-16">
      <aside className="w-full md:w-72 bg-white border-r border-slate-200 flex flex-col pt-8 pb-24 md:pb-8 shrink-0">
        <div className="px-8 mb-12">
           <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Administration</h2>
        </div>
        <nav className="flex-1 space-y-2 px-4">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            )},
            { id: 'calls', label: 'Calls', icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            )},
            { id: 'orders', label: 'Orders', icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            )},
            { id: 'settings', label: 'Settings', icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            )},
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                activeSubTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 translate-x-2' 
                  : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto pb-32">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            {activeSubTab === 'dashboard' ? 'Overview' : 
             activeSubTab === 'calls' ? 'Call Center' : 
             activeSubTab === 'orders' ? 'Orders' : 'Settings'}
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
            3DHub Admin Control
          </p>
        </header>

        {activeSubTab === 'dashboard' && renderDashboard()}
        {activeSubTab === 'calls' && renderCalls()}
        {activeSubTab === 'orders' && renderOrders()}
        {activeSubTab === 'settings' && renderSettings()}
      </main>

      {showSuccess && (
        <div className="fixed top-24 right-8 bg-emerald-600 text-white px-8 py-5 rounded-[2rem] shadow-2xl animate-in slide-in-from-right-8 z-[100] border border-emerald-500/50 flex items-center gap-4">
          <div className="bg-white/20 p-2 rounded-full">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Success</p>
            <p className="text-sm font-bold opacity-90">Settings saved successfully!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInterface;
