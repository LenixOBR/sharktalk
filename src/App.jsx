import sharkAvatar from './assets/placeholder.svg'
import React, { useState } from 'react';
import './App.css'

function App() {
  const [sharkMessage, setSharkMessage] = useState("Olá! Sou um tubarão! 🦈");

  const handleResponse = (response) => {    
    if (response === "oi") {
      setSharkMessage("Que bom te ver! Como você está? 😊");
    } else if (response === "tchau") {
      setSharkMessage("Até logo! Volte sempre! 👋");
    } else if (response === "como vai") {
      setSharkMessage("Estou nadando muito bem, obrigado! 🌊");
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
      
      <div className="response-buttons">
        <button onClick={() => handleResponse("oi")}>Dizer Oi</button>
        <button onClick={() => handleResponse("como vai")}>Como vai?</button>
        <button onClick={() => handleResponse("tchau")}>Tchau</button>
      </div>
    </>
  )
}

export default App