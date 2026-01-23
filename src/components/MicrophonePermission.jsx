import React, { useState, useEffect } from 'react';
import './MicrophonePermission.css';

function MicrophonePermission({ onPermissionGranted }) {
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'prompt', 'granted', 'denied'
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' });
      setPermissionStatus(result.state);
      
      result.onchange = () => {
        setPermissionStatus(result.state);
      };

      if (result.state === 'granted') {
        onPermissionGranted?.();
      }
    } catch (error) {
      console.log('API de permissões não disponível, tentando acesso direto');
    }
  };

  const requestPermission = async () => {
    setIsChecking(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Para o stream imediatamente após obter permissão
      stream.getTracks().forEach(track => track.stop());
      
      setPermissionStatus('granted');
      onPermissionGranted?.();
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      setPermissionStatus('denied');
    } finally {
      setIsChecking(false);
    }
  };

  if (permissionStatus === 'granted') {
    return null; // Não mostra nada se já tem permissão
  }

  return (
    <div className="mic-permission">
      {permissionStatus === 'denied' ? (
        <div className="permission-denied">
          <span className="icon">🚫</span>
          <h3>Permissão de Microfone Negada</h3>
          <p>
            Para usar o reconhecimento de voz, você precisa permitir o acesso ao microfone.
          </p>
          <ol className="permission-steps">
            <li>Clique no ícone de cadeado/informação na barra de endereços</li>
            <li>Encontre "Microfone" nas configurações</li>
            <li>Altere para "Permitir"</li>
            <li>Recarregue a página</li>
          </ol>
        </div>
      ) : (
        <div className="permission-prompt">
          <span className="icon">🎤</span>
          <h3>Permissão de Microfone Necessária</h3>
          <p>
            Este app precisa acessar seu microfone para o reconhecimento de voz.
          </p>
          <button 
            onClick={requestPermission}
            disabled={isChecking}
            className="permission-button"
          >
            {isChecking ? 'Aguardando...' : 'Permitir Acesso ao Microfone'}
          </button>
        </div>
      )}
    </div>
  );
}

export default MicrophonePermission;