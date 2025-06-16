import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { RotateCcw, Volume2, VolumeX, ClipboardCopy } from "lucide-react";

const apiKey = import.meta.env.VITE_GREETING;

export default function ShortInterviewQA() {
  const [topic, setTopic] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [historyChunks, setHistoryChunks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState("");
  const [typingAnswer, setTypingAnswer] = useState("");
  const typingIndexRef = useRef(0);
  const typingTimeoutRef = useRef(null);

  const speak = (text) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.cancel();
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    speechSynthesis.speak(utterance);
  };

  const handleVoiceToggle = () => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const fullText = historyChunks
        .map((chunk) =>
          `${chunk.title ? chunk.title + "\n" : ""}${chunk.explanation || ""}\n${
            chunk.questions
              ? chunk.questions.map((q) => `${q.q}\n${q.a}`).join("\n\n")
              : ""
          }`
        )
        .join("\n\n");
      speak(fullText);
    }
  };

  const fetchFromGemini = async (prompt) => {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    const result = await res.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanText = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanText);
  };

  const getAllPreviousQuestions = () =>
    historyChunks
      .flatMap((chunk) => (chunk.questions ? chunk.questions.map((q) => q.q) : []))
      .filter(Boolean);

  const handleSubmit = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    speechSynthesis.cancel();

    try {
const prompt = `You are a skilled technical interviewer and teacher.

Please generate a short JSON object based on the topic: "${topic}".

The JSON should include:

- "title": A short, one-line title.
- "explanation": A clear, simple explanation (2–3 short lines).
- "questions": An array of 5 question objects. Each object should be:
  {
    "q": "A clear and direct question.",
    "a": "A simple and clear answer. Use plain English. If explaining code, use a 10-line code block. If the answer has steps or tips, use bullet points with hyphens (-) and highlight headings like this: **Heading**"
  }

`;


      const json = await fetchFromGemini(prompt);
      if (!json.questions || !Array.isArray(json.questions)) throw new Error("Invalid response");

      setChatHistory([{ prompt: topic, response: JSON.stringify(json) }]);
      setHistoryChunks([{ prompt: topic, title: json.title, explanation: json.explanation, questions: [] }]);

      let fullText = json.questions.map((q) => `**${q.q}**\n${q.a}`).join("\n\n");
      typingIndexRef.current = 0;
      setTypingAnswer("");

      const typeChar = () => {
        if (typingIndexRef.current < fullText.length) {
          setTypingAnswer((prev) => prev + fullText.charAt(typingIndexRef.current));
          typingIndexRef.current++;
          typingTimeoutRef.current = setTimeout(typeChar, 15);
        } else {
          setHistoryChunks((prev) => {
            const last = prev[prev.length - 1];
            return [...prev.slice(0, -1), { ...last, questions: json.questions }];
          });
          setTypingAnswer("");
        }
      };
      typeChar();
    } catch (err) {
      console.error(err);
      setError("❌ Failed to load or parse response.");
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUp = async () => {
    if (!followUp.trim()) return;
    const trimmedPrompt = followUp.trim().toLowerCase();
    setLoading(true);
    setError("");
    speechSynthesis.cancel();

    try {
      let json;
      if (trimmedPrompt === "more") {
        const existingQuestions = getAllPreviousQuestions();
        const prompt = `Generate 5 more unique interview questions on "${topic}". \nAvoid these questions:\n${existingQuestions.map((q) => `- ${q}`).join("\n")}\nReturn pure JSON: { "questions": [ { "q": "...", "a": "..." }, ... ] }`;

        json = await fetchFromGemini(prompt);
        if (!json.questions || !Array.isArray(json.questions)) throw new Error("Invalid questions");

        setHistoryChunks((prev) => [...prev, { prompt: followUp, questions: [] }]);

        let fullText = json.questions.map((q) => `**${q.q}**\n${q.a}`).join("\n\n");
        typingIndexRef.current = 0;
        setTypingAnswer("");

        const typeChar = () => {
          if (typingIndexRef.current < fullText.length) {
            setTypingAnswer((prev) => prev + fullText.charAt(typingIndexRef.current));
            typingIndexRef.current++;
            typingTimeoutRef.current = setTimeout(typeChar, 15);
          } else {
            setHistoryChunks((prev) => {
              const last = prev[prev.length - 1];
              return [...prev.slice(0, -1), { ...last, questions: json.questions }];
            });
            setTypingAnswer("");
          }
        };
        typeChar();
      } else {
        const past = chatHistory
          .map((entry, idx) => `Prompt ${idx + 1}: ${entry.prompt}\nAnswer: ${entry.response}`)
          .join("\n\n");

        const prompt = `${past ? past + "\n\n" : ""}\nUser asked: "${followUp}". Provide a short explanation (2-3 lines).\nReturn JSON only: { "explanation": "..." }`;

        json = await fetchFromGemini(prompt);
        if (!json.explanation) throw new Error("Missing explanation");

        setHistoryChunks((prev) => [...prev, { prompt: followUp, explanation: json.explanation }]);
      }

      setFollowUp("");
    } catch (err) {
      console.error(err);
      setError("❌ Follow-up failed.");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setTopic("");
    setFollowUp("");
    setChatHistory([]);
    setHistoryChunks([]);
    setTypingAnswer("");
    setIsSpeaking(false);
    setError("");
    speechSynthesis.cancel();
  };

  return (
    <div className="w-[70%] mx-auto p-6 min-h-screen" onMouseUp={() => {
      const selectedText = window.getSelection().toString().trim();
      if (selectedText.length > 5) speak(selectedText);
    }}>
      {!historyChunks.length && (
        <div className="flex flex-col items-center justify-center min-h-screen w-full px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">AI Interview Assistant</h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-4xl">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter topic (e.g., React, Node.js)"
              className="flex-1 p-4 rounded shadow-sm outline-none bg-gray-100 focus:bg-white w-full"
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !topic.trim()}
              className="bg-purple-600 text-white px-6 py-3 rounded shadow hover:bg-purple-700 w-full sm:w-auto"
            >
              {loading ? "Loading..." : "Generate"}
            </button>
          </div>
          {error && <div className="text-red-600 mt-4 text-sm">{error}</div>}
        </div>
      )}

      {historyChunks.length > 0 && (
        <>
          <div className="bg-white p-6 mb-12 rounded-xl shadow space-y-8 leading-relaxed text-justify prose prose-indigo">
            {historyChunks.map((chunk, idx) => (
              <div key={idx} className="pb-6 last:pb-0">
                {chunk.prompt && (
                  <p className="text-sm text-gray-500 italic mb-2">Prompt: {chunk.prompt}</p>
                )}
                {chunk.title && (
                  <h2 className="text-2xl font-bold text-indigo-700 mb-4">{chunk.title}</h2>
                )}
                {chunk.explanation && (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 text-gray-800">{children}</p>,
                      strong: ({ children }) => <strong className="text-indigo-700">{children}</strong>,
                    }}
                  >
                    {chunk.explanation}
                  </ReactMarkdown>
                )}
                {chunk.questions && chunk.questions.length > 0 ? (
                  <ul className="space-y-4 mt-4">
                    {chunk.questions.map((qa, i) => (
                      <li key={i} className="border border-gray-200 rounded p-4 bg-gray-50">
                        <p className="font-semibold text-gray-800 mb-2">{qa.q}</p>
                        <ReactMarkdown
                          components={{
                            code({ inline, children }) {
                              return inline ? (
                                <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-red-600">
                                  {children}
                                </code>
                              ) : (
                                <pre className="bg-gray-900 text-white p-4 rounded overflow-x-auto text-sm my-2">
                                  <code className="font-mono whitespace-pre-wrap">{children}</code>
                                </pre>
                              );
                            },
                          }}
                        >
                          {qa.a}
                        </ReactMarkdown>
                      </li>
                    ))}
                  </ul>
                ) : idx === historyChunks.length - 1 && typingAnswer && (
                  <div className="mt-4 bg-gray-100 p-4 rounded whitespace-pre-wrap text-sm text-gray-800">
                    <ReactMarkdown>{typingAnswer}</ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-[66%] bg-white p-4 rounded-xl z-40 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex flex-grow gap-5">
                <input
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  placeholder='Ask follow-up (e.g. "What is useEffect?" or "more")'
                  className="w-full p-3 rounded bg-gray-100 focus:bg-white outline-none"
                />
                <button
                  onClick={handleFollowUp}
                  disabled={loading || !followUp.trim()}
                  className="bg-indigo-600 text-white px-5 py-2 rounded shadow hover:bg-indigo-700"
                >
                  {loading ? "Thinking..." : "Ask"}
                </button>
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
            </div>
          </div>

          <div className="fixed bottom-4 right-4 flex flex-col gap-3 items-end z-50">
            <button
              onClick={resetAll}
              title="Reset Memory"
              className="bg-gray-300 hover:bg-gray-400 text-black w-12 h-12 flex items-center justify-center rounded-full shadow"
            >
              <RotateCcw />
            </button>

            <button
              onClick={handleVoiceToggle}
              title={isSpeaking ? "Stop Voice" : "Speak All"}
              className={`${isSpeaking ? "bg-red-600" : "bg-blue-600"} text-white w-12 h-12 flex items-center justify-center rounded-full shadow hover:opacity-90`}
            >
              {isSpeaking ? <VolumeX /> : <Volume2 />}
            </button>

            <button
              onClick={() => {
                const textToCopy = historyChunks
                  .map(
                    (chunk) =>
                      `${chunk.title ? chunk.title + "\n" : ""}${chunk.explanation || ""}\n${
                        chunk.questions
                          ? chunk.questions.map((q) => `${q.q}\n${q.a}`).join("\n\n")
                          : ""
                      }`
                  )
                  .join("\n\n");
                navigator.clipboard.writeText(textToCopy);
                alert("Copied to clipboard!");
              }}
              title="Copy All"
              className="bg-green-600 hover:bg-green-700 text-white w-12 h-12 flex items-center justify-center rounded-full shadow"
            >
              <ClipboardCopy />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
