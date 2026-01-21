import React, { useState } from 'react';
import CopyrightFooter from './Footer';
import './SetupScreen.css'; // opcional

function SetupScreen({ onComplete }) {
  const [userName, setUserName] = useState('');
  const [debateTopic, setDebateTopic] = useState('');
  const [rounds, setRounds] = useState(3);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!userName.trim() || !debateTopic.trim()) {
      alert('Por favor, preencha todos os campos!');
      return;
    }
    
    // Passa os dados para o componente pai
    onComplete({ userName, debateTopic, rounds });
  };

  return (
    <div className="setup-container">
      <h1>🦈 Shark Talk - Configuração</h1>
      <form onSubmit={handleSubmit} className="setup-form">
        <div className="form-group">
          <label htmlFor="userName">Seu nome:</label>
          <input
            type="text"
            id="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Digite seu nome"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="debateTopic">Tema do debate:</label>
          <input
            type="text"
            id="debateTopic"
            value={debateTopic}
            onChange={(e) => setDebateTopic(e.target.value)}
            placeholder="Ex: Inteligência Artificial na Educação"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="rounds">Número de turnos:</label>
          <input
            type="number"
            id="rounds"
            value={rounds}
            onChange={(e) => setRounds(parseInt(e.target.value))}
            min="1"
            max="10"
            required
          />
        </div>

        <button type="submit" className="start-button">
          Iniciar Debate
        </button>
      </form>
      <CopyrightFooter />
    </div>
  );
}

export default SetupScreen;