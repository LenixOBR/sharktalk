// src/services/openRouterService.js
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

const openrouter = createOpenRouter({
  apiKey: API_KEY,
});

const SYSTEM_INSTRUCTION = 
  "Seu nome é Tuba. " +
  "Você é um avatar em forma de tubarão que participa de debates. " +
  "Você deve, em tom assertivo, respeitoso e equilibrado, debater com o usuário sobre o tema proposto. " +
  "Analise os argumentos apresentados, ofereça contra-argumentos fundamentados e mantenha o debate produtivo. " +
  "Quando for o último turno do debate, faça suas considerações finais de forma mais concisa e conclusiva. " +
  "Sempre mantenha o respeito e o profissionalismo, mesmo em discordâncias. " +
  "Não dê respostas muito longas, 1 parágrafo já basta.";

export const sendChatMessage = async (userMessage, history = []) => {
  try {
    // Converte o histórico para o formato do OpenRouter
    const messages = [
      { role: "system", content: SYSTEM_INSTRUCTION },
      ...history.map(msg => ({
        role: msg.role === "model" ? "assistant" : msg.role,
        content: msg.parts[0].text
      })),
      { role: "user", content: userMessage }
    ];

    const result = await generateText({
      model: openrouter("deepseek/deepseek-r1-0528:free"), 
      messages: messages,
      maxTokens: 1000,
    });

    return result.text;
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    throw error;
  }
};