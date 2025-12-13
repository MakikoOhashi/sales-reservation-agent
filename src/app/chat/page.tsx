"use client";

import { useState } from 'react';

export default function ChatPage() {
  const [inputValue, setInputValue] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    setIsLoading(true);
    setResponseMessage('');

    try {
      // Create JSON payload with fixed sample values
      const payload = {
        category: "Electronics",
        product: "Laptop",
        quantity: 1,
        date: new Date().toISOString(),
        notes: inputValue
      };

      // POST to API
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        setResponseMessage('Data received and stored successfully');
      } else {
        setResponseMessage(result.message || 'Error processing request');
      }
    } catch (error) {
      setResponseMessage('Failed to send message');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6 text-black dark:text-white">Chat</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">AI</div>
              <div className="flex-1">
                <p className="text-gray-800 dark:text-gray-200">Hello! How can I help you today?</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-sm font-medium">U</div>
              <div className="flex-1">
                <p className="text-gray-800 dark:text-gray-200">I need help with a sales reservation.</p>
              </div>
            </div>
            {responseMessage && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">AI</div>
                <div className="flex-1">
                  <p className="text-gray-800 dark:text-gray-200">{responseMessage}</p>
                </div>
              </div>
            )}
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
