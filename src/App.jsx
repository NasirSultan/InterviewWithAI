import React, { useState, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FaMicrophone, FaMicrophoneAlt } from "react-icons/fa";
import { ImSpinner8 } from "react-icons/im";

const GEMINI_API_KEY = import.meta.env.VITE_GREETING;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

export default function VoiceOverlayChat() {
  const [overlay, setOverlay] = useState(false);
  const [status, setStatus] = useState("idle");
  const [output, setOutput] = useState("");
  const isListeningRef = useRef(false);
  const transcriptRef = useRef("");

  const handleStartListening = () => {
    if (!recognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    setStatus("listening");
    setOutput("");
    transcriptRef.current = "";
    isListeningRef.current = true;

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      transcriptRef.current = transcript;
    };

    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e.error);
      setStatus("idle");
    };
  };

  const handleStopListening = () => {
    if (recognition && isListeningRef.current) {
      isListeningRef.current = false;
      recognition.stop();

      if (transcriptRef.current) {
        handleQueryGemini(transcriptRef.current);
      } else {
        setOutput("Please speak clearly or hold the button longer.");
        setStatus("result");
      }
    }
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  const handleQueryGemini = async (text) => {
    try {
      setStatus("processing");
      const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
      const result = await model.generateContent(text);
      const response = await result.response;
      const geminiReply = (await response.text()).trim();
      setOutput(geminiReply);
      speakText(geminiReply); // 👈 speak response
      setStatus("result");
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
          {/* Status: Listening */}
          {status === "listening" && (
            <>
              <p className="text-sm text-gray-300">Press & hold mic to talk</p>
              <button
                onMouseDown={handleStartListening}
                onTouchStart={handleStartListening}
                onMouseUp={handleStopListening}
                onTouchEnd={handleStopListening}
                className="rounded-full w-32 h-32 text-4xl flex items-center justify-center border-4 bg-red-600 border-red-400 text-white animate-pulse"
              >
                <FaMicrophoneAlt size={48} />
              </button>
              <p className="mt-2 text-red-300 text-lg animate-pulse">Listening...</p>
            </>
          )}

          {/* Status: Idle */}
          {status === "idle" && (
            <>
              <p className="text-sm text-gray-300">Press & hold mic to talk</p>
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

          {/* Status: Processing */}
          {status === "processing" && (
            <div className="flex flex-col items-center space-y-4">
              <ImSpinner8 className="animate-spin text-green-400" size={50} />
              <p className="text-green-200 text-lg">Thinking...</p>
            </div>
          )}

          {/* Status: Result */}
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
                    setStatus("idle");
                    setOutput("");
                  }}
                  className="bg-green-700 cursor-pointer hover:bg-green-800 text-white px-6 py-2 rounded-full shadow-md transition-all"
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
