const OLLAMA_API_KEY = import.meta.env.VITE_OLLAMA_API_KEY;
const OLLAMA_BASE_URL = import.meta.env.VITE_OLLAMA_BASE_URL || "https://api.ollama.cloud";
const OLLAMA_API_URL = `${OLLAMA_BASE_URL}/api/chat`;
const MODEL = "llama3.2"; // ou outro modelo disponível no cloud

const systemInstruction = 
  "Seu nome é Tuba. " +
  "Você é um avatar em forma de tubarão que participa de debates. " +
  "Você deve, em tom assertivo, respeitoso e equilibrado, debater com o usuário sobre o tema proposto. " +
  "Analise os argumentos apresentados, ofereça contra-argumentos fundamentados e mantenha o debate produtivo. " +
  "Quando for o último turno do debate, faça suas considerações finais de forma mais concisa e conclusiva. " +
  "Sempre mantenha o respeito e o profissionalismo, mesmo em discordâncias. " +
  "Não dê respostas muito longas, 1 parágrafo já basta.";

export const sendMessageToOllama = async (message, history = []) => {
  try {
    // Formata o histórico no formato do Ollama
    const messages = [
      { role: "system", content: systemInstruction },
      ...history.map(msg => ({
        role: msg.role === "model" ? "assistant" : msg.role,
        content: msg.parts[0].text
      })),
      { role: "user", content: message }
    ];

    const headers = {
      "Content-Type": "application/json",
    };

    // Adiciona a API key se estiver usando cloud
    if (OLLAMA_API_KEY) {
      headers["Authorization"] = `Bearer ${OLLAMA_API_KEY}`;
    }

    const response = await fetch(OLLAMA_API_URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 500,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na API Ollama: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.message.content;
  } catch (error) {
    console.error("Erro ao comunicar com Ollama:", error);
    throw error;
  }
};

export const generateFeedbackWithOllama = async (debateTopic, userName, chatHistory) => {
  try {
    const debateTranscript = chatHistory
      .map((msg) => {
        const speaker = msg.role === 'user' ? userName : 'Tuba';
        return `${speaker}: ${msg.parts[0].text}`;
      })
      .join('\n\n');

    const feedbackPrompt = `
[SOLICITAÇÃO DE FEEDBACK FINAL]

Você acabou de concluir um debate sobre "${debateTopic}" com ${userName}.

Aqui está o histórico completo do debate:

${debateTranscript}

---

Por favor, forneça um feedback construtivo e detalhado sobre o desempenho de ${userName} neste debate. Inclua:

1. Pontos Fortes: O que ${userName} fez bem durante o debate?
2. Áreas de Melhoria: Onde ${userName} poderia melhorar sua argumentação?
3. Qualidade dos Argumentos: Avalie a consistência e fundamentação dos argumentos apresentados.
4. Conclusão: Uma reflexão geral sobre o debate e sugestões para futuros debates.

Seja honesto, construtivo e encorajador. Use um tom amigável e mantenha sua personalidade de tubarão! 🦈
Não passe de 1 paragráfo.
    `.trim();

    const messages = [
      { role: "system", content: systemInstruction },
      { role: "user", content: feedbackPrompt }
    ];

    const headers = {
      "Content-Type": "application/json",
    };

    if (OLLAMA_API_KEY) {
      headers["Authorization"] = `Bearer ${OLLAMA_API_KEY}`;
    }

    const response = await fetch(OLLAMA_API_URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 800,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na API Ollama: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.message.content;
  } catch (error) {
    console.error("Erro ao gerar feedback com Ollama:", error);
    throw error;
  }
};