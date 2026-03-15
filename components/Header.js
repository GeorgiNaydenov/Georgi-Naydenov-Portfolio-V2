/**
 * @module Header
 * @description Sticky navigation bar.
 * - Left:   circular profile photo + name
 * - Centre: category tabs + Blog, with animated sliding-underline hover (no external lib)
 * - Right:  CV button + dark mode toggle
 * @agent Component Developer (Agent 3)
 */
import React, { useState, useRef, useCallback } from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react';

const REPO = '/Georgi-Naydenov-Portfolio';
const BASE = (typeof window !== 'undefined' && window.location.pathname.startsWith(REPO))
    ? REPO : '';

// ── Animated sliding-underline hook ──────────────────────────────────────────
// Tracks a single absolutely-positioned indicator that glides between items.

function useSlider() {
    const navRef = useRef(null);
    const [ind, setInd] = useState({ left: 0, width: 0, visible: false });

    const onEnter = useCallback((e) => {
        const nav = navRef.current;
        if (!nav) return;
        const nr = nav.getBoundingClientRect();
        const er = e.currentTarget.getBoundingClientRect();
        setInd({ left: er.left - nr.left, width: er.width, visible: true });
    }, []);

    const onLeave = useCallback(() => {
        setInd(p => ({ ...p, visible: false }));
    }, []);

    return { navRef, ind, onEnter, onLeave };
}

// ── Header ────────────────────────────────────────────────────────────────────

export const Header = ({
    categories,
    activeCategory,
    isDarkMode,
    onCategoryChange,
    onDarkModeToggle,
    config
}) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { navRef, ind, onEnter, onLeave } = useSlider();

    const cvUrl    = config && config.links && config.links.cv;
    const navItems = categories || [];

    return React.createElement('header', {
        className: [
            'sticky top-0 z-40 w-full',
            'bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm',
            'border-b border-slate-200 dark:border-slate-800 shadow-sm'
        ].join(' ')
    },
        React.createElement('div', { className: 'max-w-7xl mx-auto px-4 sm:px-6' },

            React.createElement('div', { className: 'flex items-center justify-between h-14 gap-3' },

                // ── LEFT: photo + name ──────────────────────────────────────
                React.createElement('a', {
                    href: `${BASE}/`,
                    className: 'flex items-center gap-2.5 shrink-0 group'
                },
                    React.createElement('div', {
                        className: 'w-8 h-8 rounded-full overflow-hidden shrink-0 border-2 border-slate-200 dark:border-slate-600 shadow-sm group-hover:border-blue-400 transition-colors'
                    },
                        React.createElement('img', {
                            src: `${BASE}/assets/profile.jpg`,
                            alt: config ? config.name : 'Georgi Naydenov',
                            width: 32, height: 32,
                            className: 'w-full h-full object-cover',
                            style: { objectPosition: 'center 12%' }
                        })
                    ),
                    React.createElement('span', {
                        className: 'hidden sm:inline text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'
                    }, config ? config.name : 'Portfolio')
                ),

                // ── CENTRE: animated nav (desktop) ──────────────────────────
                React.createElement('nav', {
                    ref: navRef,
                    onMouseLeave: onLeave,
                    className: 'hidden md:flex relative items-center flex-1 justify-center',
                    'aria-label': 'Main navigation'
                },
                    // Sliding underline indicator
                    React.createElement('span', {
                        'aria-hidden': 'true',
                        style: {
                            position: 'absolute',
                            bottom: 0,
                            left: ind.left,
                            width: ind.width,
                            height: 2,
                            borderRadius: 2,
                            background: '#2563eb',
                            opacity: ind.visible ? 1 : 0,
                            transition: 'left .16s cubic-bezier(.4,0,.2,1), width .16s cubic-bezier(.4,0,.2,1), opacity .12s',
                            pointerEvents: 'none'
                        }
                    }),

                    // Category buttons — text only, no icons
                    ...navItems.map(cat => {
                        const isActive = activeCategory === cat.id;
                        return React.createElement('button', {
                            key: cat.id,
                            onClick: () => onCategoryChange(cat.id),
                            onMouseEnter: onEnter,
                            className: [
                                'flex items-center px-3 py-2 rounded-lg text-sm font-medium',
                                'transition-colors duration-150 whitespace-nowrap',
                                isActive
                                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            ].join(' ')
                        }, cat.label);
                    }),

                    // Blog link — part of the centre nav
                    React.createElement('a', {
                        href: `${BASE}/blog/`,
                        onMouseEnter: onEnter,
                        className: [
                            'flex items-center px-3 py-2 rounded-lg text-sm font-medium',
                            'transition-colors duration-150 whitespace-nowrap',
                            'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        ].join(' ')
                    }, 'Blog')
                ),

                // ── RIGHT: CV + dark mode ────────────────────────────────────
                React.createElement('div', { className: 'flex items-center gap-1.5 shrink-0' },

                    cvUrl && React.createElement('a', {
                        href: cvUrl,
                        target: '_blank',
                        rel: 'noopener noreferrer',
                        className: [
                            'hidden sm:flex items-center px-3 py-1.5 rounded-lg text-sm font-medium',
                            'border border-slate-200 dark:border-slate-700',
                            'text-slate-600 dark:text-slate-300',
                            'hover:border-blue-400 dark:hover:border-blue-500',
                            'hover:text-blue-600 dark:hover:text-blue-400',
                            'transition-all duration-200'
                        ].join(' ')
                    }, 'CV'),

                    React.createElement('button', {
                        onClick: onDarkModeToggle,
                        className: [
                            'p-2 rounded-lg',
                            'text-slate-500 dark:text-slate-400',
                            'hover:text-slate-800 dark:hover:text-slate-200',
                            'hover:bg-slate-100 dark:hover:bg-slate-700',
                            'transition-all duration-200'
                        ].join(' '),
                        'aria-label': isDarkMode ? 'Light mode' : 'Dark mode'
                    },
                        isDarkMode ? React.createElement(Sun, { size: 18 }) : React.createElement(Moon, { size: 18 })
                    ),

                    React.createElement('button', {
                        onClick: () => setMobileOpen(o => !o),
                        className: [
                            'md:hidden p-2 rounded-lg',
                            'text-slate-500 dark:text-slate-400',
                            'hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
                        ].join(' '),
                        'aria-label': mobileOpen ? 'Close menu' : 'Open menu',
                        'aria-expanded': mobileOpen
                    },
                        mobileOpen ? React.createElement(X, { size: 20 }) : React.createElement(Menu, { size: 20 })
                    )
                )
            ),

            // ── Mobile menu ──────────────────────────────────────────────────
            mobileOpen && React.createElement('div', {
                className: 'md:hidden border-t border-slate-200 dark:border-slate-700 py-3 space-y-1 animate-fade-in-down'
            },
                ...navItems.map(cat => {
                    const isActive = activeCategory === cat.id;
                    return React.createElement('button', {
                        key: cat.id,
                        onClick: () => { onCategoryChange(cat.id); setMobileOpen(false); },
                        className: [
                            'w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors',
                            isActive
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        ].join(' ')
                    }, cat.label);
                }),
                React.createElement('a', {
                    href: `${BASE}/blog/`,
                    className: 'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors'
                }, 'Blog'),
                cvUrl && React.createElement('a', {
                    href: cvUrl, target: '_blank', rel: 'noopener noreferrer',
                    className: 'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors'
                }, 'View CV')
            )
        )
    );
};

export default Header;
