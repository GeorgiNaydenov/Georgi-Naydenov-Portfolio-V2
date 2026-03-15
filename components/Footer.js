/**
 * @module Footer
 * @description Bottom bar with copyright year and attribution.
 * @agent Component Developer (Agent 3)
 */
import React from 'react';

export const Footer = () => {
    const year = new Date().getFullYear();

    return React.createElement('footer', {
        className: 'mt-16 py-8 border-t border-slate-200 dark:border-slate-700'
    },
        React.createElement('div', {
            className: 'max-w-7xl mx-auto px-4 sm:px-6 text-center'
        },
            React.createElement('p', {
                className: 'text-sm text-slate-500 dark:text-slate-400'
            },
                `© ${year} Georgi Naydenov. All rights reserved.`
            )
        )
    );
};

export default Footer;
