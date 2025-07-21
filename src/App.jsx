import React, { useEffect, useRef, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FaMicrophone, FaMicrophoneAlt } from "react-icons/fa";

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
    if (!("speechSynthesis" in window)) {
      setErrorMsg("Speech synthesis is not supported in your browser.");
    }
  }, []);

  const handleVoice = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser.");
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
      await askGemini(voiceInput);
    };

    recognition.onerror = (e) => {
      setErrorMsg(`Speech error: ${e.error}`);
      setListening(false);
      setProcessing(false);
    };
  };

  const askGemini = async (text) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(`Translate and respond in English: ${text}`);
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
      setErrorMsg("Speech synthesis is not supported.");
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      speakRef.current = utterance;

      utterance.onerror = () => {
        setErrorMsg("Speech playback failed. Check sound or permissions.");
      };

      synthRef.current.speak(utterance);
    } catch (error) {
      setErrorMsg("Synthesis failed: " + error.message);
    }
  };

 return (
  <div className="fixed inset-0 flex items-center justify-center p-4">
  <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 animate-scaleIn transition-all duration-500 ease-out">
    
    {/* Title */}
    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-center text-gray-800 mb-4 font-sans tracking-tight animate-fade-in">
      Voice Assistant
    </h1>

    {/* Subtitle */}
    <p className="text-sm sm:text-base md:text-lg text-gray-600 text-center mb-6 leading-relaxed">
      Tap the mic to speak. Gemini will respond in clear, fluent English with voice output.
    </p>

    {/* Error Message */}
    {errorMsg && (
      <div className="text-sm sm:text-base text-red-600 text-center mb-3 animate-fadeIn">
        {errorMsg}
      </div>
    )}

    {/* Mic Button + Waves */}
    <div className="flex justify-center mt-4 relative">
      {listening && (
        <>
          <div className="absolute w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full border-4 border-blue-300 animate-ping z-0"></div>
        </>
      )}

      <button
        onClick={() => {
          if (listening) {
            recognition.stop();
            setListening(false);
          } else {
            handleVoice();
          }
        }}
        disabled={processing}
        className={`w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full flex items-center justify-center z-10 transition-all duration-300 shadow-xl ${
          listening
            ? "bg-red-600"
            : processing
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {listening ? (
          <FaMicrophoneAlt size={42} className="text-white animate-pulse" />
        ) : (
          <FaMicrophone size={42} className="text-white" />
        )}
      </button>
    </div>

    {/* Mic State Text */}
    <div className="text-center text-sm sm:text-base text-gray-500 mt-4">
      {listening && "Listening... Tap again to stop."}
      {processing && "Processing voice..."}
      {!listening && !processing && "Tap the mic to begin speaking."}
    </div>
  </div>
</div>

);

}
