import { useEffect, useRef } from 'react';
import { useBrowserStore } from '@/features/mod-search/model/browserStore';

export function useBrowserSearch() {
    const store = useBrowserStore();
    const searchInputRef = useRef<HTMLInputElement>(null);
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            if (store.hasLoadedOnce) {
                // Викликаємо пошук через зміну параметра
                store.setSearchParam('offset', 0); 
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [store.query]); // Залежимо тільки від query

    return {
        query: store.query,
        setQuery: store.setQuery, // Просто оновлює стрічку, а useEffect робить запит
        searchInputRef
    };
}
            
    