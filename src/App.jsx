import React, { useState, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FaMicrophone, FaMicrophoneAlt } from "react-icons/fa";

const GEMINI_API_KEY = import.meta.env.VITE_GREETING;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

export default function VoiceOverlayChat() {
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleVoice = () => {
    if (!recognition) {
      alert("Speech Recognition not supported.");
      return;
    }

    setListening(true);
    recognition.lang = "en-US"; // Accepts all voice types, recognizes best effort
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.start();

    recognition.onresult = async (event) => {
      const voiceInput = event.results[0][0].transcript;
      setListening(false);
      setProcessing(true);
      await askGeminiInEnglish(voiceInput);
    };

    recognition.onerror = (e) => {
      console.error("Speech error:", e.error);
      setListening(false);
      setProcessing(false);
    };
  };

  const askGeminiInEnglish = async (text) => {
    try {
      const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
      const result = await model.generateContent(`Translate and reply in English: ${text}`);
      const response = await result.response;
      const reply = (await response.text()).trim();

      const speak = new SpeechSynthesisUtterance(reply);
      speak.lang = "en-US";
      speechSynthesis.speak(speak);
    } catch (err) {
      console.error("Gemini error:", err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-10 right-6 z-50">
      <button
        onClick={handleVoice}
        disabled={processing}
        className={`rounded-full w-20 h-20 flex items-center justify-center shadow-xl transition-all ${
          listening
            ? "bg-red-600 animate-pulse"
            : processing
            ? "bg-gray-500"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {listening ? (
          <FaMicrophoneAlt size={32} className="text-white" />
        ) : (
          <FaMicrophone size={28} className="text-white" />
        )}
      </button>
    </div>
  );
}   