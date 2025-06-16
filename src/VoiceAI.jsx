import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const GeminiFlashAI = () => {
  const [input, setInput] = useState('');
  const [outputs, setOutputs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [typingText, setTypingText] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const typingTimeoutRef = useRef(null);
  const recognitionRef = useRef(null);

  const GEMINI_API_KEY = import.meta.env.VITE_GREETING;

  // Start voice input
  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Speech Recognition not supported in this browser.');
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech Recognition Error:', event.error);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  // Stop voice input
  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // Speak AI response
  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.onend = () => setIsSpeaking(false);
    speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Stop AI voice
  const stopVoice = () => {
    if (speechSynthesis && speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Clear output
  const handleClear = () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    stopVoice();
    setOutputs([]);
    setTypingText('');
    setCurrentPrompt('');
    setError('');
    setLoading(false);
  };

  // Submit prompt
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    stopVoice();
    setLoading(true);
    setError('');
    setTypingText('');
    setCurrentPrompt(input);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: input }] }],
          }),
        }
      );

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        setInput('');
        let i = 0;
        const speed = 20;
        const typeChar = () => {
          if (i < text.length) {
            setTypingText((prev) => prev + text.charAt(i));
            i++;
            typingTimeoutRef.current = setTimeout(typeChar, speed);
          } else {
            setOutputs((prev) => [...prev, { prompt: input, response: text }]);
            setTypingText('');
            setCurrentPrompt('');
            typingTimeoutRef.current = null;
            speakText(text);
          }
        };
        typeChar();
      } else {
        setError('No valid response from Server.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch from Server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      stopVoice(); // cleanup on unmount
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 font-sans">
      {!outputs.length && !typingText && (
        <h1 className="text-2xl md:text-5xl font-bold mb-4 text-gray-900">
          What can I help with?
        </h1>
      )}

      <div className={`w-full max-w-4xl flex flex-col ${outputs.length || typingText ? 'pb-32 space-y-8' : ''}`}>
        {(outputs.length > 0 || typingText) && (
          <div className="w-full h-[70vh] overflow-auto space-y-4 mb-8 py-8">
            {outputs.map((entry, index) => (
              <div key={index} className="w-full bg-white rounded-md shadow-md p-6 prose">
                <div className="text-right">
                  <p className="bg-purple-200 px-4 py-2 inline-block rounded-tl-3xl rounded-bl-lg rounded-br-lg font-semibold">
                    {entry.prompt}
                  </p>
                </div>
                <ReactMarkdown>{entry.response}</ReactMarkdown>
              </div>
            ))}

            {typingText && (
              <div className="w-full bg-white rounded-md shadow-md p-6 prose">
                <div className="text-right">
                  <p className="bg-purple-200 px-4 py-2 inline-block rounded-tl-3xl rounded-bl-lg rounded-br-lg font-semibold">
                    {currentPrompt}
                  </p>
                </div>
                <ReactMarkdown>{typingText}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={`flex flex-wrap gap-4 items-center justify-center px-4 ${outputs.length || typingText ? 'fixed left-0 w-full bg-gray-50 z-10 bottom-14 md:bottom-8' : ''}`}
        >
          <textarea
            className="flex-grow min-w-[250px] max-w-[600px] pt-3 px-2 text-base rounded-lg border shadow-sm resize-y min-h-[30px]"
            placeholder="Type your question here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-purple-700 text-white px-6 py-2 rounded-md hover:bg-purple-900 transition disabled:opacity-50"
          >
            {loading ? 'Thinking...' : 'Ask'}
          </button>

          {/* 🎙️ Voice Input Button */}
          <button
            type="button"
            onMouseDown={startVoiceInput}
            onMouseUp={stopVoiceInput}
            onTouchStart={startVoiceInput}
            onTouchEnd={stopVoiceInput}
            className={`px-3 py-2 rounded-full text-white font-bold transition ${isRecording ? 'bg-red-600' : 'bg-green-600 hover:bg-green-800'}`}
            title="Hold to speak"
          >
            🎙️
          </button>

          {/* 🔈 Voice Toggle */}
          {isSpeaking && (
            <button
              type="button"
              onClick={stopVoice}
              className="bg-yellow-500 text-white px-3 py-2 rounded-full font-bold hover:bg-yellow-600 transition"
              title="Stop Voice Output"
            >
              🔇
            </button>
          )}

          {(outputs.length > 0 || typingText) && (
            <button
              type="button"
              onClick={handleClear}
              className="fixed bottom-36 right-4 w-12 h-12 bg-purple-800 text-white rounded-full shadow-lg hover:bg-purple-900 flex items-center justify-center text-xl"
              title="Clear"
            >
              ←
            </button>
          )}
        </form>

        {error && <div className="mt-4 text-center text-red-600 font-medium">{error}</div>}
      </div>
    </div>
  );
};

export default GeminiFlashAI;
