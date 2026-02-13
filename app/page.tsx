"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Trash2, MessageSquare, X } from "lucide-react";
import { signOut, signIn, useSession } from "next-auth/react";
import type { STTLogic, TTSLogic } from "speech-to-speech";
import bunni2Img from "../bunni3.jpeg";

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
  const { data: session, status } = useSession();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [text, setText] = useState("Hi! I am Bunni. Let's talk!");
  const [isReady, setIsReady] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  const isBusyRef = useRef(false);
  const sttRef = useRef<STTLogic | null>(null);
  const ttsRef = useRef<TTSLogic | null>(null);
  const sharedPlayerRef = useRef<SharedAudioPlayer | null>(null);
  const historyRef = useRef<ChatHistoryItem[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const addParticles = (e: React.MouseEvent) => {
    const newItems = [1, 2, 3, 4, 5, 6, 7].map((i) => ({
      id: Date.now() + i,
      x: e.clientX + (Math.random() * 40 - 20), // Thoda random phailao
      y: e.clientY + (Math.random() * 40 - 20),
    }));

    setParticles((prev) => [...prev, ...newItems]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newItems.find(n => n.id === p.id)));
    }, 2000);
  };

  const storageKey = session?.user?.email
    ? `Bunni_chat_history_${session.user.email}`
    : "Bunni_chat_history_guest";

  const audioProcessingQueue = useRef<string[]>([]);
  const isProcessingQueue = useRef(false);

  // const processSequentialAudio = useCallback(async () => {
  //   if (isProcessingQueue.current || audioProcessingQueue.current.length === 0) return;

  //   isProcessingQueue.current = true;
  //   const sentence = audioProcessingQueue.current.shift();

  //   if (sentence && ttsRef.current && sharedPlayerRef.current) {
  //     try {
  //       const result = await ttsRef.current.synthesize(sentence);
  //       if (result) {
  //         sharedPlayerRef.current.addAudioIntoQueue(result.audio, result.sampleRate);
  //       }
  //     } catch (err) {
  //       console.error("TTS Synthesis Error:", err);
  //     }
  //   }

  //   isProcessingQueue.current = false;
  //   processSequentialAudio();
  // }, []);

  const processSequentialAudio = useCallback(async () => {
    if (isProcessingQueue.current || audioProcessingQueue.current.length === 0) return;

    isProcessingQueue.current = true;
    const rawSentence = audioProcessingQueue.current.shift();

    if (rawSentence && ttsRef.current && sharedPlayerRef.current) {
      try {
        // ✨ CLEANING LOGIC: Yeh symbols aur action text (like *hops*) ko remove kar dega
        const cleanSentence = rawSentence.replace(/\*.*?\*/g, '').trim();

        // Agar sentence cleaning ke baad khali nahi hai, tabhi bolna shuru kare
        if (cleanSentence) {
          const result = await ttsRef.current.synthesize(cleanSentence);
          if (result) {
            sharedPlayerRef.current.addAudioIntoQueue(result.audio, result.sampleRate);
          }
        }
      } catch (err) {
        console.error("TTS Synthesis Error:", err);
      }
    }

    isProcessingQueue.current = false;
    processSequentialAudio();
  }, []);

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
    localStorage.setItem(storageKey, JSON.stringify(history));
    historyRef.current = history;
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

            if (!res.body) throw new Error("Stream body missing");

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            let fullAIContent = "";
            let currentSentenceBuffer = "";
            const processedSentences = new Set<string>();

            setText("");

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              fullAIContent += chunk;
              currentSentenceBuffer += chunk;

              setText(fullAIContent);

              if (/[.!?]/.test(chunk)) {
                const sentences = currentSentenceBuffer.split(/(?<=[.!?])\s+/);
                const toProcess = sentences.slice(0, -1);

                for (const s of toProcess) {
                  const trimmed = s.trim();
                  if (trimmed && !processedSentences.has(trimmed)) {
                    processedSentences.add(trimmed);
                    audioProcessingQueue.current.push(trimmed);
                    processSequentialAudio();
                  }
                }
                currentSentenceBuffer = sentences[sentences.length - 1] || "";
              }
            }

            if (currentSentenceBuffer.trim() && !processedSentences.has(currentSentenceBuffer.trim())) {
              audioProcessingQueue.current.push(currentSentenceBuffer.trim());
              processSequentialAudio();
            }

            const aiMsg: ChatHistoryItem = { id: Date.now() + 1, role: "ai", content: fullAIContent };
            setHistory(prev => [...prev, aiMsg]);

          } catch (err) {
            console.error("Chat Error:", err);
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

    if (session) {
      initSpeech();
    }

    return () => {
      isMounted = false;
      sttRef.current?.stop();
    };
  }, [processSequentialAudio, session]);

  useEffect(() => {
    if (videoRef.current) {
      if (isSpeaking) {
        videoRef.current.play().catch(err => console.error("Video play error:", err));
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isSpeaking]);

  const handleInteraction = () => {
    if (!isReady) return;
    if (isSpeaking) return;
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

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center bg-magical">Loading Bunni...</div>;
  }

  if (!session) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center bg-magical p-6 text-center relative overflow-hidden"
        onClick={addParticles}
      >
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: [0, 1.5, 0], opacity: 0, y: -80 }}
            transition={{ duration: 1 }}
            className="sparkle pointer-events-none"
            style={{ left: p.x, top: p.y, position: 'fixed', zIndex: 100 }}
          />
        ))}

        <div className="bubbles-container">
          <div className="bubble" style={{ width: '100px', height: '100px', left: '15%', animationDuration: '10s' }}></div>
          <div className="bubble" style={{ width: '60px', height: '60px', left: '75%', animationDuration: '15s', animationDelay: '2s' }}></div>
          <div className="bubble" style={{ width: '40px', height: '40px', left: '50%', animationDuration: '12s', animationDelay: '5s' }}></div>
        </div>

        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-8 relative z-10">
          <Image src={bunni2Img} alt="Omli Penguin" width={200} height={200} className="rounded-full shadow-2xl border-4 border-white" />
        </motion.div>

        <h1 className="mb-4 text-4xl font-black bg-clip-text text-transparent bg-linear-to-r from-purple-600 to-pink-500 animate-pulse">
          Bunni Kids AI
        </h1>

        <p className="mb-8 text-xl font-bold text-purple-700 relative z-10">
          Login with Google to start your magical conversation!
        </p>

        <button
          onClick={() => signIn("google")}
          className="rounded-full bg-white/70 px-10 py-4 text-xl font-bold text-purple-600 shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          🚀 Sign In with Google
        </button>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen bg-magical overflow-hidden font-sans" onClick={addParticles}>
      <div className="bubbles-container">
        <div className="bubble" style={{ width: '80px', height: '80px', left: '10%', animationDuration: '8s' }}></div>
        <div className="bubble" style={{ width: '40px', height: '40px', left: '20%', animationDuration: '12s', animationDelay: '2s' }}></div>
        <div className="bubble" style={{ width: '100px', height: '100px', left: '35%', animationDuration: '15s' }}></div>
        <div className="bubble" style={{ width: '60px', height: '60px', left: '50%', animationDuration: '10s', animationDelay: '5s' }}></div>
        <div className="bubble" style={{ width: '90px', height: '90px', left: '70%', animationDuration: '14s' }}></div>
        <div className="bubble" style={{ width: '50px', height: '50px', left: '85%', animationDuration: '11s', animationDelay: '3s' }}></div>
      </div>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: [0, 1.5, 0], opacity: 0, y: -50 }}
          transition={{ duration: 1 }}
          className="sparkle pointer-events-none"
          style={{ left: p.x, top: p.y, position: 'fixed', zIndex: 100 }}
        />
      ))}

      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed left-0 top-0 z-50 h-full w-90 glass-card shadow-2xl p-6 flex flex-col"
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
                    className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${item.role === 'user'
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
              className="mt-6 flex items-center justify-center gap-2 w-full py-4 bg-white text-red-600 rounded-2xl font-bold transition-all border border-red-100 active:scale-95"
            >
              <Trash2 size={18} /> Delete All History
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 flex-col items-center justify-center p-6 relative">
        <button
          onClick={() => setShowHistory(true)}
          className="absolute top-8 left-8 p-4 bg-white/60 rounded-2xl shadow-lg hover:bg-purple-50 transition-all group active:scale-90"
        >
          <MessageSquare className="text-purple-600 group-hover:scale-110 transition-transform" size={28} />
        </button>

        <div className="absolute top-8 right-8 flex items-center gap-4">
          <span className="hidden md:block text-sm font-bold text-purple-900">Hi, {session.user?.name}!</span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-4 py-2 rounded-2xl bg-white/60 shadow-lg text-sm font-semibold text-purple-900 hover:bg-purple-50 transition-all active:scale-90"
          >
            Log out
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }}
          transition={{ duration: 0.5, y: { repeat: Infinity, duration: 3 } }}
          className="relative mb-8 max-w-sm rounded-[2.5rem] bg-white/30 backdrop-blur-md px-10 py-8 shadow-[0_20px_50px_rgba(147,51,234,0.15)] border-2 border-white"
        >
          <p className="text-center text-xl font-bold text-purple-900 leading-relaxed italic">
            {text}
          </p>
          <div className="absolute -bottom-4 left-1/2 h-8 w-8 -translate-x-1/2 rotate-45 bg-white/25 border-r-2 border-b-2 border-purple-50"></div>
        </motion.div>

        <motion.div
          animate={isSpeaking ? { scale: [1, 1.02, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
          className="relative z-10 mb-10 overflow-hidden rounded-full shadow-2xl border-4 border-white"
        >
          <video
            ref={videoRef}
            src="/rabbit_video.mp4"
            muted
            playsInline
            loop
            className="w-80 h-80 object-cover"
          />
        </motion.div>

        <div className="flex flex-col items-center gap-6">
          <button
            onClick={handleInteraction}
            disabled={!isReady || isBusy || isSpeaking}
            className={`relative flex h-24 w-24 items-center justify-center rounded-full bg-white/60 shadow-lg transition-all 
            ${(isListening) ? "ring-4 ring-purple-400" : ""} 
            ${(isSpeaking || isBusy) ? "opacity-50 cursor-not-allowed" : "active:scale-90 hover:shadow-purple-200"}`}
          >
            <div className="text-4xl">{isListening ? "🎤" : "🎙️"}</div>
            {isListening && (
              <motion.div
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 rounded-full bg-linear-to-r from-purple-400 to-pink-300"
              />
            )}
          </button>
          <div className="text-center">
            <p className="text-sm font-black tracking-[0.2em] text-purple-700 uppercase">
              {isSpeaking ? "Bunni is talking..." : isListening ? "I'm listening..." : "Tap to talk"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// bunni 