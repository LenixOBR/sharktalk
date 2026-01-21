import React, { useState } from 'react';

function ChatForm({ onSubmit, loading, disabled }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSubmit(input);
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={loading || disabled}
        placeholder={disabled ? "Debate encerrado" : "Digite sua mensagem..."}
      />
      <button type="submit" disabled={loading || disabled}>
        {loading ? 'Enviando...' : 'Enviar'}
      </button>
    </form>
  );
}

export default ChatForm;