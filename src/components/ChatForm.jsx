import React, { useState } from 'react';

const ChatForm = ({ onSubmit, loading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!input.trim() || loading) return;
    
    const success = await onSubmit(input);
    if (success) {
      setInput("");
    }
  };

  const handleChange = (event) => {
    setInput(event.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={input}
        onChange={handleChange}
        placeholder="Digite sua mensagem..."
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Submit'}
      </button>
    </form>
  );
};

export default ChatForm;