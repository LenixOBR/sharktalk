import { useState } from 'react';
import { startGeminiChat } from '../services/geminiService';

export const useSharkChat = () => {
  const [sharkMessage, setSharkMessage] = useState("Olá! Sou um tubarão! 🦈");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (textoParaEnviar) => {
    setLoading(true);
    try {
      const chat = startGeminiChat(chatHistory);
      const result = await chat.sendMessage(textoParaEnviar);
      const responseText = result.response.text();
      
      setSharkMessage(responseText);
      setChatHistory([
        ...chatHistory,
        { role: "user", parts: [{ text: textoParaEnviar }] },
        { role: "model", parts: [{ text: responseText }] },
      ]);
      
      return true;
    } catch (error) {
      console.error("Erro ao conversar:", error);
      setSharkMessage("Tive uma cãibra na barbatana... tente de novo! 🦈");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { sharkMessage, loading, sendMessage };
};