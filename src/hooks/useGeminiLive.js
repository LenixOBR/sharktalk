import { useState, useRef, useEffect } from 'react';
import { GeminiLiveSession } from '../services/geminiLiveService';

export const useGeminiLive = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  
  const sessionRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup na desmontagem
      if (sessionRef.current) {
        sessionRef.current.disconnect();
      }
    };
  }, []);

  const connect = async (systemInstruction = null) => {
    try {
      setError(null);
      
      const session = new GeminiLiveSession();
      
      // Configura callbacks
      session.onMessage = (message) => {
        switch (message.type) {
          case 'connected':
            setIsConnected(true);
            break;
          case 'disconnected':
            setIsConnected(false);
            setIsListening(false);
            setIsSpeaking(false);
            break;
          case 'micStarted':
            setIsListening(true);
            break;
          case 'micStopped':
            setIsListening(false);
            break;
          case 'text':
            setTranscript(prev => prev + message.content);
            setIsSpeaking(true);
            break;
          case 'turnComplete':
            setIsSpeaking(false);
            break;
        }
      };
      
      session.onError = (err) => {
        setError(err.message || 'Erro desconhecido');
        console.error('Erro na sessão:', err);
      };

      const success = await session.connect(systemInstruction);
      
      if (success) {
        sessionRef.current = session;
        return true;
      } else {
        setError('Falha ao conectar');
        return false;
      }
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const startListening = async () => {
    if (!sessionRef.current) {
      setError('Sessão não conectada');
      return false;
    }

    setTranscript(''); // Limpa transcrição anterior
    return await sessionRef.current.startMicrophone();
  };

  const stopListening = () => {
    if (sessionRef.current) {
      sessionRef.current.stopMicrophone();
    }
  };

  const disconnect = async () => {
    if (sessionRef.current) {
      await sessionRef.current.disconnect();
      sessionRef.current = null;
      setIsConnected(false);
      setIsListening(false);
      setIsSpeaking(false);
    }
  };

  const sendText = (text) => {
    if (sessionRef.current) {
      sessionRef.current.sendText(text);
    }
  };

  return {
    isConnected,
    isListening,
    isSpeaking,
    transcript,
    error,
    connect,
    startListening,
    stopListening,
    disconnect,
    sendText,
  };
};