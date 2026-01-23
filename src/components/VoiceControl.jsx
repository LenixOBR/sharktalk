import React from 'react';
import './VoiceControl.css';

function VoiceControl({ 
  isListening, 
  isSpeaking, 
  onStartListening, 
  onStopListening,
  onStopSpeaking,
  disabled 
}) {
  return (
    <div className="voice-control">
      {/* Botão de microfone */}
      <button
        className={`voice-button ${isListening ? 'listening' : ''}`}
        onClick={isListening ? onStopListening : onStartListening}
        disabled={disabled || isSpeaking}
        title={isListening ? 'Parar de ouvir' : 'Começar a falar'}
      >
        {isListening ? (
          <span className="mic-icon pulsing">🎤</span>
        ) : (
          <span className="mic-icon">🎤</span>
        )}
        <span className="voice-label">
          {isListening ? 'Ouvindo...' : 'Pressione para falar'}
        </span>
      </button>

      {/* Indicador de fala da IA */}
      {isSpeaking && (
        <button
          className="voice-button speaking"
          onClick={onStopSpeaking}
          title="Parar fala"
        >
          <span className="speaker-icon pulsing">🔊</span>
          <span className="voice-label">Tuba está falando...</span>
        </button>
      )}
    </div>
  );
}

export default VoiceControl;