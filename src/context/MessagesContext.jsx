import React, { createContext, useContext, useState, useEffect } from 'react';

const MessagesContext = createContext();

export const MessagesProvider = ({ children }) => {
    const [threads, setThreads] = useState(() => {
        const saved = localStorage.getItem('user_messages');
        return saved ? JSON.parse(saved) : [
            {
                id: 't1',
                withUser: 'Sarah J.',
                lastMessage: 'Is the budget firm for the MVP?',
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                unread: true,
                messages: [
                    { id: 'm1', sender: 'Sarah J.', text: 'I saw your post about the developer.', timestamp: new Date(Date.now() - 7500000).toISOString() },
                    { id: 'm2', sender: 'Sarah J.', text: 'Is the budget firm for the MVP?', timestamp: new Date(Date.now() - 7200000).toISOString() }
                ]
            }
        ];
    });

    useEffect(() => {
        localStorage.setItem('user_messages', JSON.stringify(threads));
    }, [threads]);

    const sendMessage = (userId, text) => {
        setThreads(prev => {
            const threadIndex = prev.findIndex(t => t.withUser === userId);
            const newMessage = {
                id: Date.now().toString(),
                sender: 'Me',
                text,
                timestamp: new Date().toISOString()
            };

            if (threadIndex > -1) {
                const updatedThreads = [...prev];
                updatedThreads[threadIndex] = {
                    ...updatedThreads[threadIndex],
                    lastMessage: text,
                    timestamp: newMessage.timestamp,
                    messages: [...updatedThreads[threadIndex].messages, newMessage],
                    unread: false
                };
                return updatedThreads;
            } else {
                return [{
                    id: 't' + Date.now(),
                    withUser: userId,
                    lastMessage: text,
                    timestamp: newMessage.timestamp,
                    unread: false,
                    messages: [newMessage]
                }, ...prev];
            }
        });
    };

    const markThreadAsRead = (threadId) => {
        setThreads(prev => prev.map(t => t.id === threadId ? { ...t, unread: false } : t));
    };

    const unreadThreadsCount = threads.filter(t => t.unread).length;

    return (
        <MessagesContext.Provider value={{ threads, sendMessage, markThreadAsRead, unreadThreadsCount }}>
            {children}
        </MessagesContext.Provider>
    );
};

export const useMessages = () => {
    const context = useContext(MessagesContext);
    if (!context) throw new Error('useMessages must be used within a MessagesProvider');
    return context;
};
