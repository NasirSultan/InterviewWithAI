import React from "react";

export default function InterviewDocPanel() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 text-gray-800">
      <h1 className="text-4xl font-bold mb-8 border-b pb-2">Interview Assistant Documentation</h1>

      {/* Overview */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-2">Overview</h2>
       <p className="text-gray-700">
  The Interview Assistant helps users practice interview preparation by generating short explanations and multiple relevant questions based on any topic. It provides clear, structured answers and supports follow-up prompts to explore a topic in more depth. Users can listen to the answers, copy responses, or reset the session for a new topic.
</p>

      </section>

      {/* Features */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-2">Features</h2>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>Generates 5 concise technical questions with answers based on a selected topic</li>
          <li>Supports follow-up generation using the word <code>more</code></li>
          <li>Text-to-speech support with optional voice selection</li>
          <li>Auto-formats code and explanations using markdown and syntax highlighting</li>
          <li>Interactive UI: reset, copy, mute, speak controls</li>
          <li>Fully styled with TailwindCSS for modern, responsive design</li>
        </ul>
      </section>

      {/* How to Use */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-2">How to Use</h2>
        <div className="space-y-4 text-gray-700">
          <p><strong>1.</strong> Enter a topic (e.g., React, JavaScript, REST APIs) in the input field.</p>
          <p><strong>2.</strong> Click the generate button to view a brief explanation and 5 related questions with answers.</p>
          <p><strong>3.</strong> To request more unique questions, type <code>more</code> in the follow-up field.</p>
          <p><strong>4.</strong> Use the speaker icon to play the answer using voice synthesis (optional voice selection included).</p>
          <p><strong>5.</strong> Use the copy icon to save results, or the reset button to clear the screen.</p>
        </div>
      </section>

      {/* Limitations */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-2">Limitations</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>Only 5 questions are generated per call</li>
          <li>Requires manual typing of <code>more</code> for additional questions</li>
          <li>Voice support depends on browser's SpeechSynthesis API</li>
          <li>No backend: data is not saved or stored</li>
          <li>Does not support user authentication or export to file formats like PDF</li>
        </ul>
      </section>
    </div>
  );
}
