import { useState } from 'react';
import { sendMessageToOllama, generateFeedbackWithOllama } from '../services/ollamaService';

export const useSharkChat = () => {
  const [sharkMessage, setSharkMessage] = useState("Olá! Sou um tubarão! 🦈");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [remainingRounds, setRemainingRounds] = useState(null);
  const [debateEnded, setDebateEnded] = useState(false);

  const initializeChat = (setupData) => {
    setRemainingRounds(setupData.rounds);
    setDebateEnded(false);
    setChatHistory([]); // Limpa o histórico
    // Mensagem inicial personalizada
    setSharkMessage(
      `Olá, ${setupData.userName}! Sou Tuba, seu oponente neste debate sobre "${setupData.debateTopic}". ` +
      `Temos ${setupData.rounds} turnos pela frente. Apresente seu primeiro argumento! 🦈`
    );
  };

  const generateFeedback = async (setupData) => {
    setLoading(true);
    try {
      const feedbackText = await generateFeedbackWithOllama(
        setupData.debateTopic,
        setupData.userName,
        chatHistory
      );

      setSharkMessage(
        `🦈 **DEBATE ENCERRADO!**\n\n` +
        `---\n\n` +
        `## Feedback do Debate\n\n` +
        feedbackText
      );

      setDebateEnded(true);
    } catch (error) {
      console.error("Erro ao gerar feedback:", error);
      setSharkMessage(
        "🦈 **Debate encerrado!** Foi um prazer debater com você, mas tive dificuldades para gerar o feedback. " +
        "De qualquer forma, parabéns pela participação! 🦈"
      );
      setDebateEnded(true);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (textoParaEnviar, setupData) => {
    // Verifica se ainda há turnos
    if (remainingRounds <= 0) {
      setSharkMessage("O debate já acabou! Veja o feedback acima. 🦈");
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

${remainingRounds === 1 ? '[ATENÇÃO: Este é o último turno! Faça suas considerações finais de forma concisa.]' : ''}
      `.trim();

      const responseText = await sendMessageToOllama(contextualizedMessage, chatHistory);

      // Decrementa os turnos
      const newRemainingRounds = remainingRounds - 1;
      setRemainingRounds(newRemainingRounds);

      setSharkMessage(responseText);

      const newHistory = [
        ...chatHistory,
        { role: "user", parts: [{ text: textoParaEnviar }] },
        { role: "model", parts: [{ text: responseText }] },
      ];

      setChatHistory(newHistory);

      // Se acabaram os turnos, gera o feedback
      if (newRemainingRounds === 0) {
        // Pequeno delay para mostrar a última resposta antes do feedback
        setTimeout(() => {
          generateFeedback(setupData);
        }, 1500);
      }

      return true;
    } catch (error) {
      console.error("Erro ao conversar:", error);
      setSharkMessage("Tive uma cãibra na barbatana... não consegui me conectar ao Ollama! Verifique se está rodando. 🦈");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { 
    sharkMessage, 
    loading, 
    sendMessage, 
    remainingRounds, 
    initializeChat,
    debateEnded 
  };
};