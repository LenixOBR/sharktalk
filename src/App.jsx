import React, { useState } from 'react';
import { useSharkChat } from './hooks/useSharkChat';
import SharkAvatar from './components/SharkAvatar';
import ChatForm from './components/ChatForm';
import CopyrightFooter from './components/Footer';
import SetupScreen from './components/SetupScreen';
import './App.css';

function App() {  
  const { sharkMessage, loading, sendMessage } = useSharkChat();
  const [setupData, setSetupData] = useState(null);
  
  const handleSetupComplete = (data) => {
    setSetupData(data);
    // Aqui você pode usar: data.userName, data.debateTopic, data.rounds
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
        Debatedor: {setupData.userName} | Turnos restantes: {setupData.rounds}
      </p>
      <SharkAvatar message={sharkMessage} />
      <ChatForm onSubmit={sendMessagePrepper} loading={loading} />
      <CopyrightFooter />
    </div>
  );
}

export default App;