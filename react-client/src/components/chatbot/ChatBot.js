import React, { useState, useEffect, useRef } from 'react';
import './chatbot.css';
import { 
  BsDot, 
  BsThreeDots,
  BsEmojiSmile,
  BsMic,
  BsMicFill
} from 'react-icons/bs';
import { 
  FaPaperPlane, 
  FaUser,
  FaRobot,
  FaTimes,
  FaWindowMinimize
} from 'react-icons/fa';

export default function ChatBot({ 
  onInputChange, 
  handleInput, 
  isActive, 
  botMessage, 
  humanMessage, 
  message,
  onClose,
  isMinimized = false,
  onToggleMinimize
}) {
  const [isTyping, setIsTyping] = useState(false);
  const [messageHistory, setMessageHistory] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messageHistory, botMessage, humanMessage]);

  // Add messages to history
  useEffect(() => {
    if (botMessage && !messageHistory.some(msg => msg.text === botMessage && msg.type === 'bot')) {
      setMessageHistory(prev => [...prev, { text: botMessage, type: 'bot', timestamp: new Date() }]);
    }
    if (humanMessage && !messageHistory.some(msg => msg.text === humanMessage && msg.type === 'human')) {
      setMessageHistory(prev => [...prev, { text: humanMessage, type: 'human', timestamp: new Date() }]);
    }
  }, [botMessage, humanMessage]);

  // Simulate typing indicator
  useEffect(() => {
    if (botMessage && !messageHistory.some(msg => msg.text === botMessage)) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [botMessage]);

  const handleSendMessage = () => {
    if (message.trim()) {
      handleInput();
      setShowEmojiPicker(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recognition
    console.log('Voice input toggled:', !isRecording);
  };

  const addEmoji = (emoji) => {
    const newMessage = message + emoji;
    onInputChange({ target: { value: newMessage } });
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const quickReplies = [
    "Hello! 👋",
    "How can you help me?",
    "What can you teach me?",
    "Show me sign language",
    "I need help with learning"
  ];

  const handleQuickReply = (reply) => {
    onInputChange({ target: { value: reply } });
    handleSendMessage();
  };

  if (isMinimized) {
    return (
      <div className="chatbot-minimized" onClick={onToggleMinimize}>
                  <div className="minimized-content">
            <FaRobot className="minimized-icon" />
            <span className="minimized-text">Chat Assistant</span>
          <div className={`status-indicator ${isActive ? 'active' : 'inactive'}`}>
            <BsDot size={20} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='chatbot-container'>
      <div className='chatbot'>
        <div className='chatbot-wrapper'>
          {/* Header */}
          <div className='chatbot-header'>
            <div className='header-left'>
              <div className='bot-avatar'>
                <FaRobot className="bot-icon" />
              </div>
              <div className='bot-info'>
                <div className='bot-name'>Learning Assistant</div>
                <div className='bot-status'>
                  {isActive ? (
                    <span className='status-active'>
                      <BsDot size={16} /> Online
                    </span>
                  ) : (
                    <span className='status-inactive'>
                      <BsDot size={16} /> Offline
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className='header-actions'>
                             <button className='action-btn' onClick={onToggleMinimize}>
                 <FaWindowMinimize />
               </button>
              <button className='action-btn close-btn' onClick={onClose}>
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className='messages-container'>
            <div className='messages-wrapper'>
              {messageHistory.length === 0 && (
                <div className='welcome-message'>
                  <div className='welcome-icon'>
                    <FaRobot size={48} />
                  </div>
                  <h3>Welcome to Your Learning Assistant! 🤖</h3>
                  <p>I'm here to help you learn sign language and track your progress.</p>
                  <div className='quick-replies'>
                    {quickReplies.map((reply, index) => (
                      <button 
                        key={index} 
                        className='quick-reply-btn'
                        onClick={() => handleQuickReply(reply)}
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messageHistory.map((msg, index) => (
                <div key={index} className={`message ${msg.type}-message`}>
                  <div className='message-content'>
                                      <div className='message-avatar'>
                    {msg.type === 'bot' ? <FaRobot /> : <FaUser />}
                  </div>
                    <div className='message-bubble'>
                      <div className='message-text'>{msg.text}</div>
                      <div className='message-time'>{formatTime(msg.timestamp)}</div>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className='message bot-message'>
                  <div className='message-content'>
                    <div className='message-avatar'>
                      <FaRobot />
                    </div>
                    <div className='message-bubble typing'>
                      <div className='typing-indicator'>
                        <BsThreeDots size={20} />
                        <span>Typing...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className='input-container'>
            <div className='input-wrapper'>
              <div className='input-field'>
                <textarea
                  ref={inputRef}
                  value={message}
                  onChange={onInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder='Type your message here...'
                  rows={1}
                  className='message-input'
                />
                <div className='input-actions'>
                  <button 
                    className={`action-btn ${showEmojiPicker ? 'active' : ''}`}
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <BsEmojiSmile />
                  </button>
                  <button 
                    className={`action-btn ${isRecording ? 'recording' : ''}`}
                    onClick={handleVoiceInput}
                  >
                    {isRecording ? <BsMicFill /> : <BsMic />}
                  </button>
                </div>
              </div>
                              <button 
                  className='send-btn'
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                >
                  <FaPaperPlane />
                </button>
            </div>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className='emoji-picker'>
                <div className='emoji-grid'>
                  {['😊', '👍', '👋', '🎉', '💪', '🌟', '📚', '🎯', '🔥', '💡', '🤝', '🎨'].map((emoji, index) => (
                    <button 
                      key={index} 
                      className='emoji-btn'
                      onClick={() => addEmoji(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
