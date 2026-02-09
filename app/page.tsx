"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Trash2, MessageSquare, X } from "lucide-react"; 
import { signOut, useSession } from "next-auth/react";
import type { STTLogic, TTSLogic } from "speech-to-speech";
import penguinImg from "../penguin.jpeg";

interface SharedAudioPlayer {
  configure: (config: { autoPlay?: boolean; volume?: number }) => void;
  addAudioIntoQueue: (audio: Float32Array, sampleRate?: number) => void;
  setPlayingChangeCallback: (callback: (playing: boolean) => void) => void;
  stopAndClearQueue: () => void;
}

interface ChatHistoryItem {
  id: number;
  role: "user" | "ai";
  content: string;
}

export default function OmliWeb() {
  const { data: session } = useSession();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [text, setText] = useState("Hi! I am Omli. Let's talk!");
  const [isReady, setIsReady] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const isBusyRef = useRef(false);
  const sttRef = useRef<STTLogic | null>(null);
  const ttsRef = useRef<TTSLogic | null>(null);
  const sharedPlayerRef = useRef<SharedAudioPlayer | null>(null);
  const historyRef = useRef<ChatHistoryItem[]>([]);

  const storageKey = session?.user?.email
    ? `omli_chat_history_${session.user.email}`
    : "omli_chat_history_guest";

  useEffect(() => {
    const savedHistory = localStorage.getItem(storageKey);
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      setHistory(parsed);
      historyRef.current = parsed;
    } else {
      setHistory([]);
      historyRef.current = [];
    }
  }, [storageKey]);

  useEffect(() => {
    historyRef.current = history;
    localStorage.setItem(storageKey, JSON.stringify(history));
  }, [history, storageKey]);

  useEffect(() => {
    let isMounted = true;
    const initSpeech = async () => {
      const { STTLogic, TTSLogic, sharedAudioPlayer } = await import("speech-to-speech");
      sharedAudioPlayer.configure({ autoPlay: true, volume: 1 });
      sharedAudioPlayer.setPlayingChangeCallback((playing) => {
        if (isMounted) setIsSpeaking(playing);
      });
      sharedPlayerRef.current = sharedAudioPlayer;
      const tts = new TTSLogic({ voiceId: "en_US-hfc_female-medium", warmUp: true });
      await tts.initialize();

      const stt = new STTLogic(
        (message, level) => { if (level === "error") console.error(message); },
        async (transcript) => {
          const clean = transcript.trim();
          if (!clean || isBusyRef.current) return;

          const userMsg: ChatHistoryItem = { id: Date.now(), role: "user", content: clean };
          
          const updatedHistory = [...historyRef.current, userMsg];
          setHistory(updatedHistory);

          setIsListening(false);
          isBusyRef.current = true;
          setIsBusy(true);
          setText("Thinking...");
          sttRef.current?.stop();

          try {
            const res = await fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chatHistory: updatedHistory }), 
            });
            const data = await res.json();
            setText(data.text);

            const aiMsg: ChatHistoryItem = { id: Date.now() + 1, role: "ai", content: data.text };
            const withAi = [...historyRef.current, aiMsg];
            setHistory(withAi);

            const result = await ttsRef.current?.synthesize(data.text);
            if (result && sharedPlayerRef.current) {
              sharedPlayerRef.current.addAudioIntoQueue(result.audio, result.sampleRate);
            }
          } catch {
            setText("Oops! Something went wrong.");
          } finally {
            isBusyRef.current = false;
            setIsBusy(false);
          }
        }
      );

      sttRef.current = stt;
      ttsRef.current = tts;
      if (isMounted) setIsReady(true);
    };

    initSpeech();
    return () => {
      isMounted = false;
      sttRef.current?.stop();
    };
  }, []);

  const handleInteraction = () => {
    if (!isReady) return;
    if (isListening) {
      sttRef.current?.stop();
      setIsListening(false);
    } else {
      sttRef.current?.clearTranscript();
      sttRef.current?.start();
      setIsListening(true);
      setText("Listening...");
    }
  };

  const clearChat = () => {
    setHistory([]);
    localStorage.removeItem(storageKey);
    setText("History cleared!");
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-linear-to-br from-[#f7ecff] via-[#ead9fd] to-[#d9f0ff] font-sans">
      <div className="pointer-events-none absolute -top-24 -left-20 h-64 w-64 rounded-full bg-purple-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 h-56 w-56 rounded-full bg-pink-300/30 blur-3xl" />

      <div className="flex min-h-screen">
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed left-0 top-0 z-50 h-full w-90 bg-white/90 backdrop-blur-xl shadow-2xl p-6 flex flex-col border-r border-white/60"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-purple-900 flex items-center gap-2">
                <MessageSquare className="text-purple-500" /> Chat Logs
              </h2>
              <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {history.length === 0 ? (
                <div className="text-center mt-20 opacity-40">
                  <MessageSquare size={48} className="mx-auto mb-2" />
                  <p className="text-sm font-medium">No saved conversations</p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id} 
                    className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      item.role === 'user' 
                        ? 'bg-purple-600 text-white ml-6 rounded-tr-none' 
                        : 'bg-gray-100 text-gray-800 mr-6 rounded-tl-none border border-gray-200'
                    }`}
                  >
                    {item.content}
                  </div>
                ))
              )}
            </div>

            <button
              onClick={clearChat}
              className="mt-6 flex items-center justify-center gap-2 w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all border border-red-100 active:scale-95"
            >
              <Trash2 size={18} /> Delete All History
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 flex-col items-center justify-center p-6 relative">
        <button 
          onClick={() => setShowHistory(true)}
          className="absolute top-8 left-8 p-4 bg-white/80 backdrop-blur rounded-2xl shadow-lg hover:bg-purple-50 transition-all group active:scale-90"
        >
          <MessageSquare className="text-purple-600 group-hover:scale-110 transition-transform" size={28} />
        </button>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="absolute top-8 right-8 px-4 py-2 rounded-2xl bg-white/80 backdrop-blur shadow-lg text-sm font-semibold text-purple-900 hover:bg-purple-50 transition-all active:scale-90"
        >
          Log out
        </button>

        <div className="relative mb-8 max-w-md rounded-4xl bg-white/85 backdrop-blur px-8 py-6 shadow-lg border border-white/60">
          <p className="text-center text-lg font-semibold text-purple-900 leading-snug">
            {text}
          </p>
          <div className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rotate-45 bg-white/90 border-r border-b border-purple-100"></div>
        </div>

        <motion.div
          animate={isSpeaking ? { y: [0, -10, 10, 0] } : {}}
          transition={{ repeat: Infinity, duration: 0.6 }}
          className="relative z-10 mb-10"
        >
          <Image src={penguinImg} alt="Omli Penguin" width={320} height={320} priority />
        </motion.div>

        <div className="flex flex-col items-center gap-6">
          <button
            onClick={handleInteraction}
            disabled={!isReady || isBusy}
            className={`relative flex h-24 w-24 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] transition-all active:scale-90 ${
              isListening ? "ring-4 ring-purple-400" : "hover:shadow-purple-200"
            }`}
          >
            <div className="text-4xl">{isListening ? "🎤" : "🎙️"}</div>
            {isListening && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0.6 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 rounded-full bg-purple-400"
              />
            )}
          </button>
          <div className="text-center">
            <p className="text-sm font-black tracking-[0.2em] text-purple-700 uppercase">
              {isListening ? "I'm listening..." : "Tap to talk"}
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}