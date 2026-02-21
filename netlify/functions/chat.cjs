exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { message, history = [] } = JSON.parse(event.body);

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

    const messages = [
      { role: 'system', content: systemInstruction },
      ...history.map(msg => ({
        role: msg.role === 'model' ? 'assistant' : msg.role,
        content: msg.parts[0].text
      })),
      { role: 'user', content: message }
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
        options: { temperature: 0.7, num_predict: 500 }
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API Ollama: ${response.status}`);
    }

    const data = await response.json();
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' }, // Permite CORS se necessário
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