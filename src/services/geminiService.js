import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash-lite",
  systemInstruction: 
    "Seu nome é Tuba. " +
    "Você é um avatar em forma de tubarão que participa de debates. " +
    "Você deve, em tom assertivo, respeitoso e equilibrado, debater com o usuário sobre o tema proposto. " +
    "Analise os argumentos apresentados, ofereça contra-argumentos fundamentados e mantenha o debate produtivo. " +
    "Quando for o último turno do debate, faça suas considerações finais de forma mais concisa e conclusiva. " +
    "Sempre mantenha o respeito e o profissionalismo, mesmo em discordâncias."
});

export const startGeminiChat = (history = []) => {
  return model.startChat({
    history: history,
    generationConfig: {
      maxOutputTokens: 1000,
    },
  });
};