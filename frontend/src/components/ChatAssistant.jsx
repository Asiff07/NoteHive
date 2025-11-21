import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatAssistant = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi! I am your AI study assistant. Ask me anything about your notes or subjects!' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await axios.post('/chat', { prompt: input });
            const aiMessage = { role: 'assistant', content: res.data.response };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-50 hover:scale-105 active:scale-95"
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-80 md:w-[500px] h-[600px] bg-white/90 dark:bg-[#0c0c0c]/90 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 font-sans transition-colors">
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white flex items-center gap-2 shadow-md shrink-0">
                        <Sparkles size={20} />
                        <h3 className="font-bold">AI Assistant</h3>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[90%] p-4 rounded-2xl text-sm shadow-sm ${msg.role === 'user'
                                        ? 'bg-primary-600 text-white rounded-br-none'
                                        : 'bg-white dark:bg-[#0c0c0c] border border-gray-100 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-bl-none transition-colors'}
                  `}
                                >
                                    {msg.role === 'user' ? (
                                        msg.content
                                    ) : (
                                        <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5 prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-pre:p-2 prose-pre:rounded-lg dark:prose-invert">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    table: ({ node, ...props }) => (
                                                        <div className="overflow-x-auto my-2 border border-gray-200 dark:border-gray-600 rounded-lg">
                                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600" {...props} />
                                                        </div>
                                                    ),
                                                    thead: ({ node, ...props }) => <thead className="bg-gray-50 dark:bg-[#0c0c0c]" {...props} />,
                                                    th: ({ node, ...props }) => <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" {...props} />,
                                                    td: ({ node, ...props }) => <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700" {...props} />,
                                                    code: ({ node, inline, className, children, ...props }) => {
                                                        return inline ? (
                                                            <code className="bg-gray-100 dark:bg-[#0c0c0c] px-1 py-0.5 rounded text-pink-600 dark:text-pink-400 font-mono text-xs" {...props}>
                                                                {children}
                                                            </code>
                                                        ) : (
                                                            <code className="block whitespace-pre-wrap font-mono text-xs" {...props}>
                                                                {children}
                                                            </code>
                                                        );
                                                    }
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-[#0c0c0c] border border-gray-100 dark:border-gray-600 p-4 rounded-2xl rounded-bl-none shadow-sm transition-colors">
                                    <div className="flex gap-1.5">
                                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-75" />
                                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-150" />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-4 bg-white/80 dark:bg-[#0c0c0c]/80 border-t border-gray-100 dark:border-gray-700 backdrop-blur-sm shrink-0 transition-colors">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask something..."
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/80 dark:bg-[#0c0c0c] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm shadow-sm transition-all"
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="p-2.5 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default ChatAssistant;
