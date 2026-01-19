import sharkAvatar from './assets/placeholder.svg'
import React, { useState } from 'react';
import { startGeminiChat } from './services/geminiService';
import './App.css'

function App() {
  const [sharkMessage, setSharkMessage] = useState("Olá! Sou um tubarão! 🦈");

  const [AiInput, setAiInput] = useState("");
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
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevents the default page reload
    alert(`A Input was submitted: ${input}`);
  };

  const sendMessage = async () => {
    if (!AiInput) return;

    setLoading(true);
    try {
      // 1. Inicia o chat passando o histórico atual
      const chat = startGeminiChat(chatHistory);

      // 2. Envia a nova mensagem
      const result = await chat.sendMessage(AiInput);
      const responseText = result.response.text();

      setSharkMessage(responseText);

      // 3. Atualiza o histórico com a sua pergunta E a resposta da IA
      setChatHistory([
        ...chatHistory,
        { role: "user", parts: [{ text: AiInput }] },
        { role: "model", parts: [{ text: responseText }] },
      ]);
      
      setAiInput(""); // Limpa o campo de texto
    } catch (error) {
      console.error("Erro ao conversar:", error);
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
        <button onClick={() => handleInput("oi")}>🎙️</button>
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