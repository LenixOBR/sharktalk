import { GoogleGenerativeAI } from "@google/generative-ai";

// Obtenha a chave em: https://aistudio.google.com/
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Instrução do sistema (Personalidade do Tuba)
const SYSTEM_INSTRUCTION = 
  "Seu nome é Tuba. " +
  "Você é um avatar em forma de tubarão que participa de debates. " +
  "Você deve, em tom assertivo, respeitoso e equilibrado, debater com o usuário sobre o tema proposto. " +
  "Analise os argumentos apresentados, ofereça contra-argumentos fundamentados e mantenha o debate produtivo. " +
  "Quando for o último turno do debate, faça suas considerações finais de forma mais concisa e conclusiva. " +
  "Sempre mantenha o respeito e o profissionalismo, mesmo em discordâncias. " +
  "Não dê respostas muito longas, 1 parágrafo já basta. Use emojis de tubarão ocasionalmente. 🦈";

// Configuração do modelo para baixa latência (Flash)
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash", 
  systemInstruction: SYSTEM_INSTRUCTION,
});

export const sendMessageToGemini = async (message, history = []) => {
  try {
    // Converte o histórico do formato do app para o formato do Gemini
    // O Gemini usa "user" e "model" (ao invés de "assistant")
    const formattedHistory = history.map(msg => ({
      role: msg.role === "assistant" || msg.role === "model" ? "model" : "user",
      parts: [{ text: msg.parts[0].text }],
    }));

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Erro ao comunicar com Gemini:", error);
    throw error;
  }
};

export const generateFeedbackWithGemini = async (debateTopic, userName, chatHistory) => {
  try {
    // Compila o histórico como texto para o prompt de feedback
    const debateTranscript = chatHistory
      .map((msg) => {
        const speaker = msg.role === 'user' ? userName : 'Tuba';
        return `${speaker}: ${msg.parts[0].text}`;
      })
      .join('\n\n');

    const feedbackPrompt = `
      [SOLICITAÇÃO DE FEEDBACK FINAL]
      Você acabou de concluir um debate sobre "${debateTopic}" com ${userName}.
      
      Histórico do debate:
      ${debateTranscript}
      
      ---
      Forneça um feedback construtivo (máximo 1 parágrafo denso ou tópicos curtos) sobre o desempenho de ${userName}:
      1. Pontos Fortes
      2. Áreas de Melhoria
      3. Qualidade dos Argumentos
      
      Mantenha a personalidade de tubarão no feedback! 🦈
    `;

    // Para feedback pontual, usamos generateContent direto (sem chat session)
    const result = await model.generateContent(feedbackPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Erro ao gerar feedback com Gemini:", error);
    throw error;
  }
};