
import React, { useState, useRef, useEffect } from 'react';
import { type Customer, type Invoice, type ChatMessage } from '../../types';
import { getChatResponse } from '../../services/geminiService';

interface ChatAssistantProps {
  customers: Customer[];
  invoices: Invoice[];
}

const LoadingDots = () => (
    <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
    </div>
);

const ChatAssistant: React.FC<ChatAssistantProps> = ({ customers, invoices }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! How can I help you with your debtor data today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const responseText = await getChatResponse(newMessages, customers, invoices);
    const modelMessage: ChatMessage = { role: 'model', text: responseText };
    setMessages([...newMessages, modelMessage]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleSend();
    }
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-white mb-6">AI Assistant</h1>
      <div className="flex-grow bg-gray-800 rounded-2xl shadow-lg border border-gray-700/50 flex flex-col overflow-hidden">
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">AI</span>
                </div>
              )}
              <div className={`max-w-md p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-4">
               <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">AI</span>
                </div>
              <div className="max-w-md p-4 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-none">
                <LoadingDots />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <div className="flex items-center bg-gray-700 rounded-lg px-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about customers, invoices, or outstanding amounts..."
              className="w-full bg-transparent p-3 text-gray-200 placeholder-gray-500 focus:outline-none"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || input.trim() === ''}
              className="bg-blue-600 text-white rounded-md p-2 m-1 disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
