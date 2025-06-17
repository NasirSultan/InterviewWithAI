import React from "react";
import { MessageSquareText, Mic, HelpCircle, Repeat } from "lucide-react";

export default function InterviewDocPanel() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-8 sm:py-10 md:py-12 text-gray-900">
      <h1 className="text-3xl sm:text-4xl font-bold mb-10 sm:mb-12">
        AI Interview Agent Documentation
      </h1>

      <div className="space-y-8">
        {/* Intro */}
        <section className="p-4 sm:p-6 bg-white rounded-2xl shadow-md border border-gray-200">
          <div className="flex items-start gap-3 sm:gap-4">
            <MessageSquareText className="text-indigo-600 mt-1 shrink-0" />
            <p className="text-base sm:text-lg leading-relaxed text-gray-700">
              The AI Interview Agent helps you prepare for technical interviews by entering any topic as a prompt. It generates a short explanation along with <strong>five interview questions and answers</strong> to help you understand key concepts quickly and clearly.
            </p>
          </div>
        </section>

        {/* More Questions */}
        <section className="p-4 sm:p-6 bg-white rounded-2xl shadow-md border border-gray-200">
          <div className="flex items-start gap-3 sm:gap-4">
            <Repeat className="text-indigo-600 mt-1 shrink-0" />
            <p className="text-base sm:text-lg leading-relaxed text-gray-700">
              Want to go deeper? Just type <code className="bg-indigo-100 text-indigo-700 px-1 py-0.5 rounded">more</code> and get five fresh questions. You can repeat this until you feel confident in the topic.
            </p>
          </div>
        </section>

        {/* Counter Questions */}
        <section className="p-4 sm:p-6 bg-white rounded-2xl shadow-md border border-gray-200">
          <div className="flex items-start gap-3 sm:gap-4">
            <HelpCircle className="text-indigo-600 mt-1 shrink-0" />
            <p className="text-base sm:text-lg leading-relaxed text-gray-700">
              Ask follow-up questions about any part of the explanation—like “What does this mean?” or “Can you simplify it?” The AI will respond with clearer or more detailed answers to support your learning.
            </p>
          </div>
        </section>

        {/* Voice Playback */}
        <section className="p-4 sm:p-6 bg-white rounded-2xl shadow-md border border-gray-200">
          <div className="flex items-start gap-3 sm:gap-4">
            <Mic className="text-indigo-600 mt-1 shrink-0" />
            <p className="text-base sm:text-lg leading-relaxed text-gray-700">
              Enable <strong>voice playback</strong> to hear answers aloud using built-in speech synthesis—great for improving spoken English and pronunciation. You can also type any custom sentence to hear it. Even better, <strong>select any text</strong> on screen and it will automatically be spoken aloud.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
