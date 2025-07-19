import React, { useState, useEffect, useRef } from "react";
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
  const [voicesReady, setVoicesReady] = useState(false);

  // Preload voices on iOS to fix speechSynthesis block
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length) {
        setVoicesReady(true);
      } else {
        speechSynthesis.onvoiceschanged = () => {
          setVoicesReady(true);
        };
      }
    };
    loadVoices();
  }, []);

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
      speakNow(reply); // Must be direct call from user click
    } catch (err) {
      console.error("Gemini error:", err);
      alert("Failed to get response from Gemini.");
    } finally {
      setProcessing(false);
    }
  };

  const speakNow = (text) => {
    try {
      if (!voicesReady) {
        alert("Voice engine not ready. Try again.");
        return;
      }

      window.speechSynthesis.cancel(); // stop any previous speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 1;
      utterance.pitch = 1;

      utterance.onerror = (e) => {
        console.error("Speech synthesis error:", e.error);
        alert("Voice response failed to play. Please check permissions.");
      };

      window.speechSynthesis.speak(utterance);

      // Detect if speech doesn't start (safari sometimes fails silently)
      setTimeout(() => {
        if (!speechSynthesis.speaking) {
          alert("Voice response could not play. Check your browser sound or permissions.");
        }
      }, 2000);
    } catch (err) {
      console.error("Speech error", err);
    }
  };

  return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90">
  <div className="p-4 max-w-md w-full bg-white rounded-xl shadow-2xl border border-gray-200">
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
</div>

  );
}
