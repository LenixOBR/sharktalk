import { GoogleGenAI, Modality } from '@google/genai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.0-flash-exp';
const config = {
  responseModalities: [Modality.AUDIO],
  systemInstruction: 
    "Seu nome é Tuba. " +
    "Você é um avatar em forma de tubarão que participa de debates. " +
    "Você deve, em tom assertivo, respeitoso e equilibrado, debater com o usuário sobre o tema proposto. " +
    "Analise os argumentos apresentados, ofereça contra-argumentos fundamentados e mantenha o debate produtivo. " +
    "Sempre mantenha o respeito e o profissionalismo, mesmo em discordâncias. " +
    "Seja conciso e direto em suas respostas.",
};

export class GeminiLiveSession {
  constructor() {
    this.session = null;
    this.audioContext = null;
    this.mediaRecorder = null;
    this.audioQueue = [];
    this.isPlaying = false;
    this.onMessage = null;
    this.onError = null;
  }

  async connect(systemInstruction = null) {
    try {
      // Atualiza system instruction se fornecida
      const sessionConfig = { ...config };
      if (systemInstruction) {
        sessionConfig.systemInstruction = systemInstruction;
      }

      this.session = await ai.live.connect({
        model: model,
        config: sessionConfig,
        callbacks: {
          onopen: () => {
            console.log('✅ Conectado ao Gemini Live API');
            if (this.onMessage) {
              this.onMessage({ type: 'connected' });
            }
          },
          onmessage: (message) => this.handleMessage(message),
          onerror: (error) => {
            console.error('❌ Erro na sessão:', error);
            if (this.onError) {
              this.onError(error);
            }
          },
          onclose: (event) => {
            console.log('🔌 Sessão fechada:', event.reason);
            if (this.onMessage) {
              this.onMessage({ type: 'disconnected', reason: event.reason });
            }
          },
        },
      });

      // Inicializa AudioContext para playback
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 24000,
      });

      return true;
    } catch (error) {
      console.error('Erro ao conectar:', error);
      if (this.onError) {
        this.onError(error);
      }
      return false;
    }
  }

  async startMicrophone() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });

      // Configura MediaRecorder para capturar áudio
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      this.mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          // Converte para PCM e envia para a API
          const arrayBuffer = await event.data.arrayBuffer();
          await this.processAudioChunk(arrayBuffer);
        }
      };

      // Captura em chunks de 100ms
      this.mediaRecorder.start(100);
      console.log('🎤 Microfone iniciado');

      if (this.onMessage) {
        this.onMessage({ type: 'micStarted' });
      }

      return true;
    } catch (error) {
      console.error('Erro ao iniciar microfone:', error);
      if (this.onError) {
        this.onError(error);
      }
      return false;
    }
  }

  async processAudioChunk(arrayBuffer) {
    try {
      // Decodifica o áudio
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      // Converte para PCM 16-bit mono 16kHz
      const pcmData = this.convertToPCM16(audioBuffer);
      
      // Envia para a API
      if (this.session) {
        this.session.sendRealtimeInput({
          audio: {
            data: pcmData,
            mimeType: "audio/pcm;rate=16000"
          }
        });
      }
    } catch (error) {
      // Ignora erros de decodificação de chunks pequenos
      if (!error.message.includes('decode')) {
        console.error('Erro ao processar áudio:', error);
      }
    }
  }

  convertToPCM16(audioBuffer) {
    // Reamostra para 16kHz se necessário
    const targetSampleRate = 16000;
    let channelData = audioBuffer.getChannelData(0); // Mono

    if (audioBuffer.sampleRate !== targetSampleRate) {
      channelData = this.resample(channelData, audioBuffer.sampleRate, targetSampleRate);
    }

    // Converte para PCM 16-bit
    const pcm16 = new Int16Array(channelData.length);
    for (let i = 0; i < channelData.length; i++) {
      const s = Math.max(-1, Math.min(1, channelData[i]));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }

    // Converte para base64
    const uint8Array = new Uint8Array(pcm16.buffer);
    return btoa(String.fromCharCode(...uint8Array));
  }

  resample(buffer, fromSampleRate, toSampleRate) {
    const ratio = fromSampleRate / toSampleRate;
    const newLength = Math.round(buffer.length / ratio);
    const result = new Float32Array(newLength);
    
    for (let i = 0; i < newLength; i++) {
      const srcIndex = i * ratio;
      const srcIndexFloor = Math.floor(srcIndex);
      const srcIndexCeil = Math.min(srcIndexFloor + 1, buffer.length - 1);
      const t = srcIndex - srcIndexFloor;
      
      result[i] = buffer[srcIndexFloor] * (1 - t) + buffer[srcIndexCeil] * t;
    }
    
    return result;
  }

  handleMessage(message) {
    // Processa interrupções
    if (message.serverContent?.interrupted) {
      this.audioQueue = [];
      this.stopPlayback();
      console.log('⚠️ Resposta interrompida');
      return;
    }

    // Processa áudio recebido
    if (message.serverContent?.modelTurn?.parts) {
      for (const part of message.serverContent.modelTurn.parts) {
        if (part.inlineData?.data) {
          const audioData = part.inlineData.data;
          this.audioQueue.push(audioData);
          
          // Inicia playback se não estiver tocando
          if (!this.isPlaying) {
            this.playAudioQueue();
          }
        }
        
        // Processa texto se houver
        if (part.text) {
          if (this.onMessage) {
            this.onMessage({ type: 'text', content: part.text });
          }
        }
      }
    }

    // Notifica sobre fim do turno
    if (message.serverContent?.turnComplete) {
      if (this.onMessage) {
        this.onMessage({ type: 'turnComplete' });
      }
    }
  }

  async playAudioQueue() {
    if (this.isPlaying || this.audioQueue.length === 0) return;

    this.isPlaying = true;

    while (this.audioQueue.length > 0) {
      const base64Audio = this.audioQueue.shift();
      await this.playAudioChunk(base64Audio);
    }

    this.isPlaying = false;
  }

  async playAudioChunk(base64Audio) {
    try {
      // Decodifica base64 para ArrayBuffer
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Converte PCM para AudioBuffer
      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / (pcm16[i] < 0 ? 0x8000 : 0x7FFF);
      }

      const audioBuffer = this.audioContext.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      // Toca o áudio
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      return new Promise((resolve) => {
        source.onended = resolve;
        source.start(0);
      });
    } catch (error) {
      console.error('Erro ao tocar áudio:', error);
    }
  }

  stopPlayback() {
    this.audioQueue = [];
    this.isPlaying = false;
  }

  stopMicrophone() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      console.log('🎤 Microfone parado');
    }

    if (this.onMessage) {
      this.onMessage({ type: 'micStopped' });
    }
  }

  async disconnect() {
    this.stopMicrophone();
    this.stopPlayback();
    
    if (this.session) {
      await this.session.disconnect();
      this.session = null;
    }

    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }

    console.log('👋 Desconectado do Gemini Live');
  }

  // Envia texto para a API
  sendText(text) {
    if (this.session) {
      this.session.send({ text });
    }
  }
}