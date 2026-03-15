/**
 * @module Toast
 * @description Fixed-position notification bar with fade-in animation.
 * @agent Component Developer (Agent 3)
 */
import React from 'react';
import { Check } from 'lucide-react';

export const Toast = ({ message, isVisible }) => {
    return React.createElement('div', {
        className: [
            'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
            'flex items-center gap-2 px-5 py-3',
            'bg-slate-800 dark:bg-slate-700 text-white',
            'rounded-full shadow-lg text-sm font-medium',
            'transition-all duration-300',
            isVisible
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 translate-y-4 pointer-events-none'
        ].join(' ')
    },
        React.createElement(Check, { size: 16, className: 'text-green-400 shrink-0' }),
        React.createElement('span', null, message)
    );
};

export default Toast;
