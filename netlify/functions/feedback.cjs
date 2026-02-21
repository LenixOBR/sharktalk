const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { debateTopic, userName, chatHistory } = JSON.parse(event.body);

    const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;
    const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'https://api.ollama.cloud';
    const OLLAMA_API_URL = `${OLLAMA_BASE_URL}/api/chat`;
    const MODEL = process.env.MODEL || 'deepseek-v3.2';

    const systemInstruction =
      "Seu nome é Tuba. " +
      "Você é um avatar em forma de tubarão que participa de debates. " +
      "Você deve, em tom assertivo, respeitoso e equilibrado, debater com o usuário sobre o tema proposto. " +
      "Analise os argumentos apresentados, ofereça contra-argumentos fundamentados e mantenha o debate produtivo. " +
      "Quando for o último turno do debate, faça suas considerações finais de forma mais concisa e conclusiva. " +
      "Sempre mantenha o respeito e o profissionalismo, mesmo em discordâncias. " +
      "Não dê respostas muito longas, 1 parágrafo já basta.";

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
      { role: 'system', content: systemInstruction },
      { role: 'user', content: feedbackPrompt }
    ];

    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(OLLAMA_API_KEY && { 'Authorization': `Bearer ${OLLAMA_API_KEY}` })
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        stream: false,
        options: { temperature: 0.7, num_predict: 800 }
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API Ollama: ${response.status}`);
    }

    const data = await response.json();
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ content: data.message.content })
    };
  } catch (error) {
    console.error('Erro:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};