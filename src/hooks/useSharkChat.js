import { useState } from 'react';
import { startGeminiChat } from '../services/geminiService';

export const useSharkChat = () => {
  const [sharkMessage, setSharkMessage] = useState("Olá! Sou um tubarão! 🦈");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [remainingRounds, setRemainingRounds] = useState(null);

  const initializeChat = (setupData) => {
    setRemainingRounds(setupData.rounds);
    // Mensagem inicial personalizada
    setSharkMessage(
      `Olá, ${setupData.userName}! Sou Tuba, seu oponente neste debate sobre "${setupData.debateTopic}". ` +
      `Temos ${setupData.rounds} turnos pela frente. Apresente seu primeiro argumento! 🦈`
    );
  };

  const sendMessage = async (textoParaEnviar, setupData) => {
    // Verifica se ainda há turnos
    if (remainingRounds <= 0) {
      setSharkMessage("O debate acabou! Obrigado pela participação! 🦈");
      return false;
    }

    setLoading(true);
    try {
      // Adiciona contexto ao prompt
      const contextualizedMessage = `
[Contexto do debate]
- Tema: ${setupData.debateTopic}
- Debatedor: ${setupData.userName}
- Turno atual: ${setupData.rounds - remainingRounds + 1} de ${setupData.rounds}
- Turnos restantes: ${remainingRounds}

[Mensagem do usuário]
${textoParaEnviar}

${remainingRounds === 1 ? '[ATENÇÃO: Este é o último turno! Faça suas considerações finais.]' : ''}
      `.trim();

      const chat = startGeminiChat(chatHistory);
      const result = await chat.sendMessage(contextualizedMessage);
      const responseText = result.response.text();

      // Decrementa os turnos
      const newRemainingRounds = remainingRounds - 1;
      setRemainingRounds(newRemainingRounds);

      // Adiciona mensagem de encerramento se for o último turno
      let finalMessage = responseText;
      if (newRemainingRounds === 0) {
        finalMessage += "\n\n---\n🦈 **Debate encerrado!** Foi um prazer debater com você. Espero que tenha sido produtivo!";
      }

      setSharkMessage(finalMessage);
      
      setChatHistory([
        ...chatHistory,
        { role: "user", parts: [{ text: contextualizedMessage }] },
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

  return { sharkMessage, loading, sendMessage, remainingRounds, initializeChat };
};