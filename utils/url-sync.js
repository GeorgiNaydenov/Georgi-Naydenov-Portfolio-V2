/**
 * @module url-sync
 * @description URL state synchronization for filter persistence.
 * @agent Component Developer (Agent 3)
 */

/**
 * Read filter state from URL search params.
 * @returns {Object} Filter state
 */
export function readFiltersFromURL() {
    try {
        const params = new URLSearchParams(window.location.search);
        return {
            activeCategory: params.get('category') || 'artifacts',
            activeSection: params.get('section') || 'all',
            activePlatform: params.get('platform') || 'all',
            activeTopic: params.get('topic') || 'all',
            searchQuery: params.get('q') || ''
        };
    } catch (e) {
        return {
            activeCategory: 'artifacts',
            activeSection: 'all',
            activePlatform: 'all',
            activeTopic: 'all',
            searchQuery: ''
        };
    }
}

/**
 * Write filter state to URL search params (no page reload).
 * @param {Object} filters - Current filter state
 */
export function writeFiltersToURL(filters) {
    try {
        const { activeCategory, activeSection, activePlatform, activeTopic, searchQuery } = filters;
        const params = new URLSearchParams();

        if (activeCategory !== 'artifacts') params.set('category', activeCategory);
        if (activeSection !== 'all') params.set('section', activeSection);
        if (activePlatform !== 'all') params.set('platform', activePlatform);
        if (activeTopic !== 'all') params.set('topic', activeTopic);
        if (searchQuery) params.set('q', searchQuery);

        const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '') + window.location.hash;
        window.history.replaceState({}, '', newUrl);
    } catch (e) {
        console.warn('URL sync disabled in this environment');
    }
}
