import React, { useEffect, useRef, useState } from "react";

const apiKey = "AIzaSyCOHvkgqyBzOebZjKAyx8oVYHzEwxxgQGE";

export default function HindiVoiceAgentForChildren() {
  const [childName, setChildName] = useState("");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition समर्थित नहीं है।");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("🎙️ बच्चे ने कहा:", transcript);
      await handleVoicePrompt(transcript);
    };

    recognition.onerror = (e) => {
      console.error("Speech error:", e);
      setListening(false);
    };

    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;

    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length) {
        setAvailableVoices(voices);
        const hindiVoice =
          voices.find((v) => v.lang.toLowerCase().includes("hi")) ||
          voices.find((v) => v.lang.toLowerCase().includes("en-in"));
        setSelectedVoice(hindiVoice);
      } else {
        setTimeout(loadVoices, 200);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const allStories = [
    {
      type: "short",
      text: "एक लोमड़ी ने अंगूर खाने की कोशिश की, लेकिन नहीं पहुंच सकी। उसने कहा, 'ये अंगूर खट्टे हैं।' सीख: जो चीज़ हमें नहीं मिलती, उसे बुरा कहना ठीक नहीं।"
    },
    {
      type: "short",
      text: "एक खरगोश और कछुआ रेस लगाते हैं। खरगोश तेज़ था पर सो गया, कछुआ लगातार चलता रहा और जीत गया। सीख: मेहनत से सफलता मिलती है।"
    },
    {
      type: "medium",
      text: "एक दिन एक शेर जंगल में सो रहा था। एक चूहा उसके ऊपर दौड़ गया। शेर ने उसे पकड़ लिया लेकिन उसे छोड़ दिया। कुछ दिनों बाद शिकारी ने शेर को जाल में फंसा लिया। वही चूहा आया और जाल काटकर शेर को बचा लिया। सीख: कोई भी छोटा नहीं होता, मदद कभी भी काम आ सकती है।"
    },
    {
      type: "medium",
      text: "एक बार दो दोस्त जंगल से जा रहे थे। उन्हें एक भालू मिल गया। एक पेड़ पर चढ़ गया और दूसरा ज़मीन पर लेट गया। भालू उसके पास आया, सूंघा और चला गया। दोस्त नीचे आया और पूछा, भालू ने क्या कहा? उसने कहा, 'असली दोस्त वही है जो संकट में साथ दे।' सीख: सच्चा दोस्त मुसीबत में पहचाना जाता है।"
    },
    {
      type: "long",
      text: "बहुत समय पहले की बात है, एक गाँव में एक गरीब लकड़हारा रहता था। वह रोज़ जंगल जाता और लकड़ियाँ काटकर उन्हें बेचता। एक दिन उसकी कुल्हाड़ी नदी में गिर गई। वह बहुत दुखी हुआ। तभी जल की देवी प्रकट हुईं और सोने की कुल्हाड़ी दिखाकर पूछा क्या यह तुम्हारी है? लकड़हारे ने कहा नहीं। फिर चांदी की कुल्हाड़ी दिखाई, उसने फिर से मना किया। अंत में उसकी लोहे की कुल्हाड़ी दिखाई, तब उसने कहा हां ये मेरी है। देवी उसकी ईमानदारी से खुश हुईं और तीनों कुल्हाड़ियाँ उसे दे दीं। सीख: ईमानदारी का हमेशा इनाम मिलता है।"
    },
    {
      type: "long",
      text: "एक समय की बात है, एक राजा को अपने राज्य के युवराज को उत्तराधिकारी बनाने से पहले उसकी परीक्षा लेनी थी। राजा ने उसे एक साल के लिए साधु बनाकर जंगल भेज दिया। वहां युवराज ने सत्य, परिश्रम और सेवा के गुण सीखे। जब वह लौटा, तो वह विनम्र और बुद्धिमान बन गया। राजा ने उसे राजगद्दी दी। सीख: सच्चे नेता में सेवा, संयम और समझदारी होनी चाहिए।"
    }
  ];

  const getRandomStory = () => {
    const index = Math.floor(Math.random() * allStories.length);
    return allStories[index].text;
  };

  const handleVoicePrompt = async (text) => {
    stopSpeaking();

    if (!childName.trim()) {
      const story = getRandomStory();
      speak(`चलिए एक कहानी सुनते हैं। ${story}`);
      return;
    }

    const prompt = `"${childName}" नामक बच्चे को हिंदी में एक दोस्ताना, सकारात्मक और सरल सलाह दें। सलाह में उसका नाम शामिल करें और उसे प्रेरित करें। बच्चे ने पूछा: "${text}"`;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );

      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "माफ़ कीजिए, कोई सलाह नहीं मिल सकी।";
      const personalizedReply = `${childName}, ${reply}`;
      console.log("👦 Personalized:", personalizedReply);
      speak(personalizedReply);
    } catch (error) {
      console.error("Gemini API error:", error);
      speak(`${childName}, माफ़ कीजिए, कुछ गड़बड़ हो गई है।`);
    }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const voiceToUse =
      selectedVoice ||
      voices.find((v) => v.lang === "hi-IN") ||
      voices.find((v) => v.lang === "en-IN");

    if (voiceToUse) {
      utterance.voice = voiceToUse;
      utterance.lang = voiceToUse.lang;
    } else {
      utterance.lang = "hi-IN";
    }

    utterance.onend = () => setSpeaking(false);
    setSpeaking(true);
    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setSpeaking(false);
  };

  const startListening = () => {
    if (recognitionRef.current && !listening && !speaking) {
      setListening(true);
      recognitionRef.current.start();
    }
  };

  const tellStoryManually = () => {
    const story = getRandomStory();
    speak(`चलिए एक कहानी सुनते हैं। ${story}`);
  };

  return (
    <div className="min-h-screen bg-yellow-100 text-black flex flex-col items-center justify-center px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">👧🧒 हिंदी बच्चों की आवाज़ सहायक</h1>

      <input
        type="text"
        value={childName}
        onChange={(e) => setChildName(e.target.value)}
        placeholder="बच्चे का नाम लिखें (वैकल्पिक)"
        className="mb-4 p-2 text-lg rounded border border-gray-400 text-black"
      />

      <div className="flex flex-col gap-4 items-center">
        <button
          onClick={startListening}
          disabled={listening || speaking}
          className="bg-green-600 px-6 py-3 text-xl rounded shadow hover:bg-green-700 transition"
        >
          🎤 {listening ? "सुन रहे हैं..." : "सवाल पूछें"}
        </button>

        <button
          onClick={stopSpeaking}
          className="bg-red-600 px-6 py-3 text-xl rounded shadow hover:bg-red-700 transition"
        >
          🔇 आवाज़ बंद करें
        </button>

        <button
          onClick={tellStoryManually}
          className="bg-blue-600 px-6 py-3 text-xl rounded shadow hover:bg-blue-700 transition"
        >
          📖 सुनाओ एक कहानी
        </button>

        <div className="mt-4">
          <label className="block text-sm mb-1">🔈 आवाज़ चुनें:</label>
          <select
            value={selectedVoice?.name || ""}
            onChange={(e) => {
              const voice = availableVoices.find((v) => v.name === e.target.value);
              setSelectedVoice(voice);
            }}
            className="text-black p-2 rounded"
          >
            {availableVoices.map((voice) => (
              <option key={voice.name} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
