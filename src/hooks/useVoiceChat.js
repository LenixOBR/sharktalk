import { useState, useRef, useEffect } from 'react';

export const useVoiceChat = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Inicializa o reconhecimento de fala
  useEffect(() => {
    // Verifica se o navegador suporta Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false; // Para quando detectar silêncio
    recognition.interimResults = true; // Mostra resultados enquanto fala
    recognition.lang = 'pt-BR'; // Idioma português

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece;
        } else {
          interimTranscript += transcriptPiece;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Erro no reconhecimento de voz:', event.error);
      setError(`Erro: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Inicia a escuta
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  // Para a escuta
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  // Faz a IA falar
  const speak = (text) => {
    return new Promise((resolve, reject) => {
      // Para qualquer fala anterior
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configurações de voz
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0; // Velocidade (0.1 a 10)
      utterance.pitch = 1.0; // Tom (0 a 2)
      utterance.volume = 1.0; // Volume (0 a 1)

      // Tenta encontrar uma voz em português
      const voices = synthRef.current.getVoices();
      const portugueseVoice = voices.find(voice => voice.lang.startsWith('pt'));
      if (portugueseVoice) {
        utterance.voice = portugueseVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('Erro na síntese de voz:', event);
        setIsSpeaking(false);
        reject(event);
      };

      synthRef.current.speak(utterance);
    });
  };

  // Para a fala
  const stopSpeaking = () => {
    synthRef.current.cancel();
    setIsSpeaking(false);
  };

  return {
    isListening,
    isSpeaking,
    transcript,
    error,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
};