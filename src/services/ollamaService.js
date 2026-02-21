export const sendMessageToOllama = async (message, history = []) => {
  try {
    const response = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, history }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na função Netlify: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('Erro ao comunicar com a função Netlify:', error);
    throw error;
  }
};

export const generateFeedbackWithOllama = async (debateTopic, userName, chatHistory) => {
  try {
    const response = await fetch('/.netlify/functions/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ debateTopic, userName, chatHistory }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na função Netlify: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('Erro ao gerar feedback com a função Netlify:', error);
    throw error;
  }
};