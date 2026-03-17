import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi;

// Simple in-memory cache to avoid refetching the same URL
const previewCache = new Map();

/**
 * Extracts the first URL from a text string and fetches its Open Graph preview.
 * Returns { preview, loading, url }.
 */
export const useLinkPreview = (text) => {
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const abortRef = useRef(null);

    // Extract first URL from text
    const url = (() => {
        if (!text || typeof text !== 'string') return null;
        const matches = text.match(URL_REGEX);
        return matches?.[0] || null;
    })();

    useEffect(() => {
        if (!url) {
            setPreview(null);
            setLoading(false);
            return;
        }

        // Return cached result immediately
        if (previewCache.has(url)) {
            setPreview(previewCache.get(url));
            setLoading(false);
            return;
        }

        // Abort any previous fetch
        if (abortRef.current) abortRef.current = false;
        const currentFetch = {};
        abortRef.current = currentFetch;

        setLoading(true);
        setPreview(null);

        const fetchPreview = async () => {
            try {
                const { data, error } = await supabase.functions.invoke('link-preview', {
                    body: { url }
                });

                if (currentFetch !== abortRef.current) return; // stale
                if (error || data?.error || !data?.title) {
                    setPreview(null);
                } else {
                    previewCache.set(url, data);
                    setPreview(data);
                }
            } catch {
                if (currentFetch === abortRef.current) setPreview(null);
            } finally {
                if (currentFetch === abortRef.current) setLoading(false);
            }
        };

        // Small debounce so we don't fire on every keystroke
        const timer = setTimeout(fetchPreview, 500);
        return () => {
            clearTimeout(timer);
            abortRef.current = null;
        };
    }, [url]);

    return { preview, loading, url };
};
