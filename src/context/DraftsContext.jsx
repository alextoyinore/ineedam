import React, { createContext, useContext, useState, useEffect } from 'react';

const DraftsContext = createContext();

export const DraftsProvider = ({ children }) => {
    const [drafts, setDrafts] = useState(() => {
        const saved = localStorage.getItem('user_drafts');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('user_drafts', JSON.stringify(drafts));
    }, [drafts]);

    const saveDraft = (draft) => {
        const newDraft = { ...draft, id: Date.now().toString(), savedAt: new Date().toISOString() };
        setDrafts(prev => [newDraft, ...prev]);
    };

    const deleteDraft = (draftId) => {
        setDrafts(prev => prev.filter(d => d.id !== draftId));
    };

    const clearDrafts = () => setDrafts([]);

    return (
        <DraftsContext.Provider value={{ drafts, saveDraft, deleteDraft, clearDrafts }}>
            {children}
        </DraftsContext.Provider>
    );
};

export const useDrafts = () => {
    const context = useContext(DraftsContext);
    if (!context) throw new Error('useDrafts must be used within a DraftsProvider');
    return context;
};
