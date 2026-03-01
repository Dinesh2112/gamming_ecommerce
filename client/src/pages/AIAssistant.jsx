import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from '../axiosConfig';
import { UserContext } from '../context/UserContext';
import '../styles/AIAssistant.css';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { LucideMessageSquare, LucidePlusCircle, LucideHistory, LucideSend, LucideTerminal, LucideCpu, LucideGamepad2, LucideSparkles } from 'lucide-react';

const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useContext(UserContext);
  const [chatId, setChatId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initChat = async () => {
      if (!user) return;
      try {
        const historyRes = await axios.get('/api/ai/chat/history');
        setChatHistory(historyRes.data.chats || []);
        
        const chatRes = await axios.post('/api/ai/chat/initialize', {});
        setChatId(chatRes.data.chatId);
        
        if (chatRes.data.messages) {
          setMessages(chatRes.data.messages);
        } else {
          setMessages([{
            role: 'assistant',
            content: "SYSTEM ONLINE. I am your PC Building Intelligence. How can I assist with your deployment today?",
            timestamp: new Date().toISOString()
          }]);
        }
      } catch (err) {
        console.error(err);
        setError('UPLINK FAILURE: AI CORE UNREACHABLE');
      }
    };
    initChat();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    
    const userMessage = { role: 'user', content: input.trim(), timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);
    setIsTyping(true);
    
    try {
      const response = await axios.post('/api/ai/chat/message', { chatId, content: userMessage.content });
      const assistantMessage = {
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date().toISOString(),
        suggestedProducts: response.data.suggestedProducts || []
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setError('TRANSMISSION ERROR');
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  };

  if (!user) return <div className="ai-gate container"><h1>RESTRICTED ACCESS</h1><p>AI Core access requires pilot verification.</p><Link to="/login" className="neon-btn">LOGIN</Link></div>;

  return (
    <div className="ai-interface container">
      <div className="ai-sidebar glass">
        <div className="sidebar-header">
          <LucideTerminal size={20} />
          <span>COMM-LOGS</span>
        </div>
        <button className="new-chat-action glass" onClick={() => window.location.reload()}>
          <LucidePlusCircle size={18} /> NEW SESSION
        </button>
        <div className="history-list">
          {chatHistory.map(chat => (
            <div key={chat.id} className="history-item">
              <LucideMessageSquare size={14} />
              <span>{chat.title || 'Mission Log'}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="ai-main-terminal glass">
        <header className="terminal-header">
          <div className="status-indicator">
            <span className="pulse-dot"></span>
            ACTIVE-UPLINK: AI_CORE_v4.2
          </div>
          <h2 className="glitch-title" data-text="TACTICAL INTEL">TACTICAL INTEL</h2>
        </header>

        <div className="messages-viewport">
          {messages.map((msg, i) => (
            <div key={i} className={`msg-wrapper ${msg.role}`}>
              <div className="msg-bubble">
                {msg.role === 'assistant' && <div className="ai-token"><LucideSparkles size={12}/> CORE</div>}
                <ReactMarkdown>{msg.content}</ReactMarkdown>
                {msg.suggestedProducts?.length > 0 && (
                  <div className="intel-grid">
                    {msg.suggestedProducts.map(p => (
                      <Link to={`/product/${p.id}`} key={p.id} className="intel-p-card glass">
                        <img src={p.imageUrl} alt="" />
                        <div className="intel-meta">
                          <h6>{p.name}</h6>
                          <p>₹{p.price.toLocaleString()}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && <div className="typing-fx">SYNCING INTEL...</div>}
          <div ref={messagesEndRef} />
        </div>

        <form className="terminal-input" onSubmit={handleSendMessage}>
          <input 
            type="text" 
            placeholder="INPUT COMMAND OR INQUIRY..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSending}
          />
          <button type="submit" disabled={isSending || !input.trim()}>
            <LucideSend size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;