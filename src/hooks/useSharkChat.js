import { useState } from 'react';
import { sendChatMessage } from '../services/openRouterService';

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
    setSharkMessage(
      `Olá, ${setupData.userName}! Sou Tuba, seu oponente neste debate sobre "${setupData.debateTopic}". ` +
      `Temos ${setupData.rounds} turnos pela frente. Apresente seu primeiro argumento! 🦈`
    );
  };

  const generateFeedback = async (setupData) => {
    setLoading(true);
    try {
      const debateTranscript = chatHistory
        .map((msg) => {
          const speaker = msg.role === 'user' ? setupData.userName : 'Tuba';
          return `**${speaker}:** ${msg.parts[0].text}`;
        })
        .join('\n\n');

      const feedbackPrompt = `
[SOLICITAÇÃO DE FEEDBACK FINAL]

Você acabou de concluir um debate sobre "${setupData.debateTopic}" com ${setupData.userName}.

Aqui está o histórico completo do debate:

${debateTranscript}

---

Por favor, forneça um feedback construtivo e detalhado sobre o desempenho de ${setupData.userName} neste debate. Inclua:

1. **Pontos Fortes:** O que ${setupData.userName} fez bem durante o debate?
2. **Áreas de Melhoria:** Onde ${setupData.userName} poderia melhorar sua argumentação?
3. **Qualidade dos Argumentos:** Avalie a consistência e fundamentação dos argumentos apresentados.
4. **Conclusão:** Uma reflexão geral sobre o debate e sugestões para futuros debates.

Seja honesto, construtivo e encorajador. Use um tom amigável e mantenha sua personalidade de tubarão! 🦈
      `.trim();

      const feedbackText = await sendChatMessage(feedbackPrompt, []);

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
    if (remainingRounds <= 0) {
      setSharkMessage("O debate já acabou! Veja o feedback acima. 🦈");
      return false;
    }

    setLoading(true);
    try {
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

      const responseText = await sendChatMessage(contextualizedMessage, chatHistory);

      const newRemainingRounds = remainingRounds - 1;
      setRemainingRounds(newRemainingRounds);

      setSharkMessage(responseText);

      const newHistory = [
        ...chatHistory,
        { role: "user", parts: [{ text: textoParaEnviar }] },
        { role: "model", parts: [{ text: responseText }] },
      ];

      setChatHistory(newHistory);

      if (newRemainingRounds === 0) {
        setTimeout(() => {
          generateFeedback(setupData);
        }, 1500);
      }

      return true;
    } catch (error) {
      console.error("Erro ao conversar:", error);
      setSharkMessage("Tive uma cãibra na barbatana... tente de novo! 🦈");
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