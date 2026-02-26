
import { GoogleGenAI } from "@google/genai";
import { DOCS_DATA } from "../apiDocs.ts";
import { Language } from "../types";

// Initialize Gemini Client safely
// process.env.API_KEY is replaced by Vite at build time via define
const apiKey = process.env.API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  try {
    ai = new GoogleGenAI({ apiKey: apiKey });
  } catch (e) {
    console.error("Failed to initialize GoogleGenAI client:", e);
  }
} else {
  console.warn("Gemini API Key is missing. AI features will be disabled.");
}

// Construct the system instruction based on the app's documentation
const getSystemInstruction = (lang: Language) => {
  const docs = JSON.stringify(DOCS_DATA[lang]);
  return `You are VeriBot, the intelligent technical support assistant for Verilocale, an AI E-KYC platform for Southeast Asia. 
  
  Your goal is to help developers and business users understand the platform, pricing, and API integration.
  
  Use the following documentation context to answer questions strictly. If the answer is not in the context, politely say you don't know and suggest contacting sales.
  
  Documentation Context:
  ${docs}
  
  Tone: Professional, helpful, and concise. 
  Format: Use Markdown for code blocks and lists.
  Language: Answer in the same language as the user's question, defaulting to ${lang === 'zh' ? 'Chinese' : lang === 'th' ? 'Thai' : 'English'}.
  `;
};

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export const sendMessageToGemini = async (
  message: string, 
  history: ChatMessage[], 
  lang: Language
) => {
  if (!ai) {
    return "AI service is currently unavailable (Missing API Key).";
  }

  try {
    const model = 'gemini-2.5-flash';
    
    // Convert history to API format
    // We only take the last 10 messages to save context window
    const historyContext = history.slice(-10).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const chat = ai.chats.create({
      model: model,
      history: historyContext,
      config: {
        systemInstruction: getSystemInstruction(lang),
        temperature: 0.7,
      }
    });

    const response = await chat.sendMessage({ message });
    return response.text;

  } catch (error) {
    console.error("AI Error:", error);
    return "I'm having trouble connecting to the knowledge base right now. Please try again later.";
  }
};
