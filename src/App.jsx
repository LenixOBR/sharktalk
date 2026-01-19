import sharkAvatar from './assets/placeholder.svg'
import React, { useState } from 'react';
import { startGeminiChat } from './services/geminiService';
import './App.css'

function App() {
  const [sharkMessage, setSharkMessage] = useState("Olá! Sou um tubarão! 🦈");

  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');

  const handleChange = (event) => {
    setInput(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); 
    if (!input.trim() || loading) return; 

    await sendMessage(input);
  };

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
      
      setInput(""); 
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
          value={input} 
          onChange={handleChange} 
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