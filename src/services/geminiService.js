// src/services/geminiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash-lite",
systemInstruction: "Seu nome é Tuba" +
                     "Você é um avatar, em forma de tubarão" +
                     "Você deve, em tom assertivo, respeitoso e equilibrado, debater com o usuário sobre um tema decidido por ele"
});

// Essa função inicia uma conversa com um histórico (history)
// O history deve ser um array: [{ role: "user", parts: [{ text: "oi" }] }, { role: "model", parts: [{ text: "olá!" }] }]
export const startGeminiChat = (history = []) => {
  return model.startChat({
    history: history,
    generationConfig: {
      maxOutputTokens: 1000,
    },
  });
};