/**
 * @module filter-engine
 * @description Pure filtering and sorting logic for portfolio items.
 * @agent Component Developer (Agent 3)
 */

/**
 * Filter portfolio items based on current filter state.
 * @param {Array} data - Portfolio items from portfolio.json
 * @param {Object} filters - { activeCategory, activeSection, activePlatform, activeTopic, searchQuery }
 * @returns {Array} Filtered and sorted items
 */
export function filterPortfolio(data, filters) {
    const { activeCategory, activeSection, activePlatform, activeTopic, searchQuery } = filters;

    return data.filter(item => {
        // 1. Primary Category Filter
        if (item.category !== activeCategory) return false;

        // 2. Artifact-specific Filters
        if (activeCategory === 'artifacts') {
            if (activeSection !== 'all') {
                if (item.section !== activeSection) return false;
            }
            if (activeSection === 'ai-prototypes' || activeSection === 'all') {
                if (activePlatform !== 'all' && item.platform !== activePlatform) return false;
            }
            if (activeTopic !== 'all' && item.subCategory !== activeTopic) return false;
        }

        // 3. Search Query
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const titleMatch = item.title.toLowerCase().includes(q);
            const desc = typeof item.description === 'string' ? item.description.toLowerCase() : '';
            if (!titleMatch && !desc.includes(q)) return false;
        }

        return true;
    }).sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Get available subcategory topics for the current filter context.
 * @param {Array} data - Portfolio items
 * @param {Object} filters - Current filter state
 * @param {Object} subCategoryLabels - Label map from categories.json
 * @returns {Array} Array of { id, label } objects
 */
export function getAvailableTopics(data, filters, subCategoryLabels) {
    const { activeCategory, activeSection, activePlatform } = filters;

    const sectionItems = data.filter(d => {
        if (d.category !== activeCategory) return false;
        if (activeSection !== 'all' && d.section !== activeSection) return false;
        if ((activeSection === 'all' || activeSection === 'ai-prototypes') && activePlatform !== 'all') {
            if (d.platform !== activePlatform) return false;
        }
        return true;
    });

    const topics = [...new Set(sectionItems.map(d => d.subCategory).filter(Boolean))];
    return topics.map(t => ({
        id: t,
        label: subCategoryLabels[t] || t.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    })).sort((a, b) => a.label.localeCompare(b.label));
}
