import React, { useEffect, useState } from 'react';
import sharkAvatar from '../assets/placeholder.svg';

const SharkAvatar = ({ message }) => {
  const [displayMessage, setDisplayMessage] = useState(message);

  useEffect(() => {
    setDisplayMessage(message);
  }, [message]);

  useEffect(() => {
    // Função para falar como tubarão no console
    window.sharkSpeak = (texto) => {
      setDisplayMessage(texto);
      console.log("🦈 Tubarão disse:", texto);
    };

    return () => {
      delete window.sharkSpeak;
    };
  }, []);

  return (
    <div className="shark">
      {displayMessage && (
        <div className="speech-bubble">
          {displayMessage}
        </div>
      )}
      <img src={sharkAvatar} alt="Placeholder shark" className='sharkAvatar'/>
    </div>
  );
};

export default SharkAvatar;