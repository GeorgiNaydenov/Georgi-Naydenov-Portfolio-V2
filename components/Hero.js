/**
 * @module Hero
 * @description Full hero section (photo, bio, certs, category descriptions, stats, links)
 * and compact sticky bar. Two render modes based on isVisible prop.
 * @agent Component Developer (Agent 3)
 */
import React from 'react';
import { Linkedin, Github, Download, ChevronUp, ChevronDown, FileText } from 'lucide-react';
import { CountUp } from './CountUp.js';

// Detect base URL the same way data-loader does
const REPO = '/Georgi-Naydenov-Portfolio';
const BASE = (typeof window !== 'undefined' && window.location.pathname.startsWith(REPO))
    ? REPO : '';

// Certification badge styles
const CERT_COLORS = {
    'CBAP®':              'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700',
    'PMP®':               'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
    'TOGAF® EA Practitioner': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700'
};

// Stats row config
const STAT_CONFIG = [
    { key: 'artifacts',   label: 'Artifacts',    border: 'border-indigo-100 dark:border-slate-700',  numColor: 'text-indigo-600 dark:text-indigo-400' },
    { key: 'articles',    label: 'Articles',     border: 'border-emerald-100 dark:border-slate-700', numColor: 'text-emerald-600 dark:text-emerald-400' },
    { key: 'posts',       label: 'Posts',        border: 'border-blue-100 dark:border-slate-700',    numColor: 'text-blue-600 dark:text-blue-400' },
    { key: 'appearances', label: 'Appearances',  border: 'border-purple-100 dark:border-slate-700',  numColor: 'text-purple-600 dark:text-purple-400' }
];

// Category description grid entries (labels match original)
const CATEGORY_LABELS = {
    artifacts:   'Artifacts',
    articles:    'Articles',
    posts:       'Posts',
    appearances: 'Public Appearances'
};

export const Hero = ({ config, counts, isVisible, onToggle, onStatClick }) => {
    if (!config) return null;

    const profileSrc = `${BASE}/assets/profile.jpg`;

    // ── Compact sticky bar ────────────────────────────────────────────────────
    if (!isVisible) {
        return React.createElement('div', {
            className: [
                'sticky top-[57px] z-30 w-full',
                'bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm',
                'border-b border-slate-200 dark:border-slate-700',
                'shadow-sm animate-fade-in-down'
            ].join(' ')
        },
            React.createElement('div', {
                className: 'max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-4'
            },
                // Photo + name + title
                React.createElement('div', { className: 'flex items-center gap-3 min-w-0' },
                    React.createElement('img', {
                        src: profileSrc,
                        alt: config.name,
                        className: 'w-8 h-8 rounded-full object-cover shrink-0 border-2 border-white dark:border-slate-700 shadow-sm'
                    }),
                    React.createElement('span', {
                        className: 'font-semibold text-slate-800 dark:text-slate-100 text-sm truncate'
                    }, config.name),
                    React.createElement('span', {
                        className: 'hidden sm:block text-xs text-slate-400 dark:text-slate-500 truncate'
                    }, config.title)
                ),

                // Links + expand button
                React.createElement('div', { className: 'flex items-center gap-2 shrink-0' },
                    React.createElement('a', {
                        href: config.links && config.links.linkedin,
                        target: '_blank', rel: 'noopener noreferrer',
                        className: 'p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors',
                        'aria-label': 'LinkedIn'
                    }, React.createElement(Linkedin, { size: 15 })),

                    React.createElement('a', {
                        href: config.links && config.links.github,
                        target: '_blank', rel: 'noopener noreferrer',
                        className: 'p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors',
                        'aria-label': 'GitHub'
                    }, React.createElement(Github, { size: 15 })),

                    React.createElement('button', {
                        onClick: onToggle,
                        className: [
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
                            'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
                            'hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors'
                        ].join(' ')
                    },
                        React.createElement(ChevronDown, { size: 13 }),
                        React.createElement('span', { className: 'hidden sm:inline' }, 'Show Stats & Bio')
                    )
                )
            )
        );
    }

    // ── Full hero ─────────────────────────────────────────────────────────────
    return React.createElement('section', {
        className: 'relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800'
    },
        // Subtle background pattern
        React.createElement('div', {
            className: 'absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none',
            style: { backgroundImage: `url(${BASE}/assets/hero-pattern.svg)` }
        }),

        React.createElement('div', {
            className: 'relative max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-0'
        },

            // ── Main bio row ─────────────────────────────────────────────────
            React.createElement('div', {
                className: 'flex flex-col lg:flex-row gap-10 items-center lg:items-start mb-10'
            },

                // LEFT: photo + text
                React.createElement('div', { className: 'flex-1 min-w-0' },

                    // Photo + name/title (mobile: stacked, sm+: side by side)
                    React.createElement('div', {
                        className: 'flex flex-col sm:flex-row sm:items-center gap-5 mb-6 animate-fade-in-right'
                    },
                        // Circular profile photo
                        React.createElement('img', {
                            src: profileSrc,
                            alt: config.name,
                            className: [
                                'w-28 h-28 rounded-full object-cover shrink-0',
                                'border-4 border-white dark:border-slate-700',
                                'shadow-lg ring-2 ring-slate-100 dark:ring-slate-700'
                            ].join(' ')
                        }),

                        React.createElement('div', null,
                            React.createElement('h2', {
                                className: 'text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1'
                            }, config.name),
                            React.createElement('p', {
                                className: 'text-base text-slate-600 dark:text-slate-400 mb-3'
                            }, config.title),

                            // Cert badges
                            config.certifications && React.createElement('div', {
                                className: 'flex flex-wrap gap-2'
                            },
                                ...config.certifications.map(cert =>
                                    React.createElement('span', {
                                        key: cert,
                                        className: `inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${CERT_COLORS[cert] || 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200'}`
                                    }, cert)
                                )
                            )
                        )
                    ),

                    // Welcome text
                    React.createElement('p', {
                        className: 'text-base text-slate-600 dark:text-slate-300 mb-5 leading-relaxed stagger-item animate-fade-in-up delay-200'
                    }, config.bio),

                    // 2-column category descriptions (from original)
                    config.categoryDescriptions && React.createElement('div', {
                        className: 'grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6 stagger-item animate-fade-in-up delay-200'
                    },
                        ...Object.entries(config.categoryDescriptions).map(([key, desc]) =>
                            React.createElement('div', {
                                key,
                                className: 'text-slate-600 dark:text-slate-400 leading-relaxed'
                            },
                                React.createElement('strong', {
                                    className: 'text-slate-900 dark:text-slate-100 font-semibold'
                                }, (CATEGORY_LABELS[key] || key) + ': '),
                                desc
                            )
                        )
                    ),

                    // Action links
                    React.createElement('div', {
                        className: 'flex flex-wrap items-center gap-3 stagger-item animate-fade-in-up delay-300'
                    },
                        React.createElement('a', {
                            href: config.links && config.links.linkedin,
                            target: '_blank', rel: 'noopener noreferrer',
                            className: 'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm hover:shadow-md'
                        },
                            React.createElement(Linkedin, { size: 16 }),
                            'Connect on LinkedIn'
                        ),
                        React.createElement('a', {
                            href: config.links && config.links.github,
                            target: '_blank', rel: 'noopener noreferrer',
                            className: 'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 transition-colors'
                        },
                            React.createElement(Github, { size: 16 }),
                            'GitHub'
                        ),
                        config.links && config.links.cv && React.createElement('a', {
                            href: config.links.cv,
                            target: '_blank', rel: 'noopener noreferrer',
                            className: 'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-600 hover:border-slate-400 text-slate-700 dark:text-slate-300 transition-colors'
                        },
                            React.createElement(FileText, { size: 16 }),
                            'View CV'
                        )
                    )
                ),

                // RIGHT: stat boxes
                counts && React.createElement('div', {
                    className: 'w-full lg:w-auto shrink-0 stagger-item animate-fade-in-up delay-300'
                },
                    React.createElement('div', {
                        className: 'bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-shadow duration-300'
                    },
                        React.createElement('h3', {
                            className: 'text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 text-center'
                        }, 'Library Stats'),

                        React.createElement('div', { className: 'grid grid-cols-2 gap-3' },
                            ...STAT_CONFIG.map(stat =>
                                React.createElement('button', {
                                    key: stat.key,
                                    onClick: () => onStatClick && onStatClick(stat.key),
                                    className: [
                                        'group flex flex-col items-center justify-center',
                                        'p-4 sm:p-5 rounded-2xl shadow-sm border',
                                        'bg-white dark:bg-slate-800',
                                        stat.border,
                                        'hover:scale-105 hover:shadow-md transition-all duration-300 cursor-pointer'
                                    ].join(' ')
                                },
                                    React.createElement('div', {
                                        className: `text-3xl font-black tabular-nums ${stat.numColor}`
                                    },
                                        React.createElement(CountUp, { end: counts[stat.key] || 0, duration: 1800 })
                                    ),
                                    React.createElement('div', {
                                        className: 'text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1'
                                    }, stat.label)
                                )
                            )
                        )
                    )
                )
            ),

            // ── Collapse bar ──────────────────────────────────────────────────
            React.createElement('button', {
                onClick: onToggle,
                className: [
                    'w-full flex items-center justify-center gap-2 py-2',
                    'bg-slate-100 dark:bg-slate-800',
                    'hover:bg-slate-200 dark:hover:bg-slate-700',
                    'border-t border-slate-200 dark:border-slate-700',
                    'text-[10px] font-bold uppercase tracking-widest',
                    'text-slate-400 dark:text-slate-500',
                    'hover:text-slate-600 dark:hover:text-slate-300',
                    'transition-colors group cursor-pointer'
                ].join(' ')
            },
                'Hide Stats & Bio',
                React.createElement(ChevronUp, {
                    size: 13,
                    className: 'transition-transform duration-300 group-hover:rotate-180'
                })
            )
        )
    );
};

export default Hero;
