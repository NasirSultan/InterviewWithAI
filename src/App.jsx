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
  const [status, setStatus] = useState("idle"); // idle | listening | processing | result
  const [output, setOutput] = useState("");
  const [transcript, setTranscript] = useState("");
  const isListeningRef = useRef(false);

  const startListening = () => {
    if (!recognition) {
      alert("Speech Recognition not supported.");
      return;
    }

    setStatus("listening");
    setTranscript("");
    setOutput("");
    isListeningRef.current = true;

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = true;
    recognition.start();

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1][0].transcript;
      setTranscript((prev) => prev + " " + result);
    };

    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e.error);
      stopListening();
      setStatus("idle");
    };
  };

  const stopListening = () => {
    if (recognition && isListeningRef.current) {
      recognition.stop();
      isListeningRef.current = false;
    }
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  const sendToGemini = async () => {
    stopListening();
    if (!transcript.trim()) {
      setOutput("No voice detected.");
      setStatus("result");
      return;
    }

    try {
      setStatus("processing");
      const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
      const result = await model.generateContent(transcript.trim());
      const response = await result.response;
      const text = (await response.text()).trim();
      setOutput(text);
      speakText(text);
      setStatus("result");
    } catch (err) {
      console.error("Gemini error:", err);
      setOutput("Something went wrong.");
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
      stopListening();
      setOverlay(false);
      setStatus("idle");
    }
  };

  return (
    <>
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
          {/* Mic and Listen Button Always Shown */}
          {(status === "idle" || status === "listening") && (
            <>
              <p className="text-sm text-gray-300">
                Click mic to start speaking
              </p>
              <button
                onClick={startListening}
                className={`rounded-full w-32 h-32 text-4xl flex items-center justify-center border-4 ${
                  status === "listening"
                    ? "bg-red-600 border-red-400 animate-pulse"
                    : "bg-green-600 border-green-400"
                } text-white`}
              >
                {status === "listening" ? (
                  <FaMicrophoneAlt size={48} />
                ) : (
                  <FaMicrophone size={40} />
                )}
              </button>
            </>
          )}

          {/* Transcript + Send Button While Listening */}
          {status === "listening" && (
            <>
              <div className="text-center max-w-xl bg-green-100 text-green-900 p-4 rounded-lg text-sm whitespace-pre-wrap">
                {transcript || "Listening..."}
              </div>
              <button
                onClick={sendToGemini}
                className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-full shadow-md transition"
              >
                Send
              </button>
            </>
          )}

          {/* Loading UI */}
          {status === "processing" && (
            <div className="flex flex-col items-center space-y-4">
              <ImSpinner8 className="animate-spin text-green-400" size={50} />
              <p className="text-green-200 text-lg">Thinking...</p>
            </div>
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
                    setStatus("idle");
                    setTranscript("");
                    setOutput("");
                  }}
                  className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-full shadow-md"
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
