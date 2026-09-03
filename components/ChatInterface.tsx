import React, { useState, useRef, useEffect } from 'react';
import { chatWithAssistant } from '../services/geminiService';
import { Patient } from '../types';

interface ChatInterfaceProps {
  patient: Patient | null;
}

const PulseLogo = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="8">
        <circle cx="50" cy="50" r="45" strokeOpacity="0.2" />
        <path d="M20 50 h15 l10 -25 l10 50 l10 -25 h15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ patient }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'model', text: string, grounding?: any[]}[]>([
    { role: 'model', text: "Hi there! I'm Pulse. How can I help you with your health today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isExpanded]);

  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      setInput(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const response = await chatWithAssistant(history, userMsg, patient || undefined);
    
    setMessages(prev => [...prev, { 
      role: 'model', 
      text: response.text,
      grounding: response.groundingChunks
    }]);
    setIsLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-zinc-100 flex items-center justify-center z-50 hover:scale-105 transition-transform duration-300 group overflow-hidden"
      >
        <div className="w-full h-full p-3 text-red-600 group-hover:rotate-6 transition-transform duration-300">
            <PulseLogo className="w-full h-full" />
        </div>
      </button>
    );
  }

  // Styles based on expansion state
  const containerClasses = isExpanded 
    ? "fixed inset-0 z-50 bg-white flex flex-col animate-in fade-in duration-200" 
    : "fixed bottom-6 right-6 w-[400px] h-[600px] z-50 flex flex-col bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-zinc-200 animate-in slide-in-from-bottom-5";

  const contentClasses = isExpanded 
    ? "max-w-3xl w-full mx-auto h-full flex flex-col" 
    : "flex flex-col h-full";

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 ${isExpanded ? 'max-w-3xl w-full mx-auto' : ''} border-b border-zinc-100 bg-white`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-50 rounded-full border border-zinc-100 p-2 text-red-600">
             <PulseLogo className="w-full h-full" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 text-sm">Pulse AI</h3>
            <p className="text-xs text-zinc-500">Medical Assistant</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                title={isExpanded ? "Minimize" : "Full Screen"}
            >
                {isExpanded ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                )}
            </button>

            <button 
                onClick={() => { setIsOpen(false); setIsExpanded(false); }} 
                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className={`flex-1 overflow-y-auto ${contentClasses} p-6 space-y-6 bg-zinc-50/50`} ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            
            {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 p-1.5 shrink-0 mt-1 text-red-600">
                    <PulseLogo className="w-full h-full" />
                </div>
            )}

            <div className={`max-w-[80%] space-y-2`}>
                <div className={`px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                        ? 'bg-zinc-800 text-white rounded-2xl rounded-tr-sm' 
                        : 'bg-white border border-zinc-200 text-zinc-800 rounded-2xl rounded-tl-sm'
                }`}>
                    <p>{msg.text}</p>
                </div>
                
                {msg.grounding && msg.grounding.length > 0 && (
                    <div className="flex flex-wrap gap-2 ml-1">
                        {msg.grounding.map((chunk: any, idx: number) => (
                             chunk.web?.uri ? (
                                <a 
                                    key={idx}
                                    href={chunk.web.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="inline-flex items-center gap-1 text-[10px] bg-zinc-100 hover:bg-zinc-200 text-zinc-600 px-2 py-1 rounded-md transition-colors border border-zinc-200"
                                >
                                    Source {idx + 1}
                                </a>
                            ) : null
                        ))}
                    </div>
                )}
            </div>

             {msg.role === 'user' && (
                 <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0 mt-1 border border-red-200">
                     Me
                 </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4 justify-start">
             <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 p-1.5 shrink-0 mt-1 text-red-600">
                <PulseLogo className="w-full h-full" />
            </div>
            <div className="bg-white border border-zinc-200 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className={`p-4 ${isExpanded ? 'max-w-3xl w-full mx-auto pb-8' : 'bg-white border-t border-zinc-100'}`}>
        <div className="relative shadow-sm rounded-xl">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Pulse about your symptoms..."
            className="w-full pl-4 pr-24 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-sm text-zinc-800 placeholder:text-zinc-400"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button 
                onClick={toggleVoiceInput}
                className={`p-2 rounded-lg transition-colors ${isListening ? 'text-red-500 bg-red-50 animate-pulse' : 'text-zinc-400 hover:text-red-600 hover:bg-red-50'}`}
                title="Speak"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
            </button>
            
            <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:bg-zinc-300 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};