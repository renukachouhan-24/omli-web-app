// "use client";

// import { useEffect, useRef, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Image from "next/image";
// import { Trash2, MessageSquare, X } from "lucide-react"; 
// import type { STTLogic, TTSLogic } from "speech-to-speech";
// import penguinImg from "../penguin.jpeg";

// interface SharedAudioPlayer {
//   configure: (config: { autoPlay?: boolean; volume?: number }) => void;
//   addAudioIntoQueue: (audio: Float32Array, sampleRate?: number) => void;
//   setPlayingChangeCallback: (callback: (playing: boolean) => void) => void;
//   stopAndClearQueue: () => void;
// }

// interface ChatHistoryItem {
//   id: number;
//   role: "user" | "ai";
//   content: string;
// }

// export default function OmliWeb() {
//   const [isListening, setIsListening] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [text, setText] = useState("Tap the mic to start!");
//   const [isReady, setIsReady] = useState(false);
//   const [isBusy, setIsBusy] = useState(false);
  
//   // Sidebar states
//   const [history, setHistory] = useState<ChatHistoryItem[]>([]);
//   const [showHistory, setShowHistory] = useState(false);

//   const isBusyRef = useRef(false);
//   const sttRef = useRef<STTLogic | null>(null);
//   const ttsRef = useRef<TTSLogic | null>(null);
//   const sharedPlayerRef = useRef<SharedAudioPlayer | null>(null);

//   // --- LOCAL STORAGE LOGIC ---
  
//   // 1. Load data from Local Storage on mount
//   useEffect(() => {
//     const savedHistory = localStorage.getItem("omli_chat_history");
//     if (savedHistory) {
//       setHistory(JSON.parse(savedHistory));
//     }
//   }, []);

//   // 2. Save data to Local Storage whenever history changes
//   useEffect(() => {
//     localStorage.setItem("omli_chat_history", JSON.stringify(history));
//   }, [history]);

//   useEffect(() => {
//     let isMounted = true;
//     const initSpeech = async () => {
//       const { STTLogic, TTSLogic, sharedAudioPlayer } = await import("speech-to-speech");
//       sharedAudioPlayer.configure({ autoPlay: true, volume: 1 });
//       sharedAudioPlayer.setPlayingChangeCallback((playing) => {
//         if (isMounted) setIsSpeaking(playing);
//       });
//       sharedPlayerRef.current = sharedAudioPlayer;
//       const tts = new TTSLogic({ voiceId: "en_US-hfc_female-medium", warmUp: true });
//       await tts.initialize();

//       const stt = new STTLogic(
//         (message, level) => { if (level === "error") console.error(message); },
//         async (transcript) => {
//           const clean = transcript.trim();
//           if (!clean || isBusyRef.current) return;

//           // Add User Message
//           const userMsg: ChatHistoryItem = { id: Date.now(), role: "user", content: clean };
//           setHistory(prev => [...prev, userMsg]);

//           setIsListening(false);
//           isBusyRef.current = true;
//           setIsBusy(true);
//           setText("Thinking...");
//           sttRef.current?.stop();

//           try {
//             const res = await fetch("/api/chat", {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({ prompt: clean }),
//             });
//             const data = await res.json();
//             setText(data.text);

//             // Add AI Message
//             const aiMsg: ChatHistoryItem = { id: Date.now() + 1, role: "ai", content: data.text };
//             setHistory(prev => [...prev, aiMsg]);

//             const result = await ttsRef.current?.synthesize(data.text);
//             if (result && sharedPlayerRef.current) {
//               sharedPlayerRef.current.addAudioIntoQueue(result.audio, result.sampleRate);
//             }
//           } catch {
//             setText("Oops! Something went wrong.");
//           } finally {
//             isBusyRef.current = false;
//             setIsBusy(false);
//           }
//         }
//       );

//       sttRef.current = stt;
//       ttsRef.current = tts;
//       if (isMounted) setIsReady(true);
//     };

//     initSpeech();
//     return () => {
//       isMounted = false;
//       sttRef.current?.stop();
//     };
//   }, []);

//   const handleInteraction = () => {
//     if (!isReady) return;
//     if (isListening) {
//       sttRef.current?.stop();
//       setIsListening(false);
//     } else {
//       sttRef.current?.clearTranscript();
//       sttRef.current?.start();
//       setIsListening(true);
//       setText("Listening...");
//     }
//   };

//   const clearChat = () => {
//     setHistory([]);
//     localStorage.removeItem("omli_chat_history"); // Storage bhi clear karein
//     setText("History cleared!");
//   };

//   return (
//     <div className="flex min-h-screen bg-[#ead9fd] overflow-hidden font-sans">
      
      
//       {/* Sidebar - History */}
//       <AnimatePresence>
//         {showHistory && (
//           <motion.div
//             initial={{ x: -300 }}
//             animate={{ x: 0 }}
//             exit={{ x: -300 }}
//             className="fixed left-0 top-0 z-50 h-full w-90 bg-white shadow-2xl p-6 flex flex-col"
//           >
//             <div className="flex items-center justify-between mb-8">
//               <h2 className="text-xl font-bold text-purple-900 flex items-center gap-2">
//                 <MessageSquare className="text-purple-500" /> Chat Logs
//               </h2>
//               <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
//                 <X size={24} className="text-gray-400 hover:text-gray-600" />
//               </button>
//             </div>

//             <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
//               {history.length === 0 ? (
//                 <div className="text-center mt-20 opacity-40">
//                   <MessageSquare size={48} className="mx-auto mb-2" />
//                   <p className="text-sm font-medium">No saved conversations</p>
//                 </div>
//               ) : (
//                 history.map((item) => (
//                   <div 
//                     key={item.id} 
//                     className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
//                       item.role === 'user' 
//                         ? 'bg-purple-600 text-white ml-6 rounded-tr-none' 
//                         : 'bg-gray-100 text-gray-800 mr-6 rounded-tl-none border border-gray-200'
//                     }`}
//                   >
//                     {item.content}
//                   </div>
//                 ))
//               )}
//             </div>

//             <button
//               onClick={clearChat}
//               className="mt-6 flex items-center justify-center gap-2 w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all border border-red-100 active:scale-95"
//             >
//               <Trash2 size={18} /> Delete All History
//             </button>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Main UI */}
//       <div className="flex flex-1 flex-col items-center justify-center p-6 relative">
        
//         {/* Sidebar Toggle Button */}
//         <button 
//           onClick={() => setShowHistory(true)}
//           className="absolute top-8 left-8 p-4 bg-white rounded-2xl shadow-lg hover:bg-purple-50 transition-all group active:scale-90"
//         >
//           <MessageSquare className="text-purple-600 group-hover:scale-110 transition-transform" size={28} />
//         </button>

//         {/* Penguin Bubble */}
//         <div className="relative mb-8 max-w-sm rounded-4xl bg-white px-8 py-6 shadow-md border-b-4 border-purple-200">
//           <p className="text-center text-lg font-semibold text-purple-900 leading-snug">
//             {text}
//           </p>
//           <div className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rotate-45 bg-white border-r border-b border-purple-100"></div>
//         </div>

//         {/* Penguin Image */}
//         <motion.div
//           animate={isSpeaking ? { 
//             y: [0, -10, 10, 0],
//           } : {}}
//           transition={{ repeat: Infinity, duration: 0.6 }}
//           className="relative z-10 mb-10"
//         >
//           <Image 
//             src={penguinImg}
//             alt="Omli Penguin" 
//             width={320} 
//             height={320} 
//             priority
//           />
//         </motion.div>

//         {/* Mic Control */}
//         <div className="flex flex-col items-center gap-6">
//           <button
//             onClick={handleInteraction}
//             disabled={!isReady || isBusy}
//             className={`relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] transition-all active:scale-90 ${
//               isListening ? "ring-4 ring-purple-400" : "hover:shadow-purple-200"
//             }`}
//           >
//             <div className="text-4xl">
//               {isListening ? "🎤" : "🎙️"} 
//             </div>
            
//             {isListening && (
//               <motion.div 
//                 initial={{ scale: 0.8, opacity: 0.6 }}
//                 animate={{ scale: 2, opacity: 0 }}
//                 transition={{ repeat: Infinity, duration: 1.5 }}
//                 className="absolute inset-0 rounded-full bg-purple-400"
//               />
//             )}
//           </button>
          
//           <div className="text-center">
//             <p className="text-sm font-black tracking-[0.2em] text-purple-700 uppercase">
//               {isListening ? "I'm listening..." : "Tap to talk"}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Trash2, MessageSquare, X } from "lucide-react"; 
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
  
  useEffect(() => {
    const savedHistory = localStorage.getItem("omli_chat_history");
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      setHistory(parsed);
      historyRef.current = parsed; // Ref ko bhi update karein
    }
  }, []);

  // 2. Save data to Local Storage (Jab bhi history badle, lekin tabhi jab history khali na ho)
  useEffect(() => {
    // Check: Agar history khali hai toh save mat karo (taki load wala data overwrite na ho)
    if (history.length > 0) {
      localStorage.setItem("omli_chat_history", JSON.stringify(history));
    }
    historyRef.current = history;
  }, [history]);

  // History Ref use karenge taaki STT callback ke andar latest history mil sake
  // const historyRef = useRef<ChatHistoryItem[]>([]);
  // useEffect(() => {
  //   historyRef.current = history;
  //   localStorage.setItem("omli_chat_history", JSON.stringify(history));
  // }, [history]);

  // useEffect(() => {
  //   const savedHistory = localStorage.getItem("omli_chat_history");
  //   if (savedHistory) {
  //     setHistory(JSON.parse(savedHistory));
  //   }
  // }, []);

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
          
          // Latest history update karein
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
              // Yahan ab poori history ja rahi hai
              body: JSON.stringify({ chatHistory: updatedHistory }), 
            });
            const data = await res.json();
            setText(data.text);

            const aiMsg: ChatHistoryItem = { id: Date.now() + 1, role: "ai", content: data.text };
            setHistory(prev => [...prev, aiMsg]);

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
    localStorage.removeItem("omli_chat_history");
    setText("History cleared!");
  };

  return (
    // ... rest of your UI code remains exactly the same
    <div className="flex min-h-screen bg-[#ead9fd] overflow-hidden font-sans">
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed left-0 top-0 z-50 h-full w-90 bg-white shadow-2xl p-6 flex flex-col"
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
          className="absolute top-8 left-8 p-4 bg-white rounded-2xl shadow-lg hover:bg-purple-50 transition-all group active:scale-90"
        >
          <MessageSquare className="text-purple-600 group-hover:scale-110 transition-transform" size={28} />
        </button>

        <div className="relative mb-8 max-w-sm rounded-4xl bg-white px-8 py-6 shadow-md border-b-4 border-purple-200">
          <p className="text-center text-lg font-semibold text-purple-900 leading-snug">
            {text}
          </p>
          <div className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rotate-45 bg-white border-r border-b border-purple-100"></div>
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
            className={`relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] transition-all active:scale-90 ${
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
  );
}