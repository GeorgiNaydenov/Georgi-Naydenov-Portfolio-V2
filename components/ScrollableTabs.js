/**
 * @module ScrollableTabs
 * @description Horizontal scrollable container with left/right chevron navigation buttons.
 * @agent Component Developer (Agent 3)
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const ScrollableTabs = ({ children }) => {
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        checkScroll();
        el.addEventListener('scroll', checkScroll, { passive: true });
        const ro = new ResizeObserver(checkScroll);
        ro.observe(el);
        return () => {
            el.removeEventListener('scroll', checkScroll);
            ro.disconnect();
        };
    }, [checkScroll]);

    const scroll = (direction) => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
    };

    return React.createElement('div', { className: 'relative flex items-center' },
        canScrollLeft && React.createElement('button', {
            onClick: () => scroll('left'),
            className: [
                'absolute left-0 z-10 p-1.5 rounded-full',
                'bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700',
                'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400',
                'transition-all duration-200 -translate-x-1/2'
            ].join(' '),
            'aria-label': 'Scroll left'
        },
            React.createElement(ChevronLeft, { size: 16 })
        ),
        React.createElement('div', {
            ref: scrollRef,
            className: 'flex gap-2 overflow-x-auto hide-scrollbar scroll-smooth px-1'
        }, children),
        canScrollRight && React.createElement('button', {
            onClick: () => scroll('right'),
            className: [
                'absolute right-0 z-10 p-1.5 rounded-full',
                'bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700',
                'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400',
                'transition-all duration-200 translate-x-1/2'
            ].join(' '),
            'aria-label': 'Scroll right'
        },
            React.createElement(ChevronRight, { size: 16 })
        )
    );
};

export default ScrollableTabs;
