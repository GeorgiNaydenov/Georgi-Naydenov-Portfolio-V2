/**
 * @module App
 * @description Root component. Owns all application state. Loads data. Composes all components.
 * @agent Component Developer (Agent 3)
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';

import { loadAll } from '../utils/data-loader.js';
import { filterPortfolio, getAvailableTopics } from '../utils/filter-engine.js';
import { readFiltersFromURL, writeFiltersToURL } from '../utils/url-sync.js';
import { getInitialTheme, applyTheme } from '../utils/theme.js';

import { ErrorBoundary } from './ErrorBoundary.js';
import { Toast } from './Toast.js';
import { Header } from './Header.js';
import { Hero } from './Hero.js';
import { Toolbar } from './Toolbar.js';
import { CardGrid } from './CardGrid.js';
import { ScrollToTop } from './ScrollToTop.js';
import { Footer } from './Footer.js';
import { ContentManager } from './ContentManager.js';

// ── App root ─────────────────────────────────────────────────────────────────

function App() {
    // ── Loading state
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState({ portfolio: [], categories: {}, config: {} });

    // ── Filter state (read initial values from URL)
    const urlFilters = readFiltersFromURL();
    const [activeCategory, setActiveCategory] = useState(urlFilters.activeCategory || 'artifacts');
    const [activeSection, setActiveSection]   = useState(urlFilters.activeSection   || 'all');
    const [activePlatform, setActivePlatform] = useState(urlFilters.activePlatform  || 'all');
    const [activeTopic, setActiveTopic]       = useState(urlFilters.activeTopic     || 'all');
    const [searchQuery, setSearchQuery]       = useState(urlFilters.searchQuery     || '');

    // ── UI state
    const [isHeroVisible, setIsHeroVisible] = useState(true);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '' });
    const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);
    const [gridKey, setGridKey] = useState(0); // forces animation reset on filter change

    const toastTimerRef = useRef(null);

    // ── Data loading ──────────────────────────────────────────────────────────

    useEffect(() => {
        loadAll()
            .then(({ portfolio, categories, config }) => {
                setData({ portfolio, categories, config });
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Failed to load portfolio data:', err);
                setIsLoading(false);
            });
    }, []);

    // ── Theme sync ────────────────────────────────────────────────────────────

    useEffect(() => {
        applyTheme(isDarkMode);
    }, [isDarkMode]);

    // ── URL sync ──────────────────────────────────────────────────────────────

    useEffect(() => {
        writeFiltersToURL({ activeCategory, activeSection, activePlatform, activeTopic, searchQuery });
    }, [activeCategory, activeSection, activePlatform, activeTopic, searchQuery]);

    // ── Scroll listener ───────────────────────────────────────────────────────

    useEffect(() => {
        const handleScroll = () => {
            const y = window.scrollY;
            setShowScrollTop(y > 400);
            // Collapse hero after scrolling 350px down
            if (y > 350 && isHeroVisible)  setIsHeroVisible(false);
            // Auto-restore hero when the user scrolls back near the top
            if (y < 80  && !isHeroVisible) setIsHeroVisible(true);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isHeroVisible]);

    // ── Toast event listener ──────────────────────────────────────────────────

    useEffect(() => {
        const handleToast = (e) => {
            const message = e.detail && e.detail.message ? e.detail.message : 'Done!';
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
            setToast({ visible: true, message });
            toastTimerRef.current = setTimeout(() => {
                setToast({ visible: false, message: '' });
            }, 3000);
        };
        window.addEventListener('show-toast', handleToast);
        return () => window.removeEventListener('show-toast', handleToast);
    }, []);

    // ── Deep-link scroll on mount ─────────────────────────────────────────────

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const itemId = params.get('item');
        if (itemId) {
            // Give React time to render, then scroll
            setTimeout(() => {
                const el = document.getElementById(`card-${itemId}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 600);
        }
    }, []);

    // ── Derived data ──────────────────────────────────────────────────────────

    const categories = data.categories.categories || [];
    const sections   = data.categories.sections   || [];
    const subCategoryLabels  = data.categories.subCategoryLabels  || {};
    const sectionTopicLabels = data.categories.sectionTopicLabels || {};
    const config = data.config;

    const filters = { activeCategory, activeSection, activePlatform, activeTopic, searchQuery };

    const filteredItems = filterPortfolio(data.portfolio, filters);
    const availableTopics = getAvailableTopics(data.portfolio, filters, subCategoryLabels);

    // Counts per category (for hero stats)
    const counts = {
        artifacts:   data.portfolio.filter(i => i.category === 'artifacts').length,
        articles:    data.portfolio.filter(i => i.category === 'articles').length,
        posts:       data.portfolio.filter(i => i.category === 'posts').length,
        appearances: data.portfolio.filter(i => i.category === 'appearances').length
    };

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleCategoryChange = useCallback((cat) => {
        setActiveCategory(cat);
        setActiveSection('all');
        setActivePlatform('all');
        setActiveTopic('all');
        setSearchQuery('');
        setGridKey(k => k + 1);
    }, []);

    const handleSectionChange = useCallback((sec) => {
        setActiveSection(sec);
        setActivePlatform('all');
        setActiveTopic('all');
        setGridKey(k => k + 1);
    }, []);

    const handlePlatformChange = useCallback((plat) => {
        setActivePlatform(plat);
        setActiveTopic('all');
        setGridKey(k => k + 1);
    }, []);

    const handleTopicChange = useCallback((topic) => {
        setActiveTopic(topic);
        setGridKey(k => k + 1);
    }, []);

    const handleSearchChange = useCallback((q) => {
        setSearchQuery(q);
        setGridKey(k => k + 1);
    }, []);

    const handleResetFilters = useCallback(() => {
        setActiveSection('all');
        setActivePlatform('all');
        setActiveTopic('all');
        setSearchQuery('');
        setGridKey(k => k + 1);
    }, []);

    const handleStatClick = useCallback((categoryId) => {
        handleCategoryChange(categoryId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [handleCategoryChange]);

    const handleScrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // ── Loading screen ────────────────────────────────────────────────────────

    if (isLoading) {
        return React.createElement('div', {
            className: 'min-h-screen flex items-center justify-center bg-white dark:bg-slate-900'
        },
            React.createElement('div', {
                className: 'flex flex-col items-center gap-4'
            },
                React.createElement('div', {
                    className: 'w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin'
                }),
                React.createElement('p', {
                    className: 'text-sm text-slate-500 dark:text-slate-400'
                }, 'Loading portfolio…')
            )
        );
    }

    // ── Main render ───────────────────────────────────────────────────────────

    return React.createElement(ErrorBoundary, null,
        React.createElement('div', {
            className: 'min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100'
        },
            // Toast notification
            React.createElement(Toast, { message: toast.message, isVisible: toast.visible }),

            // Header
            React.createElement(Header, {
                categories,
                activeCategory,
                isDarkMode,
                onCategoryChange: handleCategoryChange,
                onDarkModeToggle: () => setIsDarkMode(d => !d),
                config
            }),

            // Hero (full or compact)
            React.createElement(Hero, {
                config,
                counts,
                isVisible: isHeroVisible,
                onToggle: () => setIsHeroVisible(v => !v),
                onStatClick: handleStatClick
            }),

            // Main content
            React.createElement('main', {
                className: 'max-w-7xl mx-auto px-4 sm:px-6 py-6'
            },
                // Toolbar
                React.createElement(Toolbar, {
                    activeCategory,
                    activeSection,
                    activePlatform,
                    activeTopic,
                    searchQuery,
                    availableTopics,
                    sections,
                    sectionTopicLabels,
                    filteredCount: filteredItems.length,
                    onSectionChange: handleSectionChange,
                    onPlatformChange: handlePlatformChange,
                    onTopicChange: handleTopicChange,
                    onSearchChange: handleSearchChange
                }),

                // Card grid
                React.createElement(CardGrid, {
                    items: filteredItems,
                    gridKey: String(gridKey),
                    onResetFilters: handleResetFilters
                })
            ),

            // Content manager (admin mode)
            React.createElement(ContentManager, {
                onSave: null,
                categories,
                sections
            }),

            // Scroll to top button
            React.createElement(ScrollToTop, {
                visible: showScrollTop,
                onClick: handleScrollToTop
            }),

            // Footer
            React.createElement(Footer)
        )
    );
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

const rootEl = document.getElementById('root');
if (rootEl) {
    const root = createRoot(rootEl);
    root.render(React.createElement(App));
}

export { App };
export default App;
