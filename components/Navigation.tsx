
import React from 'react';
import { Language } from '../types';

interface NavProps {
  activeTab: 'home' | 'agent' | 'admin';
  onTabChange: (tab: 'home' | 'agent' | 'admin') => void;
  currentLang: Language;
  onLangChange: (lang: Language) => void;
}

const Navigation: React.FC<NavProps> = ({ activeTab, onTabChange, currentLang, onLangChange }) => {
  const languages = [
    { code: Language.MK, label: 'MK' },
    { code: Language.SQ, label: 'SQ' },
    { code: Language.EN, label: 'EN' },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-lg border-b border-slate-200 z-[60] px-4 md:px-8 flex items-center justify-between shadow-sm">
        <div 
          onClick={() => onTabChange('home')}
          className="flex items-center gap-2 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
            <span className="font-black text-white text-xs">3D</span>
          </div>
          <span className="font-black text-slate-900 tracking-tighter text-base uppercase hidden sm:inline">Hub<span className="text-indigo-600">.mk</span></span>
        </div>

        {/* Centered Navigation */}
        <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 md:gap-6 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/50">
          <button
            onClick={() => onTabChange('home')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              activeTab === 'home' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
             </svg>
             <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">{currentLang === 'en' ? 'HOME' : currentLang === 'sq' ? 'BALLINA' : 'ПОЧЕТНА'}</span>
          </button>

          <button
            onClick={() => onTabChange('agent')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              activeTab === 'agent' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
             </svg>
             <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">{currentLang === 'en' ? 'AGENT' : currentLang === 'sq' ? 'AGJENTI' : 'АГЕНТ'}</span>
          </button>
        </nav>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => onLangChange(l.code)}
              className={`px-2.5 py-1.5 rounded-md text-[10px] font-black transition-all ${
                currentLang === l.code 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </header>
    </>
  );
};

export default Navigation;