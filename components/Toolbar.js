/**
 * @module Toolbar
 * @description Search input, platform toggle, section pills, subcategory topic chips.
 * @agent Component Developer (Agent 3)
 */
import React from 'react';
import { Search, X } from 'lucide-react';
import { ScrollableTabs } from './ScrollableTabs.js';
import { ClaudeIcon, NotebookLMIcon } from './PlatformIcons.js';

export const Toolbar = ({
    activeCategory,
    activeSection,
    activePlatform,
    activeTopic,
    searchQuery,
    availableTopics,
    sections,
    sectionTopicLabels,
    filteredCount,
    onSectionChange,
    onPlatformChange,
    onTopicChange,
    onSearchChange
}) => {
    const showSections = activeCategory === 'artifacts';
    const showPlatformToggle = activeCategory === 'artifacts' && activeSection === 'ai-prototypes';
    const showTopics = availableTopics && availableTopics.length > 0;

    const sectionTabLabel = sectionTopicLabels
        ? (sectionTopicLabels[activeSection] || 'All Topics')
        : 'All Topics';

    return React.createElement('div', {
        className: 'space-y-3 mb-6'
    },

        // Row 1: Search bar + result count
        React.createElement('div', { className: 'flex items-center gap-3' },

            // Search input
            React.createElement('div', { className: 'relative flex-1' },
                React.createElement(Search, {
                    size: 16,
                    className: 'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none'
                }),
                React.createElement('input', {
                    type: 'text',
                    placeholder: 'Search portfolio…',
                    value: searchQuery,
                    onInput: (e) => onSearchChange(e.target.value),
                    onChange: (e) => onSearchChange(e.target.value),
                    className: [
                        'w-full pl-9 pr-9 py-2.5 rounded-xl text-sm',
                        'bg-white dark:bg-slate-800',
                        'border border-slate-200 dark:border-slate-700',
                        'text-slate-800 dark:text-slate-100',
                        'placeholder-slate-400 dark:placeholder-slate-500',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        'transition-all duration-200'
                    ].join(' ')
                }),
                searchQuery && React.createElement('button', {
                    onClick: () => onSearchChange(''),
                    className: 'absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors',
                    'aria-label': 'Clear search'
                },
                    React.createElement(X, { size: 15 })
                )
            ),

            // Result count badge
            filteredCount !== undefined && React.createElement('span', {
                className: 'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }, `${filteredCount} item${filteredCount !== 1 ? 's' : ''}`)
        ),

        // Row 2: Section pills (artifacts only)
        showSections && React.createElement(ScrollableTabs, null,
            ...sections.map(section =>
                React.createElement('button', {
                    key: section.id,
                    onClick: () => onSectionChange(section.id),
                    className: [
                        'shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap',
                        'transition-all duration-200',
                        activeSection === section.id
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400'
                    ].join(' ')
                }, section.label)
            )
        ),

        // Row 3: Platform toggle (ai-prototypes only)
        showPlatformToggle && React.createElement('div', {
            className: 'flex items-center gap-2'
        },
            React.createElement('span', {
                className: 'text-xs text-slate-500 dark:text-slate-400 font-medium mr-1'
            }, 'Platform:'),
            ['all', 'claude', 'notebooklm'].map(p =>
                React.createElement('button', {
                    key: p,
                    onClick: () => onPlatformChange(p),
                    className: [
                        'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap',
                        'transition-all duration-200',
                        activePlatform === p
                            ? p === 'claude'
                                ? 'bg-orange-500 text-white'
                                : p === 'notebooklm'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-slate-700 dark:bg-slate-200 text-white dark:text-slate-900'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                    ].join(' ')
                },
                    p === 'all'         ? 'All'
                    : p === 'claude'    ? React.createElement(React.Fragment, null,
                        React.createElement(ClaudeIcon, { size: 13 }), ' Claude')
                    : React.createElement(React.Fragment, null,
                        React.createElement(NotebookLMIcon, { size: 13,
                            color: activePlatform === 'notebooklm' ? 'currentColor' : '#16a34a' }),
                        ' NotebookLM')
                )
            )
        ),

        // Row 4: Topic chips
        showTopics && React.createElement(ScrollableTabs, null,
            // "All" chip first
            React.createElement('button', {
                key: 'all',
                onClick: () => onTopicChange('all'),
                className: [
                    'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap',
                    'transition-all duration-200',
                    activeTopic === 'all'
                        ? 'bg-slate-700 dark:bg-slate-200 text-white dark:text-slate-900'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400'
                ].join(' ')
            }, sectionTabLabel),

            ...availableTopics.map(topic =>
                React.createElement('button', {
                    key: topic.id,
                    onClick: () => onTopicChange(topic.id),
                    className: [
                        'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap',
                        'transition-all duration-200',
                        activeTopic === topic.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400'
                    ].join(' ')
                }, topic.label)
            )
        )
    );
};

export default Toolbar;
