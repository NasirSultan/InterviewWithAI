import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FaMicrophone, FaMicrophoneAlt } from "react-icons/fa";

// Your Gemini API key
const GEMINI_API_KEY = import.meta.env.VITE_GREETING; // or use hardcoded key for test
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

  // ✅ Load voices on iOS (wait for voices to be available)
  useEffect(() => {
    const waitForVoices = (resolve) => {
      const voices = speechSynthesis.getVoices();
      if (voices.length) resolve();
      else setTimeout(() => waitForVoices(resolve), 100);
    };
    new Promise(waitForVoices).then(() => setVoicesReady(true));
  }, []);

  const handleVoice = async () => {
    if (!recognition) {
      alert("Speech Recognition not supported on this browser.");
      return;
    }
    if (!voicesReady) {
      alert("Voice engine not ready. Please try again.");
      return;
    }

    setListening(true);
    setUserText("");
    setReplyText("");

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.start();

    recognition.onresult = async (event) => {
      const spoken = event.results[0][0].transcript;
      setUserText(spoken);
      setListening(false);
      setProcessing(true);
      await askGemini(spoken);
    };

    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e.error);
      setListening(false);
      setProcessing(false);
    };
  };

  const askGemini = async (text) => {
    try {
      const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
      const result = await model.generateContent(`Translate and reply in English only:\n${text}`);
      const response = await result.response;
      const reply = (await response.text()).trim();
      setReplyText(reply);
      speakNow(reply);
    } catch (err) {
      console.error("Gemini error:", err);
      alert("Failed to get a response from Gemini.");
    } finally {
      setProcessing(false);
    }
  };

  const speakNow = (text) => {
    const voices = speechSynthesis.getVoices();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.voice = voices.find((v) => v.lang === "en-US") || null;
    utter.rate = 1;
    utter.pitch = 1;

    utter.onerror = (e) => {
      console.error("Speech synthesis error:", e.error);
      alert("Voice response could not play. Check browser permissions or volume.");
    };

    window.speechSynthesis.cancel(); // Clear any pending
    window.speechSynthesis.speak(utter);

    setTimeout(() => {
      if (!speechSynthesis.speaking) {
        alert("Voice response could not play. Make sure sound is on and not muted.");
      }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90">
      <div className="p-6 max-w-md w-full bg-white rounded-xl shadow-2xl border border-gray-200 text-center">
        <h2 className="text-lg font-bold text-gray-800 mb-2">🎤 Voice Chat with Gemini</h2>
        <p className="text-sm text-gray-500 mb-4">Tap the mic and speak. Gemini will reply in English.</p>

        {userText && (
          <div className="mb-2 text-sm text-gray-800">
            <strong>You:</strong> {userText}
          </div>
        )}
        {replyText && (
          <div className="mb-4 text-sm text-green-700">
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
