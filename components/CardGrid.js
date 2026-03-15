/**
 * @module CardGrid
 * @description Grid container that renders Card components or an empty state.
 * @agent Component Developer (Agent 3)
 */
import React from 'react';
import { Search, X } from 'lucide-react';
import { Card } from './Card.js';

const STAGGER_DELAYS = ['0ms', '50ms', '100ms', '150ms', '200ms', '250ms', '300ms', '350ms'];

export const CardGrid = ({ items, gridKey, onResetFilters }) => {
    // Empty state
    if (!items || items.length === 0) {
        return React.createElement('div', {
            className: 'flex flex-col items-center justify-center py-20 text-center'
        },
            React.createElement('div', {
                className: 'w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4'
            },
                React.createElement(Search, { size: 24, className: 'text-slate-400' })
            ),
            React.createElement('h3', {
                className: 'text-base font-semibold text-slate-700 dark:text-slate-200 mb-2'
            }, 'No items match your filters'),
            React.createElement('p', {
                className: 'text-sm text-slate-400 dark:text-slate-500 mb-6 max-w-xs'
            }, 'Try adjusting your search or removing some filters.'),
            onResetFilters && React.createElement('button', {
                onClick: onResetFilters,
                className: 'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors'
            },
                React.createElement(X, { size: 15 }),
                'Clear all filters'
            )
        );
    }

    return React.createElement('div', {
        key: gridKey,
        className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
    },
        ...items.map((item, index) =>
            React.createElement(Card, {
                key: item.id,
                item,
                animationDelay: STAGGER_DELAYS[Math.min(index, STAGGER_DELAYS.length - 1)]
            })
        )
    );
};

export default CardGrid;
