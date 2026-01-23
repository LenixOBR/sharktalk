import React, { useState, useEffect } from 'react';
import { useSharkChat } from './hooks/useSharkChat';
import { useGeminiLive } from './hooks/useGeminiLive';
import SharkAvatar from './components/SharkAvatar';
import VoiceControl from './components/VoiceControl';
import MicrophonePermission from './components/MicrophonePermission';
import CopyrightFooter from './components/Footer';
import SetupScreen from './components/SetupScreen';
import './App.css';

function App() {
  const [setupData, setSetupData] = useState(null);
  const [useLiveMode, setUseLiveMode] = useState(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);

  // Modo texto (Ollama)
  const textChat = useSharkChat();

  // Modo voz nativo (Gemini Live)
  const liveChat = useGeminiLive();

  // Seleciona o modo ativo
  const activeMode = useLiveMode ? liveChat : textChat;

  const handleSetupComplete = async (data) => {
    setSetupData(data);
    
    if (useLiveMode) {
      // Conecta ao Gemini Live com instruções personalizadas
      const systemInstruction = 
        `Seu nome é Tuba. ` +
        `Você é um tubarão debatedor. ` +
        `O tema do debate é: "${data.debateTopic}". ` +
        `Você está debatendo com ${data.userName}. ` +
        `Vocês têm ${data.rounds} turnos no total. ` +
        `Seja assertivo, respeitoso e conciso. ` +
        `Apresente contra-argumentos fundamentados e mantenha o debate produtivo.`;
      
      await liveChat.connect(systemInstruction);
    } else {
      textChat.initializeChat(data);
    }
  };

  if (!setupData) {
    return (
      <div>
        <SetupScreen onComplete={handleSetupComplete} />
        <div className="mode-selector">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={useLiveMode}
              onChange={(e) => setUseLiveMode(e.target.checked)}
            />
            Usar modo de voz nativo (Gemini Live API) 🎙️
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="status-bar">
        <h1>🦈 Shark Talk - {setupData.debateTopic}</h1>
        <p className="user-info">
          Debatedor: {setupData.userName} | 
          Modo: {useLiveMode ? 'Voz Nativa' : 'Texto'} |
          {!useLiveMode && ` Turnos restantes: ${textChat.remainingRounds ?? setupData.rounds}`}
        </p>
        {useLiveMode && (
          <p className="connection-status">
            Status: {liveChat.isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
          </p>
        )}
      </div>

      <SharkAvatar 
        message={useLiveMode ? liveChat.transcript : textChat.sharkMessage} 
      />

      {!micPermissionGranted && useLiveMode && (
        <MicrophonePermission onPermissionGranted={() => setMicPermissionGranted(true)} />
      )}

      {useLiveMode && liveChat.isConnected && micPermissionGranted && (
        <VoiceControl
          isListening={liveChat.isListening}
          isSpeaking={liveChat.isSpeaking}
          onStartListening={liveChat.startListening}
          onStopListening={liveChat.stopListening}
          onStopSpeaking={() => {}} // Gemini Live controla isso
          disabled={false}
        />
      )}

      {(liveChat.error || textChat.error) && (
        <div className="voice-error">
          ⚠️ {useLiveMode ? liveChat.error : textChat.error}
        </div>
      )}

      {(useLiveMode ? liveChat.isListening : textChat.loading) && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>{useLiveMode ? 'Ouvindo...' : 'Tuba está pensando...'}</p>
        </div>
      )}

      <CopyrightFooter />
    </div>
  );
}

export default App;