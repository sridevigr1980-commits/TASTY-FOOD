
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { connectVoiceAssistant } from '../services/gemini';
import { TranscriptionEntry } from '../types';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  isStreaming?: boolean;
}

const LiveVoiceAssistant: React.FC = () => {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const assistantRef = useRef<any>(null);
  
  // UI Refs
  const scrollRef = useRef<HTMLDivElement>(null);

  // Live API Transcription Tracking
  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');

  // Auto-scroll transcription
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const stopAllAudio = useCallback(() => {
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  }, []);

  // VOICE SESSION LOGIC
  const startVoiceSession = async () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const assistant = await connectVoiceAssistant({
        onAudioChunk: (buffer) => {
          if (!audioCtxRef.current) return;
          const source = audioCtxRef.current.createBufferSource();
          source.buffer = buffer;
          source.connect(audioCtxRef.current.destination);
          const now = audioCtxRef.current.currentTime;
          nextStartTimeRef.current = Math.max(nextStartTimeRef.current, now);
          source.start(nextStartTimeRef.current);
          nextStartTimeRef.current += buffer.duration;
          sourcesRef.current.add(source);
          source.onended = () => sourcesRef.current.delete(source);
        },
        onInterruption: () => {
          stopAllAudio();
        },
        onUserTranscription: (text) => {
          currentInputTranscription.current += text;
        },
        onAiTranscription: (text) => {
          currentOutputTranscription.current += text;
        }
      });

      assistantRef.current = assistant;
      setIsVoiceActive(true);
      
      // Add a system notice
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        text: "Voice mode activated. I'm listening!"
      }]);

    } catch (err) {
      alert("Could not start voice assistant. Please check microphone permissions.");
    }
  };

  const stopVoiceSession = async () => {
    if (assistantRef.current) {
      await assistantRef.current.close();
      assistantRef.current = null;
    }
    stopAllAudio();
    setIsVoiceActive(false);

    // If there was captured transcription, finalize it into the history
    if (currentInputTranscription.current || currentOutputTranscription.current) {
      const newMsgs: Message[] = [];
      if (currentInputTranscription.current) {
        newMsgs.push({ id: `v-u-${Date.now()}`, role: 'user', text: currentInputTranscription.current });
      }
      if (currentOutputTranscription.current) {
        newMsgs.push({ id: `v-a-${Date.now()}`, role: 'ai', text: currentOutputTranscription.current });
      }
      setMessages(prev => [...prev, ...newMsgs]);
      currentInputTranscription.current = '';
      currentOutputTranscription.current = '';
    }
  };

  // TEXT CHAT LOGIC
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: "You are 'Tasty AI', the voice of the Tasty Food app. You are a warm, traditional yet modern chef. You help users with recipe instructions, cooking tips, and ingredient substitutions. Keep responses concise and food-focused. You should sound like a helpful friend in the kitchen.",
        },
      });

      const stream = await chat.sendMessageStream({ message: userMessage.text });
      
      let fullAiText = '';
      const aiMessageId = (Date.now() + 1).toString();
      
      // Initialize empty AI message for streaming
      setMessages(prev => [...prev, { id: aiMessageId, role: 'ai', text: '', isStreaming: true }]);

      for await (const chunk of stream) {
        const chunkText = (chunk as GenerateContentResponse).text || '';
        fullAiText += chunkText;
        setMessages(prev => prev.map(m => 
          m.id === aiMessageId ? { ...m, text: fullAiText } : m
        ));
      }

      // Finalize the message
      setMessages(prev => prev.map(m => 
        m.id === aiMessageId ? { ...m, isStreaming: false } : m
      ));

    } catch (err) {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'ai',
        text: "I'm sorry, I'm having a bit of trouble connecting right now. Could you try again?"
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[700px] flex flex-col bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-stone-100">
      {/* Header */}
      <div className="bg-stone-900 p-6 flex items-center justify-between text-white">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-900/20">
              <i className="fa-solid fa-robot text-xl"></i>
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-stone-900 ${isVoiceActive ? 'bg-green-500 animate-pulse' : 'bg-stone-500'}`}></div>
          </div>
          <div>
            <h2 className="text-xl font-bold leading-none">Tasty AI</h2>
            <p className="text-xs text-stone-400 mt-1 uppercase tracking-widest font-bold">
              {isVoiceActive ? 'Live Voice Mode' : 'Online & Ready'}
            </p>
          </div>
        </div>
        
        <button 
          onClick={isVoiceActive ? stopVoiceSession : startVoiceSession}
          className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${isVoiceActive ? 'bg-red-500 hover:bg-red-600' : 'bg-stone-800 hover:bg-stone-700'}`}
        >
          {isVoiceActive ? (
            <>
              <i className="fa-solid fa-microphone-slash"></i>
              <span>Stop Voice</span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-microphone"></i>
              <span>Voice Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 bg-stone-50">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-24 h-24 rounded-[2rem] bg-white shadow-xl flex items-center justify-center text-orange-500">
              <i className="fa-solid fa-comment-dots text-4xl"></i>
            </div>
            <div className="max-w-xs">
              <h3 className="text-xl font-bold text-stone-800">Namaste!</h3>
              <p className="text-stone-500 text-sm mt-2">
                I'm your Tasty Food assistant. Ask me anything about recipes, ingredients, or cooking techniques!
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {["Best salad tips?", "Substitution for milk?", "Spice ratio?"].map(tag => (
                <button 
                  key={tag}
                  onClick={() => { setInputText(tag); }}
                  className="px-4 py-2 bg-white border border-stone-200 rounded-full text-xs font-bold text-stone-600 hover:border-orange-300 hover:text-orange-500 transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[85%] p-4 rounded-3xl shadow-sm ${
              msg.role === 'user' 
                ? 'bg-orange-500 text-white rounded-tr-none' 
                : 'bg-white text-stone-800 border border-stone-100 rounded-tl-none'
            }`}>
              {msg.role === 'ai' && (
                <p className="text-[10px] font-black uppercase mb-1 tracking-tighter opacity-50">Tasty AI</p>
              )}
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              {msg.isStreaming && (
                <span className="inline-block w-1 h-4 bg-orange-500 animate-pulse ml-1 align-middle"></span>
              )}
            </div>
          </div>
        ))}

        {isTyping && !messages[messages.length-1]?.isStreaming && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-3xl rounded-tl-none border border-stone-100 flex gap-1">
              <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-stone-100">
        <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isVoiceActive || isTyping}
            placeholder={isVoiceActive ? "Speak to interact..." : "Type your question here..."}
            className="flex-1 bg-stone-100 rounded-2xl px-6 py-4 pr-16 border-none focus:ring-2 focus:ring-orange-500/20 outline-none transition-all font-medium disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!inputText.trim() || isTyping || isVoiceActive}
            className="absolute right-2 w-12 h-12 bg-orange-500 text-white rounded-xl flex items-center justify-center hover:bg-orange-600 disabled:bg-stone-200 disabled:text-stone-400 transition-all shadow-lg shadow-orange-500/20"
          >
            {isTyping ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              <i className="fa-solid fa-paper-plane"></i>
            )}
          </button>
        </form>
        <p className="text-[10px] text-stone-400 text-center mt-4 font-bold uppercase tracking-widest opacity-60">
          Powered by Gemini AI Technology
        </p>
      </div>
    </div>
  );
};

export default LiveVoiceAssistant;
