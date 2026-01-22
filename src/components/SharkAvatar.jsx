import React, { useEffect } from 'react';
import sharkAvatar from '../assets/placeholder.svg';

const SharkAvatar = ({ message }) => {
  useEffect(() => {
    const handleSharkSpeak = () => {
      if (message) {
        console.log("Nova mensagem do tubarão:", message);
        // Aqui você pode adicionar a função para fazer o tubarão falar
      }
    };

    // Expõe a função no window para acessar do console
    window.sharkSpeak = handleSharkSpeak;

    return () => {
      delete window.sharkSpeak;
    };
  }, [message]);

  return (
    <div className="shark">
      {message && (
        <div className="speech-bubble">
          {message}
        </div>
      )}
      <img src={sharkAvatar} alt="Placeholder shark" className='sharkAvatar'/>
    </div>
  );
};

export default SharkAvatar;