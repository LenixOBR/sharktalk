import React, { useEffect, useState } from 'react';
import { useSharkChat } from './hooks/useSharkChat';
import SharkAvatar from './components/SharkAvatar';
import ChatForm from './components/ChatForm';
import CopyrightFooter from './components/Footer';
import './App.css';

function App() {  
  const { sharkMessage, loading, sendMessage } = useSharkChat();

  return (
    <div>
      <h1>Shark Talk</h1>
      <SharkAvatar message={sharkMessage} />
      <ChatForm onSubmit={sendMessage} loading={loading} />
      <CopyrightFooter />
    </div>
  );
}

export default App;