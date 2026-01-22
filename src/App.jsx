// src/App.jsx
import React, { useState } from 'react';
import SharkAvatar from './components/SharkAvatar';
import MicrophonePermission from './components/MicrophonePermission';
import SetupScreen from './components/SetupScreen';
import { useGeminiLive } from './hooks/useGeminiLive';
import './App.css';

function App() {  
  // Substituímos os hooks antigos pelo hook Live
  const { connect, disconnect, isConnected, isSpeaking } = useGeminiLive();
  
  const [setupData, setSetupData] = useState(null);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);

  const handleSetupComplete = (data) => {
    setSetupData(data);
    // O hook useGeminiLive precisa receber os dados para configurar o Tuba
    connect(data.debateTopic, data.userName);
  };
  const handleEndDebate = () => {
    disconnect();
    setSetupData(null);
  };

  if (!setupData) {
    return <SetupScreen onComplete={handleSetupComplete} />;
  }

  return (
    <div className="app-container">
      {!micPermissionGranted && (
        <MicrophonePermission onPermissionGranted={() => setMicPermissionGranted(true)} />
      )}

      <header className="app-header">
        <h1>Shark Tank Debate (Live API 🔴)</h1>
        <p className="topic-display">
          Tema: <strong>{setupData.debateTopic}</strong>
        </p>
      </header>

      <main className="main-content">
        <div className="avatar-section">
          <SharkAvatar isSpeaking={isSpeaking} />
          
          <div className="live-status">
            {isConnected ? (
              <span className="status-badge connected">● Conectado ao Tuba</span>
            ) : (
              <span className="status-badge connecting">● Conectando...</span>
            )}
            
            {isSpeaking && <p className="subtitle">Tuba está falando...</p>}
            {!isSpeaking && isConnected && <p className="subtitle">Tuba está ouvindo...</p>}
          </div>
        </div>

        <div className="controls-section">
          <button className="end-button" onClick={handleEndDebate}>
            Encerrar Debate
          </button>
        </div>
      </main>

      {/* CSS Inline rápido para o status */}
      <style>{`
        .live-status { margin-top: 20px; text-align: center; }
        .status-badge { padding: 5px 10px; border-radius: 15px; font-weight: bold; }
        .connected { background: #d4edda; color: #155724; }
        .connecting { background: #fff3cd; color: #856404; }
        .end-button { background: #dc3545; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px;}
      `}</style>
    </div>
  );
}

export default App;