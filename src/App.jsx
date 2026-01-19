import sharkAvatar from './assets/placeholder.svg'
import React, { useState } from 'react';
import { startGeminiChat } from './services/geminiService';
import './App.css'

function App() {
  const [sharkMessage, setSharkMessage] = useState("Olá! Sou um tubarão! 🦈");

  // O histórico começa vazio
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // btw these are all from google, who cares? these are going up up and away
  const [input, setInput] = useState('');

  // 2. Handle the change event
  const handleChange = (event) => {
    setInput(event.target.value);
  };

  // 3. Handle form submission (optional)
// 1. Ajuste o handleSubmit para chamar o sendMessage
const handleSubmit = async (event) => {
  event.preventDefault(); // Impede o reload da página
  if (!input.trim() || loading) return; // Não envia se estiver vazio ou carregando

  // Chamamos a função que fala com o Gemini
  await sendMessage(input);
};

// 2. Refatore o sendMessage para aceitar o texto como parâmetro
const sendMessage = async (textoParaEnviar) => {
  setLoading(true);
  try {
    const chat = startGeminiChat(chatHistory);
    
    // Envia o texto que veio do input
    const result = await chat.sendMessage(textoParaEnviar);
    const responseText = result.response.text();

    // Faz o tubarão "falar" a resposta
    setSharkMessage(responseText);

    // Atualiza o histórico para manter o debate vivo
    setChatHistory([
      ...chatHistory,
      { role: "user", parts: [{ text: textoParaEnviar }] },
      { role: "model", parts: [{ text: responseText }] },
    ]);
    
    setInput(""); // Limpa o campo de texto após enviar
  } catch (error) {
    console.error("Erro ao conversar:", error);
    setSharkMessage("Tive uma cãibra na barbatana... tente de novo! 🦈");
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <h1>Shark Talk</h1>
      <div className="shark">
        {sharkMessage && (
          <div className="speech-bubble">
            {sharkMessage}
          </div>
        )}
        <img src={sharkAvatar} alt="Placeholder shark" className='sharkAvatar'/>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input} // The value is controlled by the 'name' state
          onChange={handleChange} // Updates the state on every keystroke
        />
      <button type="submit">Submit</button>
    </form>
      {/*
      <div className="response-buttons">
        <button onClick={() => handleMic()}>🎙️</button>
      </div>
      Sim, isso tá desativado por enquanto ;'
      */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '12px',
        color: '#FFFFFF',
        width: '100%',
        textAlign: 'center',
      }}>
        <a href="https://github.com/Mircas001/sharktalk/blob/main/LICENSE" target="_blank" title="AGPL-3.0" style={{ color: '#FFFFFF', textDecoration: 'none' }}>
          <small>Este site é licenciado sob a AGPLv3</small>
        </a>
        <br />
        <a href="https://github.com/Mircas001/sharktalk/" target="_blank" title="Github" style={{ color: '#FFFFFF', textDecoration: 'none' }}>
          <small>Acesse o código fonte</small>
        </a>
      </div>
    </>
  )
}

export default App