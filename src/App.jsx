import { Routes, Route, Link } from 'react-router-dom';
import {
  Brain,
  Mic,
  BookText
} from 'lucide-react';

import OpenAi from './components/OpenAI';
import VoiceAiagent from './components/InterviewAI';
import Urduagent from './components/Urduagent';
import Documentation from './components/Documentation';

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="flex flex-col items-center justify-center min-h-screen  text-center px-4 py-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-4">
              Welcome to the AI Platform
            </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-6">
  Get started with tools for AI-powered interview prep and spoken English improvement through mock sessions, smart questions, and voice-based learning.
</p>


            {/* Section Subheadings */}

            {/* Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  w-full max-w-5xl">
              <Link to="/openai" className="h-full my-2">
                <button className="w-full h-28 sm:h-32 lg:h-36 px-4 py-4 bg-green-600 text-white text-base font-medium rounded-lg shadow hover:bg-green-700 hover:scale-105 transition-transform duration-300 cursor-pointer flex flex-col items-center justify-center gap-2">
                  <Brain className="w-8 h-8" />
                  OpenAI
                </button>
              </Link>

              <Link to="/voiceaiagent" className="h-full my-2">
                <button className="w-full h-28 sm:h-32 lg:h-36 px-4 py-4 bg-blue-600 text-white text-base font-medium rounded-lg shadow hover:bg-blue-700 hover:scale-105 transition-transform duration-300 cursor-pointer flex flex-col items-center justify-center gap-2">
                  <Mic className="w-8 h-8" />
                  AI Interview Agent
                </button>
              </Link>

              <Link to="/documentation" className="h-full my-2">
                <button className="w-full h-28 sm:h-32 lg:h-36 px-4 py-4 bg-purple-600 text-white text-base font-medium rounded-lg shadow hover:bg-purple-700 hover:scale-105 transition-transform duration-300 cursor-pointer flex flex-col items-center justify-center gap-2">
                  <BookText className="w-8 h-8" />
                  Documentation
                </button>
              </Link>
            </div>
          </div>
        }
      />

      <Route path="/openai" element={<OpenAi />} />
      <Route path="/voiceaiagent" element={<VoiceAiagent />} />
      <Route path="/urduagent" element={<Urduagent />} />
      <Route path="/documentation" element={<Documentation />} />
    </Routes>
  );
}
