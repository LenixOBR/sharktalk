import { useState, useRef, useEffect } from 'react';

export const useVoiceChat = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const restartTimeoutRef = useRef(null);

  // Carrega as vozes disponíveis
  useEffect(() => {
    const loadVoices = () => {
      const voices = synthRef.current.getVoices();
      
      // Filtra vozes em português
      const portugueseVoices = voices.filter(voice => 
        voice.lang.startsWith('pt-BR') || voice.lang.startsWith('pt')
      );
      
      setAvailableVoices(portugueseVoices);
      
      // Tenta encontrar a melhor voz em ordem de preferência
      const preferredVoices = [
        'Google português do Brasil',
        'Microsoft Maria - Portuguese (Brazil)',
        'Luciana',
        'Fernanda',
        'Felipe',
        'pt-BR-Wavenet',
      ];
      
      let bestVoice = null;
      for (const preferred of preferredVoices) {
        bestVoice = portugueseVoices.find(v => 
          v.name.includes(preferred) || v.name.toLowerCase().includes(preferred.toLowerCase())
        );
        if (bestVoice) break;
      }
      
      // Se não encontrou nenhuma preferida, usa a primeira disponível
      if (!bestVoice && portugueseVoices.length > 0) {
        bestVoice = portugueseVoices[0];
      }
      
      setSelectedVoice(bestVoice);
      
      console.log('Vozes disponíveis:', portugueseVoices.map(v => v.name));
      console.log('Voz selecionada:', bestVoice?.name);
    };

    loadVoices();
    
    // Alguns navegadores precisam deste evento
    if (synthRef.current.onvoiceschanged !== undefined) {
      synthRef.current.onvoiceschanged = loadVoices;
    }
  }, []);

  // Inicializa o reconhecimento de fala
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Reconhecimento iniciado');
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
      
      if (event.error === 'network') {
        setError('Erro de conexão. Verifique sua internet e tente novamente.');
      } else if (event.error === 'no-speech') {
        setError('Nenhuma fala detectada. Tente falar mais alto.');
      } else if (event.error === 'audio-capture') {
        setError('Microfone não encontrado. Verifique as permissões.');
      } else if (event.error === 'not-allowed') {
        setError('Permissão de microfone negada. Ative nas configurações do navegador.');
      } else {
        setError(`Erro: ${event.error}`);
      }
      
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('Reconhecimento encerrado');
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) {
      setError('Reconhecimento de voz não disponível');
      return;
    }

    if (isListening) {
      return;
    }

    setTranscript('');
    setError(null);

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Erro ao iniciar reconhecimento:', error);
      
      if (error.message.includes('already started')) {
        recognitionRef.current.stop();
        restartTimeoutRef.current = setTimeout(() => {
          try {
            recognitionRef.current.start();
          } catch (e) {
            setError('Erro ao iniciar o microfone. Recarregue a página.');
          }
        }, 100);
      } else {
        setError('Erro ao iniciar o microfone. Verifique as permissões.');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  // Configurações de voz melhoradas
  const voiceSettings = {
    rate: 1.1,      // Velocidade: 1.1 = 10% mais rápido (mais natural)
    pitch: 1.0,     // Tom: 1.0 = neutro
    volume: 1.0,    // Volume: máximo
  };

  const speak = (text, settings = {}) => {
    return new Promise((resolve, reject) => {
      // Para qualquer fala anterior
      synthRef.current.cancel();

      // Remove markdown e formatação do texto
      const cleanText = text
        .replace(/\*\*/g, '')           // Remove **bold**
        .replace(/\*/g, '')             // Remove *italic*
        .replace(/#{1,6}\s/g, '')       // Remove headers #
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Remove links [text](url)
        .replace(/---/g, '')            // Remove separadores
        .replace(/🦈/g, '')             // Remove emojis de tubarão
        .replace(/\n{2,}/g, '. ')       // Substitui múltiplas quebras por ponto
        .replace(/\n/g, ', ')           // Substitui quebras simples por vírgula
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // Aplica configurações personalizadas ou padrões
      utterance.lang = 'pt-BR';
      utterance.rate = settings.rate || voiceSettings.rate;
      utterance.pitch = settings.pitch || voiceSettings.pitch;
      utterance.volume = settings.volume || voiceSettings.volume;

      // Usa a voz selecionada
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        console.log('Iniciando fala com voz:', utterance.voice?.name);
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

      // Quebra textos muito longos em partes
      if (cleanText.length > 200) {
        // Divide em sentenças
        const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
        let currentText = '';
        const chunks = [];
        
        sentences.forEach(sentence => {
          if ((currentText + sentence).length < 200) {
            currentText += sentence;
          } else {
            if (currentText) chunks.push(currentText);
            currentText = sentence;
          }
        });
        if (currentText) chunks.push(currentText);

        // Fala cada chunk
        let chunkIndex = 0;
        const speakChunk = () => {
          if (chunkIndex < chunks.length) {
            const chunkUtterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
            chunkUtterance.lang = 'pt-BR';
            chunkUtterance.rate = utterance.rate;
            chunkUtterance.pitch = utterance.pitch;
            chunkUtterance.volume = utterance.volume;
            chunkUtterance.voice = selectedVoice;
            
            chunkUtterance.onend = () => {
              chunkIndex++;
              if (chunkIndex < chunks.length) {
                speakChunk();
              } else {
                setIsSpeaking(false);
                resolve();
              }
            };
            
            chunkUtterance.onerror = (event) => {
              console.error('Erro ao falar chunk:', event);
              setIsSpeaking(false);
              reject(event);
            };
            
            synthRef.current.speak(chunkUtterance);
          }
        };
        
        setIsSpeaking(true);
        speakChunk();
      } else {
        synthRef.current.speak(utterance);
      }
    });
  };

  const stopSpeaking = () => {
    synthRef.current.cancel();
    setIsSpeaking(false);
  };

  // Função para trocar de voz
  const changeVoice = (voiceName) => {
    const voice = availableVoices.find(v => v.name === voiceName);
    if (voice) {
      setSelectedVoice(voice);
      console.log('Voz alterada para:', voice.name);
    }
  };

  // Função para ajustar configurações de voz
  const updateVoiceSettings = (newSettings) => {
    Object.assign(voiceSettings, newSettings);
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
    availableVoices,
    selectedVoice,
    changeVoice,
    voiceSettings,
    updateVoiceSettings,
  };
};