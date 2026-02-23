import { useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook to handle infinite scrolling using IntersectionObserver.
 * @param {Function} callback - Function to call when target enters viewport.
 * @param {boolean} hasMore - Boolean to indicate if more data is available.
 * @param {boolean} loading - Boolean to indicate if a fetch is in progress.
 */
export const useInfiniteScroll = (callback, hasMore, loading) => {
    const observer = useRef();

    const lastElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                callback();
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore, callback]);

    return lastElementRef;
};
