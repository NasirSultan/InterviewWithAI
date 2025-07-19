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
  const [userText, setUserText] = useState("");
  const [replyText, setReplyText] = useState("");

  const handleVoice = () => {
    if (!recognition) {
      alert("Speech Recognition not supported.");
      return;
    }

    setUserText("");
    setReplyText("");
    setListening(true);

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.start();

    recognition.onresult = async (event) => {
      const voiceInput = event.results[0][0].transcript;
      setUserText(voiceInput);
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
      setReplyText(reply);

      // Ensure speech works on mobile (iOS/Android)
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const speak = new SpeechSynthesisUtterance(reply);
      speak.lang = "en-US";
      speak.rate = 1;
      speak.pitch = 1;
      speak.onstart = () => console.log("Speaking started");
      speak.onerror = (e) => console.error("Speech synthesis error:", e.error);

      window.speechSynthesis.speak(speak);

      // Fallback if voice doesn't start
      setTimeout(() => {
        if (!speechSynthesis.speaking) {
          alert("Voice response could not play. Check your browser sound or permissions.");
        }
      }, 2000);
    } catch (err) {
      console.error("Gemini error:", err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-10 right-6 z-50 p-4 max-w-md w-full bg-white rounded-xl shadow-2xl border border-gray-200">
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Voice Chat with Gemini</h2>
        <p className="text-sm text-gray-500">Tap the mic and ask anything.</p>
      </div>

      {userText && (
        <div className="mb-2 text-sm text-gray-700">
          <strong>You:</strong> {userText}
        </div>
      )}
      {replyText && (
        <div className="mb-2 text-sm text-green-700">
          <strong>Gemini:</strong> {replyText}
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleVoice}
          disabled={processing}
          className={`rounded-full w-20 h-20 flex items-center justify-center shadow-xl transition-all ${
            listening
              ? "bg-red-600 animate-pulse"
              : processing
              ? "bg-gray-500 cursor-not-allowed"
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
    </div>
  );
}
