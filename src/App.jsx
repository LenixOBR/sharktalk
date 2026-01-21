import React, { useState, useEffect } from 'react';
import { useSharkChat } from './hooks/useSharkChat';
import SharkAvatar from './components/SharkAvatar';
import ChatForm from './components/ChatForm';
import CopyrightFooter from './components/Footer';
import SetupScreen from './components/SetupScreen';
import './App.css';

function App() {  
  const { sharkMessage, loading, sendMessage, remainingRounds, initializeChat } = useSharkChat();
  const [setupData, setSetupData] = useState(null);

  const handleSetupComplete = (data) => {
    setSetupData(data);
    initializeChat(data);
  };

  const sendMessageWrapper = async (texto) => {
    await sendMessage(texto, setupData);
  };

  // Se ainda não completou o setup, mostra a tela de configuração
  if (!setupData) {
    return <SetupScreen onComplete={handleSetupComplete} />;
  }

  // Tela principal do chat
  return (
    <div>
      <h1>Shark Talk - {setupData.debateTopic}</h1>
      <p className="user-info">
        Debatedor: {setupData.userName} | Turnos restantes: {remainingRounds ?? setupData.rounds}
      </p>
      <SharkAvatar message={sharkMessage} />
      <ChatForm 
        onSubmit={sendMessageWrapper} 
        loading={loading} 
        disabled={remainingRounds === 0}
      />
      <CopyrightFooter />
    </div>
  );
}

export default App;