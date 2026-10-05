import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import Chatbot from "../../components/chatbot/ChatBot";
import { ChatBotData } from "../../Data/ChatBotData";

export default function Bot() {
  const [isActive, setIsActive] = useState(false);
  const [message, setMessage] = useState("");
  const [botMessage, setBotMessage] = useState("");
  const [humanMessage, setHumanMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const onInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleInput = () => {
    if (!message.trim()) return;
    
    setHumanMessage(message);

    let welcome = ["hello|hi|hey|sup|yo|wassup|whats up|what's up|what's up?"];
    let words2 = new RegExp(welcome);

    if (words2.test(message)) {
      if(!isActive){
        setBotMessage("Typing...");

        setTimeout(() => {
          setBotMessage("Hello! I'm your Learning Assistant. How can I help you with sign language today? 🤖");
          setIsActive(true);
          setMessage("");
        }, 2000);
        toast.success("Welcome to the chatbot");
      }
      else{
          setHumanMessage("");
          setMessage("");
          toast.info("You are already active");
      }
    }

    let bye = ["bye|goodbye|see you later|see you"];
    let words3 = new RegExp(bye);
    if (words3.test(message)) {
      if (isActive) {
        setBotMessage("Typing...");

        setTimeout(() => {
          setBotMessage("Goodbye! Keep practicing your sign language skills. See you next time! 👋");
          setMessage("");
        }, 2000);
        toast.success("You have left the conversation");

        setTimeout(() => {
          setIsActive(false);
        }, 4000);
      } else {
        setHumanMessage("");
        setMessage("");
        toast.error("You already left the chat");
      }
    }

    // Check for help commands
    let help = ["help|what can you do|how can you help|assist|support"];
    let helpRegex = new RegExp(help);
    if (helpRegex.test(message)) {
      if (isActive) {
        setBotMessage("Typing...");
        setTimeout(() => {
          setBotMessage("I can help you with:\n• Learning sign language basics\n• Practicing different categories\n• Understanding sign language concepts\n• Providing learning tips\n• Answering questions about your progress\n\nJust ask me anything about sign language! 📚");
          setMessage("");
        }, 2000);
      } else {
        setHumanMessage("");
        setMessage("");
        toast.error("Please activate the chatbot first");
      }
    }

    // Check for learning commands
    let learning = ["learn|teach|show me|how to|sign for"];
    let learningRegex = new RegExp(learning);
    if (learningRegex.test(message)) {
      if (isActive) {
        setBotMessage("Typing...");
        setTimeout(() => {
          setBotMessage("Great! I'd love to help you learn sign language. You can:\n\n• Practice alphabet signs\n• Learn animal signs\n• Study traffic signs\n• Practice colors\n• Learn common phrases\n\nWhich category would you like to start with? 🎯");
          setMessage("");
        }, 2000);
      } else {
        setHumanMessage("");
        setMessage("");
        toast.error("Please activate the chatbot first");
      }
    }

    // Process ChatBotData responses
    {
      ChatBotData.map((data) => {
        let wordsData = data.words;
        let words = new RegExp(wordsData);
        if (words.test(message)) {
          if (isActive) {
            setBotMessage("Typing...");

            setTimeout(() => {
              setBotMessage(data.message);
              setMessage("");
            }, 2000);
          } else {
            setHumanMessage("");
            setMessage("");
            toast.error("Please activate the chatbot first");
          }
        }
      });
    }

    // Default response for unrecognized messages
    if (isActive && !welcome.test(message) && !bye.test(message) && !helpRegex.test(message) && !learningRegex.test(message)) {
      let hasResponse = false;
      ChatBotData.forEach((data) => {
        let words = new RegExp(data.words);
        if (words.test(message)) {
          hasResponse = true;
        }
      });
      
      if (!hasResponse) {
        setBotMessage("Typing...");
        setTimeout(() => {
          setBotMessage("I'm not sure I understand that. Could you try asking about sign language learning, or type 'help' to see what I can assist you with? 🤔");
          setMessage("");
        }, 2000);
      }
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    toast.info("Chatbot closed");
  };

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (!isMinimized) {
      toast.info("Chatbot minimized");
    }
  };

  if (!isVisible) {
    return (
      <div className="chatbot-closed">
        <button 
          className="reopen-chatbot-btn"
          onClick={() => setIsVisible(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
            zIndex: 1000
          }}
        >
          💬
        </button>
      </div>
    );
  }

  return (
    <>
      <ToastContainer
        position="bottom-center"
        theme="colored"
        autoClose={2000}
      />
      <Chatbot
        onInputChange={onInputChange}
        handleInput={handleInput}
        isActive={isActive}
        botMessage={botMessage}
        humanMessage={humanMessage}
        message={message}
        onClose={handleClose}
        isMinimized={isMinimized}
        onToggleMinimize={handleToggleMinimize}
      />
    </>
  );
}
