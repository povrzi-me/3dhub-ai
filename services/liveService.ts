
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from "@google/genai";
import { createPcmBlob, decodePcmData, decode } from "./audioUtils";
import { SYSTEM_INSTRUCTION } from "../constants";

// Define tools available to the model
const TOOLS: FunctionDeclaration[] = [
  {
    name: 'check_product_stock',
    description: "Check the stock status and price of a product in the inventory.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: "Name of the product or brand to check" }
      },
      required: ['query']
    }
  },
  {
    name: 'update_order_ui',
    description: 'Call this tool to update the fields on the visible user form when user provides name, contact, or service details. Do this incrementally as you collect info.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        phone: { type: Type.STRING },
        email: { type: Type.STRING },
        serviceName: { type: Type.STRING, description: "Product name or subject of inquiry" },
        comments: { type: Type.STRING, description: "Notes, address, or message content" }
      }
    }
  },
  {
    name: 'submit_report',
    description: 'Submit a structured report to the backend system. Must follow strict FLAT schema and enum values.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        report_type: { 
          type: Type.STRING, 
          enum: ['PRODUCT_INQUIRY', 'STOCK_CHECK', 'WAITLIST_REQUEST', 'SPECIAL_REQUEST', 'CALL_SUMMARY'] 
        },
        customer_name: { type: Type.STRING },
        phone: { type: Type.STRING },
        email: { type: Type.STRING },
        product_name: { type: Type.STRING },
        product_sku: { type: Type.STRING },
        stock_status: { 
          type: Type.STRING,
          enum: ['in_stock', 'out_of_stock', 'unknown']
        },
        request_type: { type: Type.STRING },
        notes: { type: Type.STRING },
        calendar_event_id: { type: Type.STRING },
        status: { 
          type: Type.STRING,
          enum: ['completed', 'pending', 'sent_to_owner', 'not_confirmed']
        }
      },
      required: [
        'report_type', 
        'customer_name', 
        'phone', 
        'email', 
        'product_name', 
        'product_sku', 
        'stock_status', 
        'request_type', 
        'notes', 
        'calendar_event_id', 
        'status'
      ]
    }
  },
  {
    name: 'close_call',
    description: 'Ends the call session. Use only when user says they have no more questions or after sending CALL_SUMMARY.',
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  }
];

export interface LiveSessionCallbacks {
  onMessage: (text: string, type: 'input' | 'output') => void;
  onClose: () => void;
  onFunctionCall: (functionCall: { name: string, args: any }) => Promise<any>;
}

export class LiveSession {
  private sessionPromise: Promise<any> | null = null;
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private outputAudioContext: AudioContext | null = null;
  private nextStartTime: number = 0;
  private sessionClosed = false;
  private sessionReady = false;

  // Barge-in Layers
  private sources = new Set<AudioBufferSourceNode>();
  private activeTurnId = 0;

  async connect(callbacks: LiveSessionCallbacks) {
    // @ts-ignore
    const apiKey = process.env.API_KEY; 

    if (!apiKey) {
      console.error("API Key is missing.");
      callbacks.onClose();
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    this.nextStartTime = 0;
    this.sessionClosed = false;
    this.sessionReady = false;
    this.activeTurnId = 0;
    this.sources.clear();

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      this.sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log("3DHub AI Session Opened");
            this.sessionReady = true;
            this.startAudioInput();
          },
          onmessage: async (message: LiveServerMessage) => {
            await this.handleMessage(message, callbacks);
          },
          onclose: () => {
            console.log("Session Closed");
            this.handleClose(callbacks);
          },
          onerror: (err) => {
            console.error("Session Error", err);
            this.handleClose(callbacks);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations: TOOLS }],
        }
      });
      
    } catch (error) {
      console.error("Connection failed", error);
      this.handleClose(callbacks);
    }
  }

  private isUserSpeaking(buffer: Float32Array): boolean {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sum / buffer.length);
    return rms > 0.02; // Threshold
  }

  private hardStopAudio() {
    this.sources.forEach(source => {
      try {
        source.stop(0);
      } catch {}
    });
    this.sources.clear();
    this.nextStartTime = 0;
  }

  private startAudioInput() {
    if (!this.audioContext || !this.stream) return;
    
    this.source = this.audioContext.createMediaStreamSource(this.stream);
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
    
    this.processor.onaudioprocess = (e) => {
      if (this.sessionClosed) return;
      const inputData = e.inputBuffer.getChannelData(0);

      // Barge-in Detection
      if (this.isUserSpeaking(inputData)) {
        this.hardStopAudio();
        this.activeTurnId++;
        
        this.sessionPromise?.then(session => {
           (session as any).sendRealtimeInput({ interrupt: true });
        });
      }

      const pcmBlob = createPcmBlob(inputData, 16000);
      
      this.sessionPromise?.then(session => {
         session.sendRealtimeInput({ media: pcmBlob });
      });
    };
    
    this.source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
  }

  private async handleMessage(message: LiveServerMessage, callbacks: LiveSessionCallbacks) {
    if (this.sessionClosed) return;
    const turnIdAtStart = this.activeTurnId;

    // Audio Output
    const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (audioData && this.outputAudioContext) {
      try {
        const audioBytes = decode(audioData);
        const audioBuffer = await decodePcmData(audioBytes, this.outputAudioContext, 24000, 1);
        
        if (turnIdAtStart !== this.activeTurnId) return;

        this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
        const source = this.outputAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.outputAudioContext.destination);
        source.onended = () => this.sources.delete(source);
        this.sources.add(source);
        source.start(this.nextStartTime);
        this.nextStartTime += audioBuffer.duration;
      } catch (e) {
        console.error("Error decoding audio", e);
      }
    }

    if (message.serverContent?.outputTranscription?.text) {
      callbacks.onMessage(message.serverContent.outputTranscription.text, 'output');
    }
    if (message.serverContent?.inputTranscription?.text) {
      callbacks.onMessage(message.serverContent.inputTranscription.text, 'input');
    }

    if (message.toolCall?.functionCalls) {
      for (const fc of message.toolCall.functionCalls) {
        try {
          const funcName = fc.name;
          const funcId = fc.id;
          const result = await callbacks.onFunctionCall({ name: funcName, args: fc.args });
          
          this.sessionPromise?.then(session => {
            session.sendToolResponse({
              functionResponses: [{
                id: funcId,
                name: funcName,
                response: { result: result || { status: 'ok' } }
              }]
            });
          });
        } catch (e) {
          console.error(`Error handling function ${fc.name}`, e);
        }
      }
    }

    if (message.serverContent?.interrupted) {
      this.nextStartTime = 0;
    }
  }

  private handleClose(callbacks: LiveSessionCallbacks) {
    if (!this.sessionClosed) {
        this.sessionClosed = true;
        this.sessionReady = false;
        this.cleanup();
        callbacks.onClose();
    }
  }

  private cleanup() {
    this.hardStopAudio();
    this.stream?.getTracks().forEach(t => t.stop());
    this.processor?.disconnect();
    this.source?.disconnect();
    this.audioContext?.close();
    this.outputAudioContext?.close();
  }

  disconnect() {
    this.sessionClosed = true;
    this.sessionReady = false;
    this.cleanup();
    this.sessionPromise?.then(session => {
      if (session && typeof session.close === 'function') {
        session.close();
      }
    });
    this.sessionPromise = null;
  }

  public sendText(text: string) {
    this.sessionPromise?.then(session => {
      if (session && this.sessionReady && !this.sessionClosed) {
        session.sendRealtimeInput({
            clientContent: {
                turns: [{ parts: [{ text }], role: 'user' }],
                turnComplete: false 
            }
        });
      }
    });
  }
}
