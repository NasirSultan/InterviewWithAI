import React, { useState, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FaMicrophone, FaMicrophoneAlt } from "react-icons/fa";

const GEMINI_API_KEY = import.meta.env.VITE_GREETING;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

export default function VoiceOverlayChat() {
  const [overlay, setOverlay] = useState(false);
  const [status, setStatus] = useState("idle");
  const [output, setOutput] = useState("");
  const [transcript, setTranscript] = useState("");
  const isListeningRef = useRef(false);

  const handleStartListening = () => {
    if (!recognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    setStatus("listening");
    setTranscript("");
    setOutput("");
    isListeningRef.current = true;

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.start();

    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;
      setTranscript(voiceText);
    };

    recognition.onerror = (e) => {
      console.error("Speech error:", e.error);
      setStatus("result");
      setOutput("Please speak clearly or hold the mic longer.");
    };
  };

  const handleStopListening = () => {
    if (recognition && isListeningRef.current) {
      isListeningRef.current = false;
      recognition.stop();

      if (transcript.trim()) {
        handleSendToGemini();
      } else {
        setOutput("Please speak clearly or hold the mic longer.");
        setStatus("result");
      }
    }
  };

  const handleSendToGemini = async () => {
    if (!transcript) return;

    setStatus("processing");
    setOutput("");

    try {
      const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
      const result = await model.generateContent(transcript);
      const response = await result.response;
      const geminiReply = (await response.text()).trim();

      setOutput(geminiReply);
      setStatus("result");

      // Voice output
      const utterance = new SpeechSynthesisUtterance(geminiReply);
      utterance.lang = "en-US";
      speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Gemini error:", err);
      setOutput("Failed to get a response.");
      setStatus("result");
    }
  };

  const handleOpen = () => {
    setOverlay(true);
    setStatus("idle");
    setOutput("");
    setTranscript("");
  };

  const handleOverlayClick = (e) => {
    if (e.target.id === "voice-overlay") {
      setOverlay(false);
      handleStopListening();
      setStatus("idle");
      speechSynthesis.cancel(); // Stop speaking if open overlay closes
    }
  };

  return (
    <>
      {/* Floating mic button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-20 right-4 bg-green-700 text-white p-4 rounded-full shadow-lg hover:bg-green-800 transition z-50"
      >
        <FaMicrophone size={24} />
      </button>

      {overlay && (
        <div
          id="voice-overlay"
          onClick={handleOverlayClick}
          className="fixed inset-0 bg-black/90 text-white z-50 flex flex-col items-center justify-center p-6 space-y-6"
        >
          {/* Listening UI */}
          {status !== "result" && (
            <>
              <p className="text-sm text-gray-300">Press & hold mic to talk</p>
              <button
                onMouseDown={handleStartListening}
                onTouchStart={handleStartListening}
                onMouseUp={handleStopListening}
                onTouchEnd={handleStopListening}
                className={`rounded-full w-32 h-32 text-4xl flex items-center justify-center border-4 transition relative ${
                  status === "listening"
                    ? "bg-red-600 border-red-400 text-white animate-pulse"
                    : "bg-green-600 border-green-400 text-white"
                }`}
              >
                {status === "listening" ? (
                  <FaMicrophoneAlt size={48} />
                ) : (
                  <FaMicrophone size={40} />
                )}
              </button>

              {status === "listening" && (
                <p className="mt-2 text-red-300 text-lg animate-pulse">Listening...</p>
              )}

              {status === "processing" && (
                <p className="mt-4 text-gray-400 text-center animate-pulse">Analyzing...</p>
              )}
            </>
          )}

          {/* Result UI */}
          {status === "result" && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="text-green-900 rounded-2xl p-6 max-w-xl w-full text-left"
            >
              <p className="whitespace-pre-line mb-6 text-white text-center leading-relaxed">
                {output}
              </p>

              <div className="flex justify-center">
                <button
                  onClick={() => {
                    speechSynthesis.cancel(); // ✅ Stop voice immediately
                    setStatus("idle");
                    setTranscript("");
                    setOutput("");
                  }}
                  className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-full shadow-md transition-all"
                >
                  Ask Again
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
