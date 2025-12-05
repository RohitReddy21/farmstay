import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: 'Hi there! 👋 I\'m your FarmStay assistant. How can I help you today?' }
    ]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        // Add user message
        setMessages(prev => [...prev, { type: 'user', text: inputText }]);

        // Process response
        const userQuery = inputText.toLowerCase();
        let botResponse = "I'm not sure about that. You can contact us at support@farmstay.com for more help.";

        if (userQuery.includes('book') || userQuery.includes('reservation')) {
            botResponse = "To make a booking, simply browse our farms, select your dates, and click 'Book Now'. You'll need to be logged in.";
        } else if (userQuery.includes('cancel') || userQuery.includes('refund')) {
            botResponse = "You can cancel bookings from your 'My Bookings' page. Refunds are processed within 5-7 business days.";
        } else if (userQuery.includes('price') || userQuery.includes('cost')) {
            botResponse = "Prices vary by farm and season. You can filter farms by price range on our Explore page.";
        } else if (userQuery.includes('location') || userQuery.includes('where')) {
            botResponse = "We have farm stays across multiple locations! Use the location filter on the Explore page to find one near you.";
        } else if (userQuery.includes('contact') || userQuery.includes('support')) {
            botResponse = "You can reach our support team at support@farmstay.com or call us at +91 98765 43210.";
        } else if (userQuery.includes('hello') || userQuery.includes('hi')) {
            botResponse = "Hello! How can I assist you with your farm stay plans today?";
        }

        setTimeout(() => {
            setMessages(prev => [...prev, { type: 'bot', text: botResponse }]);
        }, 1000);

        setInputText('');
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-80 md:w-96 mb-4 overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col h-[500px]"
                    >
                        {/* Header */}
                        <div className="bg-primary p-4 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2">
                                <Bot size={24} />
                                <span className="font-bold">FarmStay Assistant</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl ${msg.type === 'user'
                                                ? 'bg-primary text-white rounded-tr-none'
                                                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-tl-none shadow-sm'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex gap-2">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 p-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none dark:bg-gray-700 dark:text-white"
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim()}
                                className="bg-primary text-white p-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors flex items-center justify-center"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </motion.button>
        </div>
    );
};

export default Chatbot;
