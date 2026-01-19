import sharkAvatar from './assets/placeholder.svg'
import React, { useState } from 'react';
import './App.css'

function App() {
  const [sharkMessage, setSharkMessage] = useState("Olá! Sou um tubarão! 🦈");

  
  const handleInput = (input) => {

    /*
      Por enquanto, isso só vai responder com oque vc mandou
      Mas! Isso não vai ficar assim
      Em vez disso, ele será assim:
      Quando alguém apertar o botão, ele irá chamar a função "handleInput"
      essa handleInput, chamará um handleMicSpeak, que está em outro arquivo, e irá retornar oque a pessoa falou com speech to text
      ela então passará para o handleResponse, que será um carinha 
      esse agente então irá chamar o handleResponse, que irá pegar a fala
      mandar para uma IA (sim, é.)
      e ela retornará a resposta da IA
      então mandaramos para o setSharkMessage
    */
    setSharkMessage(input);
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
        <button onClick={() => handleInput("oi")}>🎙️</button>
      </div>

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