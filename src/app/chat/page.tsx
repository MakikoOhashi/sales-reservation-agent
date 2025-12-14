"use client";

import { useState, useEffect, useRef } from 'react';

interface Message {
  sender: 'User' | 'AI';
  text: string;
}

export default function ChatPage() {
  const [inputValue, setInputValue] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([
    { sender: 'AI', text: 'Hello! How can I help you today?' },
    { sender: 'User', text: 'I need help with a sales reservation.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setIsLoading(true);

    // Add user message to chat history immediately
    setChatHistory(prev => [...prev, { sender: 'User', text: userMessage }]);
    setInputValue('');

    try {
      // Extract currentData from the last AI message if it exists
      let currentData = {};
      const lastAIMessages = chatHistory.filter(msg => msg.sender === 'AI').reverse();
      for (const aiMessage of lastAIMessages) {
        try {
          const parsedMessage = JSON.parse(aiMessage.text);
          if (parsedMessage.currentData) {
            currentData = parsedMessage.currentData;
            break;
          }
        } catch (e) {
          // Not JSON, continue
        }
      }

      // Send user input to Gemini API with currentData for state persistence
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          history: chatHistory.map(msg => ({ sender: msg.sender, text: msg.text })),
          currentData: currentData
        }),
      });

      const result = await response.json();

      let aiResponse = 'Sorry, I encountered an error processing your request.';
      let responseData = null;

      if (result.success && result.data) {
        // If Gemini returned JSON data, send it to register API
        const registerResponse = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(result.data),
        });

        const registerResult = await registerResponse.json();

        if (registerResult.success) {
          aiResponse = 'Data added successfully';
        } else {
          aiResponse = registerResult.message || 'Failed to add data';
        }
      } else if (result.success && result.message) {
        // Use regular message response from Gemini
        aiResponse = result.message;
      } else if (result.message) {
        aiResponse = result.message;
        // Store the full response data including currentData for state persistence
        responseData = result;
      }

      // Add AI response to chat history
      // If we have response data with currentData, store it as JSON for later parsing
      if (responseData && responseData.currentData) {
        setChatHistory(prev => [...prev, {
          sender: 'AI',
          text: JSON.stringify({
            message: aiResponse,
            currentData: responseData.currentData,
            missingFields: responseData.missingFields
          })
        }]);
      } else {
        setChatHistory(prev => [...prev, { sender: 'AI', text: aiResponse }]);
      }

    } catch (error) {
      console.error('Error:', error);
      // Add error message to chat history
      setChatHistory(prev => [...prev, { sender: 'AI', text: 'Failed to send message' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6 text-black dark:text-white">Chat</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 h-96 overflow-y-auto">
          <div className="space-y-4">
          {chatHistory.map((message, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${message.sender === 'AI' ? 'bg-blue-500' : 'bg-gray-500'}`}>
                {message.sender === 'AI' ? 'AI' : 'U'}
              </div>
              <div className="flex-1">
                {message.sender === 'AI' ? (
                  <pre className="text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                    {(() => {
                      try {
                        const parsed = JSON.parse(message.text);
                        return parsed.message || message.text;
                      } catch (e) {
                        return message.text;
                      }
                    })()}
                  </pre>
                ) : (
                  <p className="text-gray-800 dark:text-gray-200">{message.text}</p>
                )}
              </div>
            </div>
          ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </main>
    </div>
  );
}
