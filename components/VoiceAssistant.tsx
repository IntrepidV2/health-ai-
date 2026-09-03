import React, { useState, useEffect, useRef } from 'react';
import { connectLiveSession, createPcmBlob } from '../services/geminiService';

export const VoiceAssistant: React.FC = () => {
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'CONNECTING' | 'LISTENING' | 'SPEAKING'>('IDLE');
  
  // Audio Refs
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null); // To store the live session
  
  // Audio Buffer Queue
  const nextStartTimeRef = useRef<number>(0);

  const startSession = async () => {
    try {
      setStatus('CONNECTING');
      
      // Setup Audio Input
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = inputContextRef.current.createMediaStreamSource(streamRef.current);
      
      // Setup Processor
      processorRef.current = inputContextRef.current.createScriptProcessor(4096, 1, 1);
      
      processorRef.current.onaudioprocess = (e) => {
        if (!sessionRef.current) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmBlob = createPcmBlob(inputData);
        sessionRef.current.then((session: any) => {
            session.sendRealtimeInput({ media: pcmBlob });
        });
      };

      source.connect(processorRef.current);
      processorRef.current.connect(inputContextRef.current.destination);

      // Setup Output Context
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      // Connect to Gemini Live
      sessionRef.current = connectLiveSession({
        onConnect: () => {
          setStatus('LISTENING');
          setActive(true);
        },
        onClose: () => {
          stopSession();
        },
        onMessage: async (text, audioData) => {
          if (audioData && outputContextRef.current) {
            setStatus('SPEAKING');
            
            // Decode
            const binaryString = atob(audioData);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            const dataInt16 = new Int16Array(bytes.buffer);
            const buffer = outputContextRef.current.createBuffer(1, dataInt16.length, 24000);
            const channelData = buffer.getChannelData(0);
            for (let i = 0; i < dataInt16.length; i++) {
                channelData[i] = dataInt16[i] / 32768.0;
            }

            // Play
            const source = outputContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(outputContextRef.current.destination);
            
            const currentTime = outputContextRef.current.currentTime;
            const startTime = Math.max(currentTime, nextStartTimeRef.current);
            source.start(startTime);
            nextStartTimeRef.current = startTime + buffer.duration;
            
            source.onended = () => {
                if (outputContextRef.current && outputContextRef.current.currentTime >= nextStartTimeRef.current) {
                     setStatus('LISTENING');
                }
            };
          }
        }
      });
      
    } catch (err) {
      console.error("Failed to start voice session", err);
      setStatus('IDLE');
    }
  };

  const stopSession = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (inputContextRef.current) inputContextRef.current.close();
    if (outputContextRef.current) outputContextRef.current.close();
    if (sessionRef.current) {
        // There is no explicit close on the promise wrapper, 
        // effectively we just stop sending data and close contexts.
        sessionRef.current = null;
    }
    setActive(false);
    setStatus('IDLE');
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {!active ? (
        <button 
          onClick={startSession}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      ) : (
        <div className="bg-white p-4 rounded-2xl shadow-xl border border-indigo-100 flex items-center gap-4 animate-in slide-in-from-bottom-5">
           <div className={`w-3 h-3 rounded-full ${status === 'SPEAKING' ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-pulse'}`}></div>
           <div className="flex flex-col">
             <span className="text-sm font-bold text-slate-800">
               {status === 'CONNECTING' ? 'Connecting...' : 
                status === 'SPEAKING' ? 'Dr. AI is speaking...' : 'Listening...'}
             </span>
             <span className="text-xs text-slate-500">Gemini Live Audio</span>
           </div>
           <button onClick={stopSession} className="text-slate-400 hover:text-red-500">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
        </div>
      )}
    </div>
  );
};
