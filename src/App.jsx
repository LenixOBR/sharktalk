import React, { useState, useEffect, useRef } from 'react';
import { useSharkChat } from './hooks/useSharkChat';
import { useVoiceChat } from './hooks/useVoiceChat';
import SharkAvatar from './components/SharkAvatar';
import VoiceControl from './components/VoiceControl';
import MicrophonePermission from './components/MicrophonePermission';
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
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  
  // Refs para controlar o que já foi falado
  const lastSpokenMessageRef = useRef('');
  const isProcessingRef = useRef(false);

  const handleSetupComplete = (data) => {
    setSetupData(data);
    initializeChat(data);
    lastSpokenMessageRef.current = ''; // Reset ao iniciar novo debate
  };

  const sendMessageWrapper = async (texto) => {
    // Marca que está processando
    isProcessingRef.current = true;
    
    // Para qualquer fala anterior
    stopSpeaking();
    
    const success = await sendMessage(texto, setupData);
    
    // Marca que terminou de processar
    isProcessingRef.current = false;
  };

  // Quando o transcript mudar e não estiver mais ouvindo, envia
  useEffect(() => {
    if (transcript && !isListening && transcript.trim() && !isProcessingRef.current) {
      sendMessageWrapper(transcript);
    }
  }, [transcript, isListening]);

  // Fala a resposta da IA apenas quando ela for nova e não estiver processando
  useEffect(() => {
    // Só fala se:
    // 1. Auto-speak está ativo
    // 2. Tem mensagem
    // 3. Não está carregando
    // 4. Setup está completo
    // 5. A mensagem é diferente da última falada
    // 6. Não está processando uma nova mensagem
    if (
      autoSpeak && 
      sharkMessage && 
      !loading && 
      setupData && 
      sharkMessage !== lastSpokenMessageRef.current &&
      !isProcessingRef.current
    ) {
      // Aguarda um pouco para garantir que a mensagem está completa
      const speakTimeout = setTimeout(() => {
        speak(sharkMessage);
        lastSpokenMessageRef.current = sharkMessage;
      }, 300);

      return () => clearTimeout(speakTimeout);
    }
  }, [sharkMessage, loading, autoSpeak, setupData]);

  // Limpa a referência quando auto-speak é desativado
  useEffect(() => {
    if (!autoSpeak) {
      stopSpeaking();
    }
  }, [autoSpeak]);

  if (!setupData) {
    return <SetupScreen onComplete={handleSetupComplete} />;
  }

  return (
    <div className="app-container">
      <div className="status-bar">
        <h1>🦈 Shark Talk - {setupData.debateTopic}</h1>
        <p className="user-info">
          Debatedor: {setupData.userName} | Turnos restantes: {remainingRounds ?? setupData.rounds}
        </p>
      </div>

      <SharkAvatar message={sharkMessage} />

      {/* Verificação de permissão de microfone */}
      {!micPermissionGranted && (
        <MicrophonePermission onPermissionGranted={() => setMicPermissionGranted(true)} />
      )}

      {/* Controles de voz - só mostra se tem permissão */}
      {micPermissionGranted && (
        <VoiceControl
          isListening={isListening}
          isSpeaking={isSpeaking}
          onStartListening={startListening}
          onStopListening={stopListening}
          onStopSpeaking={stopSpeaking}
          disabled={loading || debateEnded}
        />
      )}

      {/* Indicador de carregamento */}
      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Tuba está pensando...</p>
        </div>
      )}

      {transcript && (
        <div className="transcript-preview">
          <p><strong>Você disse:</strong> {transcript}</p>
        </div>
      )}

      {voiceError && (
        <div className="voice-error">
          ⚠️ {voiceError}
          {voiceError.includes('conexão') && (
            <div style={{ marginTop: '10px', fontSize: '14px' }}>
              <strong>Dicas:</strong>
              <ul style={{ textAlign: 'left', display: 'inline-block' }}>
                <li>Verifique sua conexão com a internet</li>
                <li>Tente usar o Chrome ou Edge (melhor suporte)</li>
                <li>Recarregue a página</li>
              </ul>
            </div>
          )}
        </div>
      )}

      <CopyrightFooter />
    </div>
  );
}

export default App;