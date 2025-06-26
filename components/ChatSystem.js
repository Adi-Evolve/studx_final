'use client';

import { useState, useEffect, useRef } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function ChatSystem({ userId, listingId, sellerId, sellerName }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatId, setChatId] = useState(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        if (userId && sellerId && listingId) {
            initializeChat();
        }
    }, [userId, sellerId, listingId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!chatId) return;

        // Set up real-time subscription for messages
        const channel = supabase
            .channel(`chat-${chatId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `chat_id=eq.${chatId}`
                },
                (payload) => {
                    const newMessage = payload.new;
                    if (newMessage.sender_id !== userId) {
                        setMessages(prev => [...prev, newMessage]);
                        
                        // Show notification for new message
                        if (Notification.permission === 'granted') {
                            new Notification(`Message from ${sellerName}`, {
                                body: newMessage.content,
                                icon: '/favicon.ico'
                            });
                        }
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `chat_id=eq.${chatId}`
                },
                (payload) => {
                    const updatedMessage = payload.new;
                    setMessages(prev => prev.map(msg => 
                        msg.id === updatedMessage.id ? updatedMessage : msg
                    ));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [chatId, userId, sellerName]);

    const initializeChat = async () => {
        try {
            // Check if chat already exists
            let { data: existingChat, error } = await supabase
                .from('chats')
                .select('*')
                .eq('listing_id', listingId)
                .eq('buyer_id', userId)
                .eq('seller_id', sellerId)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error checking existing chat:', error);
                return;
            }

            if (!existingChat) {
                // Create new chat
                const { data: newChat, error: createError } = await supabase
                    .from('chats')
                    .insert({
                        listing_id: listingId,
                        buyer_id: userId,
                        seller_id: sellerId,
                        created_at: new Date().toISOString()
                    })
                    .select()
                    .single();

                if (createError) {
                    console.error('Error creating chat:', createError);
                    return;
                }

                existingChat = newChat;
            }

            setChatId(existingChat.id);
            loadMessages(existingChat.id);
        } catch (error) {
            console.error('Error initializing chat:', error);
        }
    };

    const loadMessages = async (chatId) => {
        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('chat_id', chatId)
                .order('created_at', { ascending: true });

            if (!error && data) {
                setMessages(data);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !chatId || isLoading) return;

        setIsLoading(true);
        try {
            const messageData = {
                chat_id: chatId,
                sender_id: userId,
                content: newMessage.trim(),
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('chat_messages')
                .insert(messageData)
                .select()
                .single();

            if (!error && data) {
                setMessages(prev => [...prev, data]);
                setNewMessage('');
                
                // Update chat's last message timestamp
                await supabase
                    .from('chats')
                    .update({ 
                        last_message_at: new Date().toISOString(),
                        last_message: newMessage.trim()
                    })
                    .eq('id', chatId);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (!userId || !sellerId || !listingId) return null;

    return (
        <div className={`fixed bottom-4 right-4 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 transition-all duration-300 ${
            isMinimized ? 'h-12' : 'h-96'
        }`}>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-primary-50 rounded-t-xl">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {sellerName?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-900 text-sm">{sellerName || 'Seller'}</h4>
                        <p className="text-xs text-gray-500">
                            {isTyping ? 'Typing...' : 'Online'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700"
                >
                    <svg className={`w-4 h-4 transition-transform ${isMinimized ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages Area */}
                    <div className="h-64 overflow-y-auto p-3 space-y-3">
                        {messages.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <p className="text-sm">Start the conversation!</p>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                                        message.sender_id === userId
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-gray-100 text-gray-900'
                                    }`}>
                                        <p>{message.content}</p>
                                        <p className={`text-xs mt-1 ${
                                            message.sender_id === userId ? 'text-primary-200' : 'text-gray-500'
                                        }`}>
                                            {formatTime(message.created_at)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-3 border-t border-gray-100">
                        <div className="flex gap-2">
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="flex-1 resize-none border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                rows="1"
                                disabled={isLoading}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!newMessage.trim() || isLoading}
                                className="btn-primary btn-sm px-3 py-2 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <div className="spinner w-4 h-4"></div>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}