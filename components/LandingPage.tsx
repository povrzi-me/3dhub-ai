
import React, { useState } from 'react';
import { LandingPageSpec } from '../types';
import { SERVICES, MAPS_URL } from '../constants';

interface LandingPageProps {
  spec: any;
  onStartCall: () => void;
  onOpenAdmin: () => void;
}

const BenefitIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'priority': // Mapped to Printers
      return (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
      );
    case 'deep': // Mapped to Materials
      return (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.691.34a2 2 0 01-1.788 0l-.691-.34a6 6 0 00-3.86-.517l-2.387.477a2 2 0 00-1.022.547V18a2 2 0 002 2h11a2 2 0 002-2v-2.572zM4 9a5 5 0 0110 0v.292a2 2 0 00.925 1.673l1.15.766a2 2 0 01.925 1.673V14M4 9V5a2 2 0 012-2h2a2 2 0 012 2v4M4 9h6" />
        </svg>
      );
    default: // Service
      return (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
  }
};

const LandingPage: React.FC<LandingPageProps> = ({ spec, onStartCall, onOpenAdmin }) => {
  const [showPriceList, setShowPriceList] = useState(false);

  return (
    <div className="bg-white min-h-screen text-slate-900 pb-24 md:pb-0 pt-28">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white py-24 px-6 overflow-hidden mx-4 md:mx-8 rounded-[3rem] shadow-2xl">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent"></div>
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tighter">
            {spec.hero.headline}
          </h1>
          <p className="text-lg md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            {spec.hero.subheadline}
          </p>
          <div className="flex flex-col md:flex-row gap-5 justify-center">
            <button 
              onClick={onStartCall}
              className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/40 transition-all transform hover:scale-105 active:scale-95"
            >
              {spec.hero.primaryCTA}
            </button>
            <button 
              onClick={() => setShowPriceList(true)}
              className="px-10 py-5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all transform hover:scale-105 active:scale-95"
            >
              {spec.hero.secondaryCTA}
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <h2 className="text-4xl font-black text-center mb-20 tracking-tight uppercase">{spec.benefits.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {spec.benefits.items.map((item: any, idx: number) => (
            <div key={idx} className="group flex flex-col items-center text-center p-10 rounded-[3rem] bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] hover:-translate-y-2">
              <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                <BenefitIcon type={item.icon} />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight uppercase">{item.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Product List Modal */}
      {showPriceList && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 bg-indigo-600 text-white flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">{spec.hero.secondaryCTA}</h2>
                <p className="text-indigo-100 text-sm mt-1 font-bold">3DHub Product Catalog</p>
              </div>
              <button onClick={() => setShowPriceList(false)} className="p-3 hover:bg-white/10 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-10 max-h-[60vh] overflow-y-auto">
              <div className="space-y-4">
                {SERVICES.map((s) => (
                  <div key={s.id} className="flex justify-between items-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-xl transition-all group">
                    <div className="flex-1">
                      <h4 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{s.name}</h4>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">{s.brand} • {s.type}</p>
                      {s.specs && (
                        <p className="text-[10px] text-indigo-500 font-bold mt-2 bg-indigo-50 inline-block px-2 py-1 rounded">
                          {s.specs}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <span className="text-2xl font-black text-slate-900 whitespace-nowrap">{s.price ? `${s.price} ден.` : '---'}</span>
                      <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${s.stockStatus === 'in_stock' ? 'text-green-500' : 'text-red-500'}`}>
                        {s.stockStatus?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-10 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row gap-4">
              <button onClick={() => { setShowPriceList(false); onStartCall(); }} className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">{spec.hero.primaryCTA}</button>
              <button onClick={() => setShowPriceList(false)} className="px-10 py-5 bg-white border-2 border-slate-200 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Agent Spotlight */}
      <section className="bg-slate-900 text-white py-28 px-6 mx-4 md:mx-8 rounded-[3.5rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none"></div>
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-5/12 order-2 lg:order-1">
            <div className="relative w-full max-w-[320px] mx-auto h-[580px] bg-slate-950 rounded-[2.5rem] border-[8px] border-slate-800 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col transition-all group hover:scale-105 duration-500">
               <div className="pt-8 px-6 pb-4 border-b border-slate-800 bg-slate-900 flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
                      <path d="M12 6a6 6 0 1 0 6 6 6 6 0 0 0-6-6zm0 10a4 4 0 1 1 4-4 4 4 0 0 1-4 4z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <h4 className="font-black text-sm text-white tracking-tighter uppercase">3DHub Assistant</h4>
                    <span className="text-[8px] text-green-500 font-black uppercase tracking-widest">{spec.agentSpotlight.mockup.activeCall}</span>
                  </div>
               </div>
               <div className="flex-1 p-6 space-y-4">
                  <div className="flex justify-start">
                    <div className="bg-slate-800 rounded-2xl p-3 text-[10px] font-bold text-slate-300 border border-slate-700 max-w-[80%]">
                      {spec.agentSpotlight.mockup.welcome}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-indigo-600 rounded-2xl p-3 text-[10px] font-bold text-white max-w-[80%]">
                      {spec.agentSpotlight.mockup.userInput}
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-slate-800 rounded-2xl p-3 text-[10px] font-bold text-slate-300 border border-slate-700 max-w-[80%]">
                      {spec.agentSpotlight.mockup.agentResponse}
                    </div>
                  </div>
               </div>
               <div className="p-8 bg-slate-900 border-t border-slate-800 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                  </div>
               </div>
            </div>
          </div>
          <div className="lg:w-7/12 order-1 lg:order-2 text-center lg:text-left">
            <div className="inline-block px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-6">
              {spec.agentSpotlight.title}
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter leading-none">{spec.agentSpotlight.tagline}</h2>
            <p className="text-xl text-indigo-100 font-medium leading-relaxed max-w-xl">
              {spec.agentSpotlight.description}
            </p>
            <button 
              onClick={onStartCall}
              className="mt-12 px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all transform hover:scale-105 active:scale-95"
            >
              {spec.agentSpotlight.mockup.startBtn}
            </button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-28 px-6 max-w-4xl mx-auto">
        <h2 className="text-4xl font-black text-center mb-24 tracking-tight uppercase">{spec.howItWorks.title}</h2>
        <div className="space-y-16">
          {spec.howItWorks.steps.map((step: any, idx: number) => (
            <div key={idx} className="group flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
              <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-indigo-100 group-hover:rotate-12 transition-transform duration-500 shrink-0">
                {step.step}
              </div>
              <div>
                <h3 className="text-2xl font-black mb-3 tracking-tight uppercase">{step.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
            <div>
              <h3 className="font-black text-2xl mb-6 tracking-tight uppercase">{spec.footer.companyName}</h3>
              <div className="space-y-4">
                <a 
                  href={MAPS_URL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-500 font-bold flex items-center gap-3 hover:text-indigo-600 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                  {spec.footer.location}
                </a>
                <p className="text-slate-500 font-bold flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  </div>
                  {spec.footer.contact}
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-end md:items-end gap-4">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{spec.footer.disclaimer}</p>
              <div className="text-xs font-bold text-slate-400">
                Powered by: <a href="https://voicevibe-ai.vercel.app" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-600 underline">VoiceVibe</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-200 pt-12 flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-300 tracking-[0.3em] uppercase">3DHub AI v1.0</span>
            <button 
              onClick={onOpenAdmin}
              className="text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-[0.2em] flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Admin Access
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;