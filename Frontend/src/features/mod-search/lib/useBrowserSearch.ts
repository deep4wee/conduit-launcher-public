import { useState, useEffect, useRef } from 'react';
import { useBrowserStore } from '../model/browserStore';

export function useBrowserSearch() {
    const storeQuery = useBrowserStore(state => state.query);
    const setSearchParam = useBrowserStore(state => state.setSearchParam);
    
    const [query, setQuery] = useState(storeQuery);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Debounce: не відправляємо запит миттєво при кожному натисканні клавіші
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query !== storeQuery) {
                setSearchParam('query', query);
            }
        }, 500); 

        return () => clearTimeout(timer);
    }, [query, storeQuery, setSearchParam]);

    return { query, setQuery, searchInputRef };
}
    