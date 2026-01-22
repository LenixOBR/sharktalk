import React, { useState, useEffect } from 'react';
import { useSharkChat } from './hooks/useSharkChat';
import { useVoiceChat } from './hooks/useVoiceChat';
import SharkAvatar from './components/SharkAvatar';
import ChatForm from './components/ChatForm';
import VoiceControl from './components/VoiceControl';
import CopyrightFooter from './components/Footer';
import SetupScreen from './components/SetupScreen';
import './App.css';

function App() {  
  const { sharkMessage, loading, sendMessage, remainingRounds, initializeChat, debateEnded } = useSharkChat();
  const { 
    isListening, 
    isSpeaking, 
    transcript, 
    error: voiceError,
    startListening, 
    stopListening, 
    speak,
    stopSpeaking 
  } = useVoiceChat();
  
  const [setupData, setSetupData] = useState(null);
  const [autoSpeak, setAutoSpeak] = useState(true); // Auto-falar respostas da IA

  const handleSetupComplete = (data) => {
    setSetupData(data);
    initializeChat(data);
  };

  const sendMessageWrapper = async (texto) => {
    const success = await sendMessage(texto, setupData);
    
    // Se auto-speak está ativo e a mensagem foi enviada com sucesso
    if (success && autoSpeak && !debateEnded) {
      // Pequeno delay para garantir que sharkMessage foi atualizado
      setTimeout(() => {
        speak(sharkMessage);
      }, 500);
    }
  };

  // Quando o transcript mudar e for final, envia a mensagem
  useEffect(() => {
    if (transcript && !isListening && transcript.trim()) {
      sendMessageWrapper(transcript);
    }
  }, [transcript, isListening]);

  // Fala a mensagem da IA quando ela muda (se auto-speak estiver ativo)
  useEffect(() => {
    if (autoSpeak && sharkMessage && !loading && setupData) {
      speak(sharkMessage);
    }
  }, [sharkMessage]);

  // Se ainda não completou o setup, mostra a tela de configuração
  if (!setupData) {
    return <SetupScreen onComplete={handleSetupComplete} />;
  }

  // Tela principal do chat
  return (
    <div className="app-container">
      <h1>🦈 Shark Talk - {setupData.debateTopic}</h1>
      <p className="user-info">
        Debatedor: {setupData.userName} | Turnos restantes: {remainingRounds ?? setupData.rounds}
      </p>

      {/* Toggle de auto-falar */}
      <div className="controls">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={autoSpeak}
            onChange={(e) => setAutoSpeak(e.target.checked)}
          />
          Auto-falar respostas da IA
        </label>
      </div>

      <SharkAvatar message={sharkMessage} />

      {/* Controles de voz */}
      <VoiceControl
        isListening={isListening}
        isSpeaking={isSpeaking}
        onStartListening={startListening}
        onStopListening={stopListening}
        onStopSpeaking={stopSpeaking}
        disabled={loading || debateEnded}
      />

      {/* Mostra o que está sendo transcrito */}
      {transcript && (
        <div className="transcript-preview">
          <p><strong>Você disse:</strong> {transcript}</p>
        </div>
      )}

      {/* Erro de voz */}
      {voiceError && (
        <div className="voice-error">
          ⚠️ {voiceError}
        </div>
      )}

      {/* Formulário de texto (ainda disponível) */}
      <ChatForm 
        onSubmit={sendMessageWrapper} 
        loading={loading} 
        disabled={debateEnded}
      />

      <CopyrightFooter />
    </div>
  );
}

export default App;