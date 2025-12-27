import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// API URL - environment variable for production, localhost for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const savedSessionId = localStorage.getItem('chatSessionId');
    if (savedSessionId) {
      setSessionId(savedSessionId);
      loadChatHistory(savedSessionId);
    } else {
      showWelcomeMessage();
    }
    inputRef.current?.focus();
  }, []);

  const showWelcomeMessage = () => {
    setMessages([{
      id: 'welcome',
      sender: 'ai',
      text: "👋 Hi! Welcome to TechGadgets Support. I can help with questions about products, shipping, returns, and more. What can I help you with?",
      timestamp: new Date().toISOString()
    }]);
  };

  const loadChatHistory = async (sid) => {
    try {
      const response = await fetch(`${API_URL}/api/chat/history?sessionId=${sid}`);
      if (response.ok) {
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        } else {
          showWelcomeMessage();
        }
      } else {
        localStorage.removeItem('chatSessionId');
        setSessionId(null);
        showWelcomeMessage();
      }
    } catch (err) {
      console.error('Failed to load history:', err);
      showWelcomeMessage();
    }
  };

  const sendMessage = async () => {
    const trimmedText = inputText.trim();
    if (!trimmedText) return;

    if (trimmedText.length > 2000) {
      setError('Message too long. Max 2000 characters.');
      return;
    }

    setInputText('');
    setError(null);

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmedText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmedText, sessionId })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.sessionId && data.sessionId !== sessionId) {
          setSessionId(data.sessionId);
          localStorage.setItem('chatSessionId', data.sessionId);
        }

        setMessages(prev => [...prev, {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.reply,
          timestamp: new Date().toISOString()
        }]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err) {
      console.error('Error:', err);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        sender: 'ai',
        text: "Sorry, I couldn't process that. Please try again.",
        timestamp: new Date().toISOString(),
        isError: true
      }]);
      setError('Failed to send. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = () => {
    localStorage.removeItem('chatSessionId');
    setSessionId(null);
    showWelcomeMessage();
    setError(null);
    inputRef.current?.focus();
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-info">
          <div className="bot-avatar">🤖</div>
          <div className="header-text">
            <h1>TechGadgets Support</h1>
            <span className="status">Online</span>
          </div>
        </div>
        <button className="new-chat-btn" onClick={startNewChat} title="Start new chat">
          ✨ New
        </button>
      </div>

      {error && <div className="error-banner">⚠️ {error}</div>}

      <div className="messages-container">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.sender === 'user' ? 'user-message' : 'ai-message'} ${msg.isError ? 'error-message' : ''}`}
          >
            {msg.sender === 'ai' && <div className="message-avatar">🤖</div>}
            <div className="message-content">
              <div className="message-text">{msg.text}</div>
              <div className="message-time">{formatTime(msg.timestamp)}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message ai-message">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={isLoading}
          maxLength={2000}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !inputText.trim()}
          className="send-btn"
        >
          {isLoading ? '⏳' : '📤'}
        </button>
      </div>

      <div className="chat-footer">
        <span>Powered by TechGadgets AI</span>
      </div>
    </div>
  );
}

export default App;
