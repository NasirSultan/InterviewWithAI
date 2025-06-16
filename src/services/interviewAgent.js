// src/services/interviewAgent.js
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGoogleGenerativeAI({
  apiKey: import.meta.env.VITE_GREETING,
  modelName: "gemini-1.5-flash",
});

const memory = new BufferMemory({
  memoryKey: "chat_history",
  returnMessages: true,
});

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a technical interviewer. Remember the conversation. Ask logical counter-questions and provide smart answers."
  ],
  ["human", "{input}"]
]);

const chain = new ConversationChain({
  memory,
  prompt,
  llm: model,
});

export const interviewChain = chain;
export const resetMemory = () => memory.clear();