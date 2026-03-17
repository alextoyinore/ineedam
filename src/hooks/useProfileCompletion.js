import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

const POPUP_INTERVAL = 3 * 60 * 60 * 1000; // 3 hours
const LAST_PROMPT_KEY = 'last_profile_completion_prompt';

export const useProfileCompletion = () => {
    const { profile, user } = useAuth();
    const [isPromptOpen, setIsPromptOpen] = useState(false);

    const completionItems = useMemo(() => {
        if (!profile) return [];
        return [
            { id: 'username', label: 'Set a username', completed: !!profile.username },
            { id: 'avatar', label: 'Upload an avatar', completed: !!profile.avatar_url },
            { id: 'bio', label: 'Add a bio', completed: !!profile.bio },
            { id: 'location', label: 'Set your location', completed: !!profile.location },
            { id: 'banner', label: 'Upload a banner', completed: !!profile.banner_url },
        ];
    }, [profile]);

    const completedCount = completionItems.filter(item => item.completed).length;
    const totalCount = completionItems.length;
    const isComplete = completedCount === totalCount;
    const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    useEffect(() => {
        if (!user || !profile || isComplete) return;

        const lastPrompt = localStorage.getItem(LAST_PROMPT_KEY);
        const now = Date.now();

        if (!lastPrompt || (now - parseInt(lastPrompt)) > POPUP_INTERVAL) {
            setIsPromptOpen(true);
            localStorage.setItem(LAST_PROMPT_KEY, now.toString());
        }
    }, [user, profile, isComplete]);

    return {
        completionItems,
        completedCount,
        totalCount,
        isComplete,
        completionPercentage,
        isPromptOpen,
        setIsPromptOpen
    };
};
