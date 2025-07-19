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
  const [status, setStatus] = useState("idle"); // idle, listening, processing, result
  const [output, setOutput] = useState("");
  const [transcript, setTranscript] = useState("");

  const isListeningRef = useRef(false);

  const handleStartListening = () => {
    if (!recognition) {
      alert("Speech Recognition not supported.");
      return;
    }

    setTranscript("");
    setStatus("listening");
    isListeningRef.current = true;

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.start();

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
    };

    recognition.onerror = (e) => {
      console.error("Speech error:", e.error);
      setTranscript("Please speak clearly or hold the mic longer.");
      setStatus("result");
    };
  };

  const handleStopListening = () => {
    if (recognition && isListeningRef.current) {
      recognition.stop();
      isListeningRef.current = false;

      if (transcript.trim()) {
        handleSendToGemini(transcript);
      } else {
        setTranscript("Please speak clearly or hold the mic longer.");
        setStatus("result");
      }
    }
  };

  const handleSendToGemini = async (text) => {
    setStatus("processing");
    setOutput("");

    try {
      const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
      const result = await model.generateContent(text);
      const response = await result.response;
      const reply = (await response.text()).trim();

      setOutput(reply);
      setStatus("result");

      const utterance = new SpeechSynthesisUtterance(reply);
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
    setTranscript("");
    setOutput("");
  };

  const handleOverlayClick = (e) => {
    if (e.target.id === "voice-overlay") {
      setOverlay(false);
      handleStopListening();
      setStatus("idle");
    }
  };

  return (
    <>
      {/* Floating Button */}
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
          {/* Status: Listening */}
          {status === "listening" && (
            <>
              <p className="text-sm text-gray-400">Listening... Speak now</p>
              <button
                onMouseDown={handleStartListening}
                onTouchStart={handleStartListening}
                onMouseUp={handleStopListening}
                onTouchEnd={handleStopListening}
                className="rounded-full w-32 h-32 text-4xl flex items-center justify-center border-4 bg-red-600 border-red-400 text-white mic-pulse"
              >
                <FaMicrophoneAlt size={48} />
              </button>
              <p className="text-red-300 animate-pulse">Listening...</p>
            </>
          )}

          {/* Status: Processing */}
          {status === "processing" && (
            <p className="text-center text-gray-400 animate-pulse text-lg">
              Analyzing...
            </p>
          )}

          {/* Status: Result */}
          {status === "result" && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="text-green-900 rounded-2xl p-6 max-w-xl w-full text-left"
            >
              <p className="whitespace-pre-line mb-6 text-white text-center leading-relaxed">
                {output || transcript}
              </p>

              <div className="flex justify-center">
                <button
                  onClick={() => {
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

          {/* Status: Idle */}
          {status === "idle" && (
            <>
              <p className="text-sm text-gray-400">Press & hold mic to talk</p>
              <button
                onMouseDown={handleStartListening}
                onTouchStart={handleStartListening}
                onMouseUp={handleStopListening}
                onTouchEnd={handleStopListening}
                className="rounded-full w-32 h-32 text-4xl flex items-center justify-center border-4 bg-green-600 border-green-400 text-white"
              >
                <FaMicrophone size={40} />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
