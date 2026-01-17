
import React, { useState, useEffect, useRef } from 'react';
import { LiveSession } from '../services/liveService';
import { Appointment, Language, CallLog } from '../types';
import { SERVICES, GET_SYSTEM_INSTRUCTION } from '../constants';

const WEBHOOK_URL = "https://3dhub-ai.povrzi-me.workers.dev";

interface VoiceProps {
  onNewAppointment: (apt: Appointment) => void;
  onClose: () => void;
  onCallEnded?: (log: CallLog) => void;
  onSessionStarted?: () => void;
  autoCloseDelay?: number;
  currentLang: Language;
  agentName?: string;
  voiceName?: string;
  voiceSpeed?: number;
  voiceTone?: number;
}

const VoiceInterface: React.FC<VoiceProps> = ({ 
  onNewAppointment, 
  onClose, 
  onCallEnded, 
  onSessionStarted,
  autoCloseDelay = 10,
  currentLang,
  agentName = "Hubby",
  voiceName = "Fenrir",
  voiceSpeed,
  voiceTone
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcripts, setTranscripts] = useState<{ text: string; type: 'input' | 'output' }[]>([]);
  // finalSummary will now store the full flat JSON object
  const [finalSummary, setFinalSummary] = useState<any | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<'form' | 'debug'>('form');
  
  const [duration, setDuration] = useState(0);
  const [agentState, setAgentState] = useState<'listening' | 'speaking' | 'idle'>('idle');
  const [audioLevel, setAudioLevel] = useState(0);

  // Simulated Printer Temps
  const [bedTemp, setBedTemp] = useState(25);
  const [nozzleTemp, setNozzleTemp] = useState(25);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    serviceName: "",
    comments: ""
  });

  const lastActivityTimeRef = useRef<number>(Date.now());
  const silenceWarningSentRef = useRef(false);
  const speakingTimeoutRef = useRef<any>(null);
  
  const UI_TRANSLATIONS = {
  [Language.MK]: {
    confirmedTitle: "БАРАЊЕТО Е ПОТВРДЕНО",
    confirmedDesc: "Деталите за вашето барање се подолу:",
    doneBtn: "ЗАТВОРИ",
    agentTitle: `${agentName.toUpperCase()} > AI_CORE`,
    statusActive: "ONLINE",
    statusReady: "STANDBY",
    startPrompt: "Иницијализирај го 3DHub Системот...",
    stopBtn: "ABORT",
    startBtn: "INITIALIZE",
    formTitle: "ПРОВЕРКА НА ПОДАТОЦИ",
    formSubtitle: "Се ажурира во реално време...",
    labelName: "Име",
    labelPhone: "Телефон",
    labelEmail: "Е-маил",
    labelService: "Предмет",
    labelVehicle: "Забелешка",
    statusListening: "INPUT...",
    statusSpeaking: "PROCESSING...",
    tempBed: "BED",
    tempNozzle: "NOZZLE",
    confirmBtn: "ПОТВРДИ БАРАЊЕ"
  },
  [Language.SQ]: {
    confirmedTitle: "KËRKESA U KONFIRMUA",
    confirmedDesc: "Detajet e kërkesës suaj janë më poshtë:",
    doneBtn: "MBYLL",
    agentTitle: `${agentName.toUpperCase()} > AI_CORE`,
    statusActive: "ONLINE",
    statusReady: "STANDBY",
    startPrompt: "Inicializo Sistemin 3DHub...",
    stopBtn: "ABORT",
    startBtn: "INITIALIZE",
    formTitle: "VERIFIKIMI I TË DHËNAVE",
    formSubtitle: "Po përditësohet në kohë reale...",
    labelName: "Emri",
    labelPhone: "Telefoni",
    labelEmail: "Email",
    labelService: "Lënda",
    labelVehicle: "Shënim",
    statusListening: "INPUT...",
    statusSpeaking: "PROCESSING...",
    tempBed: "BED",
    tempNozzle: "NOZZLE",
    confirmBtn: "KONFIRMO KËRKESËN"
  },
  [Language.EN]: {
    confirmedTitle: "REQUEST CONFIRMED",
    confirmedDesc: "Your request details are below:",
    doneBtn: "CLOSE",
    agentTitle: `${agentName.toUpperCase()} > AI_CORE`,
    statusActive: "ONLINE",
    statusReady: "STANDBY",
    startPrompt: "Initialize 3DHub System...",
    stopBtn: "ABORT",
    startBtn: "INITIALIZE",
    formTitle: "DATA VERIFICATION",
    formSubtitle: "Updating in real-time...",
    labelName: "Name",
    labelPhone: "Phone",
    labelEmail: "Email",
    labelService: "Subject",
    labelVehicle: "Message",
    statusListening: "INPUT...",
    statusSpeaking: "PROCESSING...",
    tempBed: "BED",
    tempNozzle: "NOZZLE",
    confirmBtn: "CONFIRM REQUEST"
  }
};

  const t = UI_TRANSLATIONS[currentLang];

  const formDataRef = useRef(formData);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  const sessionRef = useRef<LiveSession | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const debugScrollRef = useRef<HTMLDivElement>(null);
  const callStartTimeRef = useRef(0);
  
  const bookingStatusRef = useRef<'confirmed' | 'pending' | 'none'>('none');
  const callStatusRef = useRef<'completed' | 'abandoned' | 'failed'>('completed');
  const transcriptsRef = useRef<{ text: string; type: 'input' | 'output' }[]>([]);

  // Helper for debug logging
  const addLog = (msg: string) => {
    const time = new Date().toISOString().split('T')[1].slice(0, 8);
    setDebugLogs(prev => [`[${time}] ${msg}`, ...prev]);
  };

  // Printer Temp Simulation
  useEffect(() => {
    const interval = setInterval(() => {
       if (isActive) {
          setBedTemp(prev => Math.min(60, prev + Math.random() * 2));
          setNozzleTemp(prev => Math.min(220, prev + Math.random() * 5));
       } else {
          setBedTemp(prev => Math.max(25, prev - 1));
          setNozzleTemp(prev => Math.max(25, prev - 2));
       }
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (isActive) {
      setAgentState('listening');
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      setDuration(0);
      setAgentState('idle');
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const resetSilenceTimer = () => {
    lastActivityTimeRef.current = Date.now();
    silenceWarningSentRef.current = false;
  };

  // Silence Watchdog
  useEffect(() => {
    if (!isActive) return;
    const checkSilence = () => {
      const now = Date.now();
      const elapsed = (now - lastActivityTimeRef.current) / 1000;
      
      // Increased timeout to 45 seconds to be less annoying
      if (elapsed >= 45 && !silenceWarningSentRef.current) {
        addLog("User silent > 45s. Sending nudge.");
        sessionRef.current?.sendText("[SYSTEM: User silent for 45s. Ask if they are there.]");
        silenceWarningSentRef.current = true;
      }
    };
    const interval = window.setInterval(checkSilence, 1000);
    return () => window.clearInterval(interval);
  }, [isActive]);

  const finalizeCallLog = () => {
    const duration = callStartTimeRef.current ? (Date.now() - callStartTimeRef.current) / 1000 : 0;
    const log: CallLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      duration: Math.round(duration),
      status: callStatusRef.current,
      bookingStatus: bookingStatusRef.current,
      customerName: formDataRef.current.name,
      customerPhone: formDataRef.current.phone,
      transcripts: transcriptsRef.current
    };
    onCallEnded?.(log);
    addLog(`Call finalized. Duration: ${Math.round(duration)}s`);
  };

  const handleProductStockCheck = async (args: any) => {
    const query = (args.query || "").toLowerCase();
    addLog(`Checking stock for: ${query}`);
    
    // Improved search logic matching the new Knowledge Base structure
    const matchedProducts = SERVICES.filter(s => 
      s.name.toLowerCase().includes(query) || 
      (s.brand && s.brand.toLowerCase().includes(query)) ||
      (s.sku && s.sku.toLowerCase().includes(query)) ||
      (s.type === 'printer' && query.includes('printer'))
    );

    if (matchedProducts.length > 0) {
      const product = matchedProducts[0];
      addLog(`Product found: ${product.name}`);
      return {
        found: true,
        product: product.name,
        price: product.price,
        stock_status: product.stockStatus,
        sku: product.sku,
        description: product.description,
        tech_specs: product.specs
      };
    } else {
      addLog(`Product NOT found: ${query}`);
      return {
        found: false,
        message: "Product not found in local catalog."
      };
    }
  };

  const submitReport = async (args: any) => {
    addLog(`[WEBHOOK] Submitting ${args.report_type}...`);
    // Flatten the args from nested structures (contact/product) to flat state
    const updatedFormData = {
      name: args.contact?.name || args.customer_name || formDataRef.current.name,
      phone: args.contact?.phone || args.phone || formDataRef.current.phone,
      email: args.contact?.email || args.email || formDataRef.current.email,
      serviceName: args.product?.name || args.product_name || args.report_type,
      comments: args.notes || ""
    };

    // 1. Send the webhook immediately
    try {
      // NOTE: Removed 'no-cors' to ensure Content-Type is sent correctly
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args)
      });
      addLog(`[WEBHOOK] Status: ${response.status}`);
    } catch (e) {
      addLog(`[WEBHOOK] Error: ${e}`);
      console.error("Webhook failed", e);
    }

    // 2. Update local form data
    setFormData(updatedFormData);

    // 3. Update UI status to "Confirmed" if it's a transactional report
    const isTransactional = args.report_type === 'WAITLIST_ADD' || args.report_type === 'SPECIAL_REQUEST';
    
    if (isTransactional) {
        addLog("Transaction confirmed via report.");
        const finalStatus = 'confirmed';
        bookingStatusRef.current = finalStatus;

        const newApt: Appointment = {
          id: Math.random().toString(36).substr(2, 9),
          customerName: updatedFormData.name || "Unknown",
          customerPhone: updatedFormData.phone || "---",
          serviceId: args.product?.sku || args.product_sku || args.report_type,
          serviceName: updatedFormData.serviceName,
          date: args.callback_date || new Date().toISOString().split('T')[0],
          time: args.callback_time || new Date().toLocaleTimeString(),
          status: finalStatus,
          language: currentLang,
          createdAt: Date.now(),
          notes: updatedFormData.comments,
        };
        onNewAppointment(newApt);
        
        // Show confirmation overlay.
        const summaryData = {
            ...args,
            customer_name: updatedFormData.name,
            phone: updatedFormData.phone,
            email: updatedFormData.email,
            product_name: updatedFormData.serviceName,
            notes: updatedFormData.comments
        };
        setFinalSummary(summaryData);
    } 
    
    return { status: "report_submitted_successfully" };
  };

  const handleManualConfirm = () => {
    addLog("[UI] User clicked CONFIRM button.");
    // Send a system message to the agent that the user confirmed on screen
    sessionRef.current?.sendText(`[System: User clicked CONFIRM_REQUEST button. Form Data: Name=${formData.name}, Phone=${formData.phone}, Product=${formData.serviceName}. Proceed to submit_report.]`);
  };

  const startSession = async () => {
    if (isActive || isConnecting) return;
    setIsConnecting(true);
    callStartTimeRef.current = Date.now();
    resetSilenceTimer();
    try {
      setFinalSummary(null);
      setFormData({ name: "", phone: "", email: "", serviceName: "", comments: "" });
      setTranscripts([]);
      setDebugLogs([]);
      addLog("Starting session initialization...");
      transcriptsRef.current = [];
      bookingStatusRef.current = 'none';
      callStatusRef.current = 'completed';
      setDuration(0);
      setAgentState('idle');

      const session = new LiveSession();
      sessionRef.current = session;
      
      const systemInstruction = GET_SYSTEM_INSTRUCTION(agentName);

      await session.connect({
        onMessage: (text, type) => {
          resetSilenceTimer();
          setTranscripts(prev => {
            const updated = [...prev, { text, type }];
            transcriptsRef.current = updated;
            return updated;
          });
          // Log only output to avoid spamming user input echo
          if (type === 'output') addLog(`[AI] ${text.substring(0, 50)}...`);
          
          if (type === 'output') {
            setAgentState('speaking');
            if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
            const estimatedMs = Math.min(10000, Math.max(1500, text.length * 60));
            speakingTimeoutRef.current = setTimeout(() => {
               if (sessionRef.current) setAgentState('listening');
            }, estimatedMs);
          }
        },
        onClose: () => {
          addLog("Session connection closed.");
          setIsActive(false);
          setIsConnecting(false);
          setAgentState('idle');
          if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
          finalizeCallLog();
        },
        onFunctionCall: async (fc) => {
          resetSilenceTimer();
          addLog(`[TOOL] Calling: ${fc.name}`);
          
          if (fc.name === 'submit_report') {
             // Handle GET_PRODUCT_STOCK specifically to return data
             if (fc.args.report_type === 'GET_PRODUCT_STOCK') {
                 const query = fc.args.product?.name || fc.args.product_name || fc.args.query || "";
                 return await handleProductStockCheck({ query });
             }
             return await submitReport(fc.args);
          }
          
          if (fc.name === 'update_order_ui') {
            const newData = { ...formDataRef.current, ...fc.args };
            setFormData(newData);
            formDataRef.current = newData;
            addLog(`[UI] Form updated: ${JSON.stringify(fc.args)}`); 
            return { status: "form_updated" };
          }
          
          if (fc.name === 'close_call') {
            addLog("[TOOL] close_call requested");
            // Disconnect but keep finalSummary visible if it exists
            setTimeout(() => {
               if (sessionRef.current) sessionRef.current.disconnect();
               setIsActive(false);
            }, 1000);
            return { status: "closing" };
          }

          return { status: "unknown_tool" };
        },
        onVolume: (level) => {
           setAudioLevel(level);
           // If the user is speaking clearly (above 0.01), reset silence timer
           // This prevents false "User silent" nudges while the user is actually speaking
           if (level > 0.01) {
             resetSilenceTimer();
           }
        }
      }, {
        voiceName: voiceName,
        systemInstruction: systemInstruction
      });
      
      setIsActive(true);
      setIsConnecting(false);
      onSessionStarted?.();
      addLog("Session active.");
    } catch (err) {
      console.error("Failed to start session:", err);
      addLog(`[ERROR] Start failed: ${err}`);
      setIsConnecting(false);
      setIsActive(false);
      setAgentState('idle');
    }
  };

  const toggleSession = () => {
    if (isActive) {
      if (bookingStatusRef.current !== 'confirmed') {
          callStatusRef.current = 'abandoned';
      }
      addLog("User manually stopped session.");
      if (sessionRef.current) sessionRef.current.disconnect();
      setIsActive(false);
      setAgentState('idle');
    } else {
      startSession();
    }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [transcripts]);

  // Determine if confirm button should be shown
  const canConfirm = isActive && !finalSummary && formData.name.length > 2 && formData.phone.length > 5;

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 pt-20">
      {/* COMPACT 3D PRINTER UI CONTAINER */}
      <div className="relative w-full max-w-2xl bg-zinc-900 rounded-xl border-4 border-zinc-800 shadow-2xl flex flex-col overflow-hidden font-mono h-[480px]">
        
        {/* HEADER BAR */}
        <div className="bg-zinc-800 p-3 flex justify-between items-center border-b border-zinc-700 h-14 shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white font-black text-[10px]">3D</div>
             <span className="text-zinc-300 font-bold tracking-widest text-xs">HUB.MK OS <span className="text-indigo-500">v2.1</span></span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400">
             <div className="flex items-center gap-1">
                <span>{t.tempNozzle}:</span>
                <span className="text-red-400">{Math.round(nozzleTemp)}°C</span>
             </div>
             <div className="flex items-center gap-1">
                <span>{t.tempBed}:</span>
                <span className="text-amber-400">{Math.round(bedTemp)}°C</span>
             </div>
             <div className="px-1.5 py-0.5 bg-zinc-950 rounded border border-zinc-700">
               {isActive ? <span className="text-emerald-500 animate-pulse">ON</span> : <span className="text-red-500">OFF</span>}
             </div>
          </div>
        </div>

        {/* MAIN DISPLAY */}
        <div className="flex-1 flex relative overflow-hidden">
           {/* LEFT: VISUALIZER / INFO */}
           <div className="w-1/2 p-4 flex flex-col items-center justify-center border-r border-zinc-800 bg-zinc-900/50 relative">
              
              {/* Spinning Ring Visualizer - Compact */}
              <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                 {isActive ? (
                    <>
                     {/* Dynamic border based on volume */}
                     <div 
                        className={`absolute inset-0 rounded-full border-[3px] border-t-indigo-500 border-r-transparent border-b-zinc-800 border-l-transparent ${agentState === 'speaking' ? 'animate-spin duration-700' : 'animate-spin duration-[3000ms]'}`}
                        style={{ transform: `scale(${1 + audioLevel * 3})` }}
                     ></div>
                     <div className={`w-28 h-28 rounded-full bg-zinc-950 flex items-center justify-center border border-zinc-800 shadow-inner ${agentState === 'speaking' ? 'shadow-indigo-500/50' : ''}`}>
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${agentState === 'speaking' ? 'bg-indigo-600 scale-110' : 'bg-zinc-800 scale-100'}`}>
                           <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                           </svg>
                        </div>
                     </div>
                    </>
                 ) : (
                    <div className="w-24 h-24 border-2 border-dashed border-zinc-600 rounded-full flex items-center justify-center">
                        <span className="text-2xl opacity-50">⚡</span>
                    </div>
                 )}
              </div>

              <div className="text-center z-10 w-full px-2">
                <p className="text-[10px] font-bold text-indigo-400 tracking-[0.2em] animate-pulse leading-relaxed">
                   {isActive ? (agentState === 'speaking' ? t.statusSpeaking : t.statusListening) : t.startPrompt}
                </p>
                {isActive && <p className="text-[9px] text-zinc-500 mt-1 font-mono">{formatDuration(duration)}</p>}
              </div>

           </div>

           {/* RIGHT: FORM / DEBUG AREA */}
           <div className="w-1/2 bg-zinc-950 p-0 overflow-hidden flex flex-col border-l border-zinc-800 relative">
              {finalSummary ? (
                 <div className="flex flex-col h-full animate-in slide-in-from-right duration-300 bg-zinc-900">
                    <div className="bg-emerald-600 p-3 text-white shrink-0 shadow-lg z-10">
                       <h3 className="font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                         </svg>
                         {t.confirmedTitle}
                       </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono">
                       <p className="text-[9px] text-zinc-400 mb-2 border-b border-zinc-800 pb-2">{t.confirmedDesc}</p>
                       <div className="space-y-2">
                          <div>
                             <label className="text-[8px] text-zinc-500 font-bold uppercase block">Request Type</label>
                             <div className="text-indigo-400 text-[10px] font-bold">{finalSummary.report_type}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                             <div>
                                <label className="text-[8px] text-zinc-500 font-bold uppercase block">Name</label>
                                <div className="text-white text-[10px] font-bold truncate">{finalSummary.customer_name || "-"}</div>
                             </div>
                             <div>
                                <label className="text-[8px] text-zinc-500 font-bold uppercase block">Phone</label>
                                <div className="text-white text-[10px] font-bold truncate">{finalSummary.phone || "-"}</div>
                             </div>
                          </div>
                          <div>
                             <label className="text-[8px] text-zinc-500 font-bold uppercase block">Email</label>
                             <div className="text-white text-[10px] font-bold truncate">{finalSummary.email || "-"}</div>
                          </div>
                          <div>
                             <label className="text-[8px] text-zinc-500 font-bold uppercase block">Product</label>
                             <div className="text-white text-[10px] font-bold break-words">{finalSummary.product_name || "-"}</div>
                          </div>
                          <div>
                             <label className="text-[8px] text-zinc-500 font-bold uppercase block">Notes</label>
                             <div className="text-zinc-400 text-[9px] bg-zinc-950 p-2 rounded border border-zinc-800 max-h-[80px] overflow-y-auto">
                               {finalSummary.notes || "-"}
                             </div>
                          </div>
                       </div>
                    </div>
                    <div className="p-3 border-t border-zinc-800 bg-zinc-950 shrink-0">
                        <button onClick={onClose} className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-colors border border-zinc-700">
                           {t.doneBtn}
                        </button>
                    </div>
                 </div>
              ) : (
                 <div className="flex flex-col h-full bg-zinc-900">
                    {/* FIXED HEADER FOR FORM - UPDATED STYLE */}
                    <div className="bg-zinc-900 border-b border-zinc-800 px-3 py-2 flex justify-between items-center shrink-0">
                       <h3 className="font-bold text-zinc-300 uppercase tracking-widest text-[10px]">{activeView === 'form' ? t.formTitle : 'DEBUG LOGS'}</h3>
                       <div className="flex items-center gap-2">
                           <button 
                             onClick={() => setActiveView(activeView === 'form' ? 'debug' : 'form')}
                             className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider transition-colors ${activeView === 'debug' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                           >
                             {activeView === 'form' ? 'DEBUG' : 'FORM'}
                           </button>
                           <div className="text-[8px] bg-indigo-600 px-1.5 py-0.5 rounded text-white font-mono animate-pulse shadow-[0_0_10px_rgba(79,70,229,0.5)]">LIVE</div>
                       </div>
                    </div>
                    
                    {/* VIEW SWITCHER */}
                    {activeView === 'form' ? (
                        <>
                            {/* SCROLLABLE FORM AREA */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[8px] text-zinc-500 font-bold uppercase block mb-0.5">{t.labelName}</label>
                                    <div className={`bg-zinc-950 border p-1.5 rounded text-zinc-300 text-[10px] font-bold ${formData.name ? 'border-indigo-500/50 text-white' : 'border-zinc-800'}`}>{formData.name || "..."}</div>
                                </div>
                                <div>
                                    <label className="text-[8px] text-zinc-500 font-bold uppercase block mb-0.5">{t.labelPhone}</label>
                                    <div className={`bg-zinc-950 border p-1.5 rounded text-zinc-300 text-[10px] font-bold ${formData.phone ? 'border-indigo-500/50 text-white' : 'border-zinc-800'}`}>{formData.phone || "..."}</div>
                                </div>
                            </div>
                            <div>
                                <label className="text-[8px] text-zinc-500 font-bold uppercase block mb-0.5">{t.labelEmail}</label>
                                <div className={`bg-zinc-950 border p-1.5 rounded text-zinc-300 text-[10px] font-bold ${formData.email ? 'border-indigo-500/50 text-white' : 'border-zinc-800'}`}>{formData.email || "..."}</div>
                            </div>
                            <div>
                                <label className="text-[8px] text-zinc-500 font-bold uppercase block mb-0.5">{t.labelService}</label>
                                <div className={`bg-zinc-950 border p-1.5 rounded text-indigo-400 text-[10px] font-bold ${formData.serviceName ? 'border-indigo-500/50' : 'border-zinc-800'}`}>{formData.serviceName || "..."}</div>
                            </div>
                            <div>
                                <label className="text-[8px] text-zinc-500 font-bold uppercase block mb-0.5">{t.labelVehicle}</label>
                                <div className={`bg-zinc-950 border p-2 rounded text-zinc-400 text-[9px] min-h-[50px] ${formData.comments ? 'border-indigo-500/50 text-zinc-300' : 'border-zinc-800'}`}>{formData.comments || "..."}</div>
                            </div>

                            {/* CONFIRMATION BUTTON - Only shows if data is present and call is active */}
                            {canConfirm && (
                                <div className="pt-2 animate-in fade-in duration-500">
                                <button 
                                    onClick={handleManualConfirm}
                                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-900/40 border border-indigo-500 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {t.confirmBtn}
                                </button>
                                </div>
                            )}
                            </div>

                            {/* MINI TRANSCRIPT LOG AT BOTTOM */}
                            <div className="shrink-0 bg-zinc-950 border-t border-zinc-800 p-2 max-h-[80px] overflow-hidden flex flex-col justify-end">
                            <div className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Transcript</div>
                            <div ref={scrollRef} className="text-[9px] font-mono space-y-1 overflow-y-auto scrollbar-hide">
                                {transcripts.slice(-3).map((t, i) => (
                                <div key={i} className={`flex ${t.type === 'input' ? 'justify-end' : 'justify-start'}`}>
                                    <span className={`${t.type === 'input' ? 'text-zinc-500' : 'text-indigo-400'} truncate max-w-full`}>
                                        {t.type === 'output' && '> '} {t.text}
                                    </span>
                                </div>
                                ))}
                                {transcripts.length === 0 && <span className="text-zinc-700 italic">Listening...</span>}
                            </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 overflow-hidden bg-black p-2 font-mono text-[9px]">
                           <div className="h-full overflow-y-auto scrollbar-hide space-y-1" ref={debugScrollRef}>
                              {debugLogs.length === 0 && <span className="text-zinc-600 italic">No logs yet...</span>}
                              {debugLogs.map((log, i) => {
                                 const isError = log.includes("Error") || log.includes("failed");
                                 const isAction = log.includes("[ACTION]") || log.includes("[WEBHOOK]") || log.includes("[TOOL]");
                                 return (
                                     <div key={i} className={`break-words border-l-2 pl-2 ${isError ? 'border-red-500 text-red-400' : isAction ? 'border-yellow-500 text-yellow-100' : 'border-zinc-700 text-zinc-400'}`}>
                                       {log}
                                     </div>
                                 )
                              })}
                           </div>
                        </div>
                    )}
                 </div>
              )}
           </div>
        </div>

        {/* BOTTOM CONTROLS */}
        <div className="bg-zinc-800 p-3 border-t border-zinc-700 flex justify-center shrink-0">
           <button 
             onClick={toggleSession}
             disabled={isConnecting}
             className={`w-full py-3 rounded-lg font-black text-xs uppercase tracking-[0.2em] transition-all hover:brightness-110 active:scale-95 shadow-lg ${
               isActive 
                 ? 'bg-red-600 text-white shadow-red-900/20' 
                 : 'bg-indigo-600 text-white shadow-indigo-900/20'
             }`}
           >
             {isConnecting ? '...' : isActive ? t.stopBtn : t.startBtn}
           </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceInterface;
