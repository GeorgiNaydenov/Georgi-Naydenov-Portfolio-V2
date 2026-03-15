/**
 * @module ScrollToTop
 * @description Fixed-position button that scrolls the page back to the top.
 * @agent Component Developer (Agent 3)
 */
import React from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop = ({ visible, onClick }) => {
    return React.createElement('button', {
        onClick,
        className: [
            'fixed bottom-6 right-6 z-40 p-3 rounded-full',
            'bg-blue-600 hover:bg-blue-700 text-white shadow-lg',
            'transition-all duration-300',
            visible
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 translate-y-4 pointer-events-none'
        ].join(' '),
        'aria-label': 'Scroll to top'
    },
        React.createElement(ArrowUp, { size: 20 })
    );
};

export default ScrollToTop;
