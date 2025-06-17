import { Routes, Route, Link } from 'react-router-dom';
import OpenAi from './components/OpenAI';
import VoiceAiagent from './components/InterviewAI';
import Urduagent from './components/Urduagent';
import Documentation from './components/Documentation';

function BackButton() {
  return (
    <div className="mt-4 text-center">
      <Link to="/">
        <button className="px-5 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
          ⬅ Back to Home
        </button>
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4 py-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              Welcome to the AI Platform
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mb-8">
              Choose a tool below to get started
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <Link to="/openai" className="w-full sm:w-auto">
                <button className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                  OpenAI Assistant
                </button>
              </Link>
              <Link to="/voiceaiagent" className="w-full sm:w-auto">
                <button className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                  AI Agent
                </button>
              </Link>
              <Link to="/Documentation" className="w-full sm:w-auto">
                <button className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700">
                 Documentation
                </button>
              </Link>
            </div>
          </div>
        }
      />

      <Route
        path="/openai"
        element={
          <>
            <OpenAi />
            <BackButton />
          </>
        }
      />
      <Route
        path="/voiceaiagent"
        element={
          <>
            <VoiceAiagent />
            <BackButton />
          </>
        }
      />
      <Route
        path="/urduagent"
        element={
          <>
            <Urduagent />
            <BackButton />
          </>
        }
      />
      <Route
        path="/documentation"
        element={
          <>
            <Documentation />
            <BackButton />
          </>
        }
      />
    </Routes>
  );
}
