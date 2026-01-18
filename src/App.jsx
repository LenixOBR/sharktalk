import sharkAvatar from './assets/placeholder.svg'
import React, { useState } from 'react';
import './App.css'

function App() {
  const [sharkMessage, setSharkMessage] = useState("Olá! Sou um tubarão! 🦈");

  
  const handleResponse = (response) => {

    /*
      now we will just be mirroring whatever the response is, y'know?
      BUT!
      /we will be taking speech-to-text, AND! 
      we are feeding to some AI
      yeah, this may be considered an actual useful case (seriously stop putting AI everywhere, it's ugly)
      if you ever try deploying this, maybe switch to an AI that doenst drain a river to work
      Yeah, that'd be good, especially if you make money off this
      think about that refreshing water, man
      also, consider buying my team a cup of coffee, pretty please?
      ya really should boycott big tech, especially if you have the money
      okay, may God bless you, bye
    */
    setSharkMessage(response);
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
        {/*
          Yes, it's an single static svg, 
          I'm no artist, and i dont want to bother comissioning one
          Also, not taking the time to actually deploy proper avatar things
          And, i mean, that's more than enough for an high school competition
          but come on, if you want to deploy this for real for real
          get an proper avatar, with proper facial expressions! 2D tho
          most students will probably run this on an phone, so you should make it 2D
          if it's 2D, it will be way more acessible, since rendering 3D will add considerable lag
          otherwise, youll just make inequality larger, even, y'know?
          also, why im writing this in english? it's for Brazilians! By Brazilians!
          whatever, it's just the standard language for this
          may God bless you
        */}
        <img src={sharkAvatar} alt="Placeholder shark" className='sharkAvatar'/>
      </div>
      
      <div className="response-buttons">
        <button onClick={() => handleResponse("oi")}>🎙️</button>
      </div>
    </>
  )
}

export default App