import React from 'react';
import sharkAvatar from '../assets/placeholder.svg';

const SharkAvatar = ({ message }) => {
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