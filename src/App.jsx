import React, { useEffect, useRef, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FaMicrophone, FaMicrophoneAlt } from "react-icons/fa";

// 🔐 Get your Gemini API key from env
const GEMINI_API_KEY = import.meta.env.VITE_GREETING;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

export default function VoiceGeminiChat() {
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [userText, setUserText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const synthRef = useRef(window.speechSynthesis);
  const speakRef = useRef(null);

  useEffect(() => {
    if (!'speechSynthesis' in window) {
      setErrorMsg("Your browser does not support speech synthesis.");
    }
  }, []);

  const handleVoice = () => {
    if (!recognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    setErrorMsg("");
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
      setErrorMsg(`Speech error: ${e.error}`);
      setListening(false);
      setProcessing(false);
    };
  };

  const askGeminiInEnglish = async (text) => {
    try {
      const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
      const result = await model.generateContent(`Translate and reply in English only: ${text}`);
      const response = await result.response;
      const reply = (await response.text()).trim();
      setReplyText(reply);
      speakReply(reply);
    } catch (err) {
      setErrorMsg("Gemini error: " + err.message);
      console.error("Gemini error:", err);
    } finally {
      setProcessing(false);
    }
  };

  const speakReply = (text) => {
    if (!window.speechSynthesis) {
      setErrorMsg("Voice response could not play. Your browser doesn't support speech synthesis.");
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      speakRef.current = utterance;

      utterance.onerror = () => {
        setErrorMsg("Voice response could not play. Check your browser sound or permissions.");
      };

      synthRef.current.speak(utterance);
    } catch (error) {
      setErrorMsg("Speech synthesis failed: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-95 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl border border-gray-300 p-6 text-center">
        <h1 className="text-xl font-bold mb-2 text-gray-800">🎤 Voice Chat with Gemini</h1>
        <p className="text-gray-600 text-sm mb-4">Tap the mic and speak. Gemini will reply in English.</p>

        {userText && (
          <div className="mb-2 text-gray-700">
            <strong>You:</strong> {userText}
          </div>
        )}
        {replyText && (
          <div className="mb-4 text-green-700">
            <strong>Gemini:</strong> {replyText}
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 text-red-600 text-sm">
            ⚠️ {errorMsg}
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
