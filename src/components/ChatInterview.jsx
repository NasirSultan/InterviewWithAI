import React, { useState } from "react";

const apiKey = import.meta.env.VITE_GREETING;

export default function ShortInterviewQA() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = (text) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.cancel(); // Cancel any ongoing speech

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
      if (!data) return;
      const fullText = `${data.title}\n\n${data.explanation}\n\n${data.questions
        .map((q, i) => `Question ${i + 1}: ${q.q}\nAnswer: ${q.a}`)
        .join("\n\n")}`;
      speak(fullText);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setData(null);
    setIsSpeaking(false);
    speechSynthesis.cancel();

    const prompt = `You are an expert technical interviewer.
Generate a short JSON object for the topic: "${topic}" with:
- title: (max 1 line)
- explanation: (2–3 lines)
- questions: an array of 5 objects each like { "q": "question", "a": "short answer in 3–5 lines or 10 lines of code" }
Return only pure JSON.`;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const result = await res.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      const cleanText = text.replace(/```json|```/g, "").trim();
      const json = JSON.parse(cleanText);

      if (!json.questions || !Array.isArray(json.questions)) {
        throw new Error("Invalid response structure");
      }

      setData(json);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to load or parse Gemini response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="max-w-2xl mx-auto p-6 min-h-screen"
      onMouseUp={() => {
        const selectedText = window.getSelection().toString().trim();
        if (selectedText.length > 5) {
          speak(selectedText);
        }
      }}
    >
      <h1 className="text-2xl font-bold mb-6 text-center">
        🎯 AI Interview Questions
      </h1>

      {!data && (
        <div className="flex gap-2 mb-6">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter topic (e.g. React, Node.js)"
            className="w-full border p-2 rounded"
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !topic.trim()}
            className="bg-purple-600 text-white px-4 rounded"
          >
            {loading ? "Loading..." : "Generate"}
          </button>
        </div>
      )}

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {data && (
        <div className="bg-gray-50 p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-2">{data.title}</h2>
          <p className="text-gray-700 mb-4">{data.explanation}</p>

          <ol className="space-y-4">
            {data.questions.map((qa, i) => (
              <li key={i}>
                <p className="font-semibold">Q{i + 1}: {qa.q}</p>
                <pre className="bg-white text-sm p-2 border mt-1 whitespace-pre-wrap">
                  {qa.a}
                </pre>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex flex-wrap gap-2 justify-between">
            <button
              onClick={() => {
                setData(null);
                setTopic("");
                setIsSpeaking(false);
                speechSynthesis.cancel();
              }}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              ⬅ Back
            </button>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleVoiceToggle}
                className={`${
                  isSpeaking ? "bg-red-600" : "bg-blue-600"
                } text-white px-4 py-2 rounded`}
              >
                {isSpeaking ? "🔇 Stop Voice" : "🔊 Speak All"}
              </button>
              <button
                onClick={() => {
                  const textToCopy = `${data.title}\n\n${data.explanation}\n\n${data.questions
                    .map((q, i) => `Q${i + 1}: ${q.q}\n${q.a}`)
                    .join("\n\n")}`;
                  navigator.clipboard.writeText(textToCopy);
                  alert("✅ Copied to clipboard!");
                }}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                📋 Copy All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
