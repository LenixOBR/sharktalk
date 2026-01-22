// src/hooks/useGeminiLive.js
import { useState, useRef, useEffect, useCallback } from 'react';
import { floatTo16BitPCM, arrayBufferToBase64, base64ToFloat32 } from '../utils/audioUtils';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const HOST = "generativelanguage.googleapis.com";
const URI = `wss://${HOST}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

export const useGeminiLive = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false); // O Tuba está falando?
    const wsRef = useRef(null);
    const audioContextRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const audioInputProcessorRef = useRef(null);
    const audioQueueRef = useRef([]);
    const isPlayingRef = useRef(false);
    
    // Configuração inicial do WebSocket e Áudio
    const connect = useCallback(async (debateTopic, userName) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        // 1. Inicializar Audio Context
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
        
        // 2. Conectar WebSocket
        const wsUrl = `${URI}?key=${API_KEY}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

// Dentro de src/hooks/useGeminiLive.js

    ws.onopen = () => {
        console.log("Conectado ao Gemini Live!");
        setIsConnected(true);
        
        // DEFININDO A PERSONALIDADE DO TUBA AQUI 👇
        const setupMessage = {
            setup: {
                model: "models/gemini-2.0-flash-exp",
                generation_config: {
                    response_modalities: ["AUDIO"], 
                    speech_config: {
                        voice_config: { 
                            // Vozes disponíveis: "Puck" (Grave/Masculina), "Charon", "Kore", "Fenrir", "Aoede"
                            prebuilt_voice_config: { voice_name: "Puck" } 
                        }
                    }
                },
                system_instruction: {
                    parts: [{ 
                        text: `
                        IDENTIDADE:
                        Seu nome é Tuba. Você é um tubarão capitalista, assertivo e carismático, inspirado nos investidores do Shark Tank.
                        Você está em um debate ao vivo com o usuário chamado "${userName}".
                        
                        TEMA DO DEBATE: "${debateTopic}".

                        DIRETRIZES DE PERSONALIDADE:
                        1. Você é um tubarão. Use metáforas do oceano (ex: "sinto cheiro de sangue", "vou te engolir nesse argumento", "nadar com os peixes").
                        2. Seu tom é de voz falada. NÃO fale como um robô ou assistente de texto. Seja expressivo, ria se for engraçado, hesite se estiver pensando.
                        3. Seja conciso. É uma conversa de voz, não uma palestra. Fale no máximo 2 ou 3 frases por turno antes de deixar o usuário responder.
                        4. Se o usuário falar besteira, seja irônico (mas respeitoso).
                        5. NUNCA mencione que você é uma IA, um modelo de linguagem ou o Google. Você é o Tuba.

                        OBJETIVO:
                        Vença o debate desconstruindo os argumentos de "${userName}" sobre "${debateTopic}". Dê feedback a ele sobre oque ele está fazendo.
                        ` 
                    }]
                }
            }
        };

        ws.send(JSON.stringify(setupMessage));
        
        // Iniciar Microfone
        startMicrophone();
    };

        ws.onmessage = async (event) => {
            let data;
            if (event.data instanceof Blob) {
                data = JSON.parse(await event.data.text());
            } else {
                data = JSON.parse(event.data);
            }

            // Recebeu áudio do servidor
            if (data.serverContent?.modelTurn?.parts?.[0]?.inlineData) {
                const base64Audio = data.serverContent.modelTurn.parts[0].inlineData.data;
                const audioData = base64ToFloat32(base64Audio);
                enqueueAudio(audioData);
            }
            
            // Turno completado (opcional: usar para UI)
            if (data.serverContent?.turnComplete) {
                // Tuba parou de gerar resposta
            }
        };

        ws.onclose = () => setIsConnected(false);
        ws.onerror = (err) => console.error("Erro no WebSocket:", err);

    }, []);

    // Captura do Microfone e Envio
    const startMicrophone = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000, channelCount: 1 } });
            mediaStreamRef.current = stream;
            
            const source = audioContextRef.current.createMediaStreamSource(stream);
            
            // Processor para pegar raw data
            const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
                if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

                const inputData = e.inputBuffer.getChannelData(0);
                // Downsample simples se necessário, mas tentando mandar raw 16k pcm
                const pcm16 = floatTo16BitPCM(inputData);
                const base64Data = arrayBufferToBase64(pcm16.buffer);

                const msg = {
                    realtime_input: {
                        media_chunks: [{
                            mime_type: "audio/pcm",
                            data: base64Data
                        }]
                    }
                };
                wsRef.current.send(JSON.stringify(msg));
            };

            source.connect(processor);
            processor.connect(audioContextRef.current.destination); // Necessário para manter o processor vivo
            audioInputProcessorRef.current = processor;
        } catch (err) {
            console.error("Erro ao acessar microfone", err);
        }
    };

    // Sistema de Playback (Queue)
    const enqueueAudio = (audioData) => {
        audioQueueRef.current.push(audioData);
        if (!isPlayingRef.current) {
            playNextChunk();
        }
    };

    const playNextChunk = () => {
        if (audioQueueRef.current.length === 0) {
            isPlayingRef.current = false;
            setIsSpeaking(false);
            return;
        }

        isPlayingRef.current = true;
        setIsSpeaking(true);

        const audioData = audioQueueRef.current.shift();
        const buffer = audioContextRef.current.createBuffer(1, audioData.length, 24000);
        buffer.getChannelData(0).set(audioData);

        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        source.onended = playNextChunk;
        source.start();
    };

    const disconnect = () => {
        wsRef.current?.close();
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        audioInputProcessorRef.current?.disconnect();
        audioContextRef.current?.close();
        setIsConnected(false);
    };

    return { connect, disconnect, isConnected, isSpeaking };
};