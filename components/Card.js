/**
 * @module Card
 * @description Individual portfolio item card. The entire card is a clickable <a> link.
 * Share button copies a deep-link URL. Deep-link highlight ring on ?item= param.
 * @agent Component Developer (Agent 3)
 */
import React, { useState, useEffect } from 'react';
import {
    FileText, Linkedin, Video, Book,
    Layout, ExternalLink, Share2, Check,
    Globe, Presentation
} from 'lucide-react';
import { ClaudeIcon, NotebookLMIcon } from './PlatformIcons.js';
import { copyToClipboard } from '../utils/clipboard.js';

// ── Icon selection ───────────────────────────────────────────────────────────

function getCardIcon(item) {
    const { category, section, platform } = item;
    if (category === 'appearances') return item.type === 'video' ? Video : FileText;
    if (category === 'articles')    return FileText;
    if (category === 'posts')       return Linkedin;

    // artifacts
    if (section === 'ai-prototypes') {
        if (platform === 'notebooklm') return NotebookLMIcon;
        return ClaudeIcon; // claude or unspecified
    }
    if (section === 'study-guides')     return Book;
    if (section === 'proof-of-concepts') return Presentation;
    return Globe;
}

// ── Color styles ─────────────────────────────────────────────────────────────

function getCardStyle(item) {
    const { category, section, platform } = item;

    if (category === 'appearances') return {
        strip: 'bg-purple-500',
        iconBg: 'bg-purple-100 dark:bg-purple-900/30',
        iconText: 'text-purple-600 dark:text-purple-400'
    };
    if (category === 'articles') return {
        strip: 'bg-emerald-500',
        iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
        iconText: 'text-emerald-600 dark:text-emerald-400'
    };
    if (category === 'posts') return {
        strip: 'bg-blue-500',
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        iconText: 'text-blue-600 dark:text-blue-400'
    };

    // artifacts
    if (section === 'ai-prototypes') {
        if (platform === 'notebooklm') return {
            strip: 'bg-green-500',
            iconBg: 'bg-green-100 dark:bg-green-900/30',
            iconText: 'text-green-600 dark:text-green-400'
        };
        return {
            strip: 'bg-orange-500',
            iconBg: 'bg-orange-100 dark:bg-orange-900/30',
            iconText: 'text-orange-600 dark:text-orange-400'
        };
    }
    if (section === 'study-guides') return {
        strip: 'bg-amber-500',
        iconBg: 'bg-amber-100 dark:bg-amber-900/30',
        iconText: 'text-amber-600 dark:text-amber-400'
    };
    if (section === 'proof-of-concepts') return {
        strip: 'bg-rose-500',
        iconBg: 'bg-rose-100 dark:bg-rose-900/30',
        iconText: 'text-rose-600 dark:text-rose-400'
    };
    return {
        strip: 'bg-indigo-500',
        iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
        iconText: 'text-indigo-600 dark:text-indigo-400'
    };
}

// ── Secondary badges ─────────────────────────────────────────────────────────

function getSecondaryBadge(item) {
    const url = (item.url || '').toLowerCase();

    if (item.platform === 'claude')      return { label: 'Claude',     icon: ClaudeIcon,     color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300' };
    if (item.platform === 'notebooklm') return { label: 'NotebookLM', icon: NotebookLMIcon, color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' };
    if (url.includes('youtube.com') || url.includes('youtu.be')) return { label: 'YouTube', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' };
    if (url.includes('/presentation/') || url.includes('slides.google')) return { label: 'Slides', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' };
    if (url.includes('docs.google.com') && url.includes('/document/'))   return { label: 'Doc',    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' };
    if (url.includes('drive.google.com') || url.includes('.pdf'))        return { label: 'PDF',    color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' };
    if (url.includes('linkedin.com'))     return { label: 'LinkedIn', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' };
    if (url.includes('github.io') || url.includes('github.com')) return { label: 'GitHub', color: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300' };

    return null;
}

// ── Bottom-bar label ─────────────────────────────────────────────────────────

function getTypeLabel(item) {
    if (item.category === 'articles')    return 'Article';
    if (item.category === 'posts')       return 'LinkedIn Post';
    if (item.category === 'appearances') return item.type === 'video' ? 'Video' : 'Media';
    if (item.section === 'ai-prototypes')    return 'AI Prototype';
    if (item.section === 'study-guides')     return 'Study Guide';
    if (item.section === 'proof-of-concepts') return 'Proof of Concept';
    return 'Resource';
}

// ── Card ─────────────────────────────────────────────────────────────────────

export const Card = ({ item, animationDelay = '0ms' }) => {
    const [copied, setCopied]           = useState(false);
    const [isHighlighted, setIsHighlighted] = useState(false);

    // Deep-link highlight
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('item') === item.id) {
            setIsHighlighted(true);
            setTimeout(() => setIsHighlighted(false), 2500);
        }
    }, [item.id]);

    const handleShare = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const shareUrl = `${window.location.origin}${window.location.pathname}?item=${item.id}`;
        const success  = await copyToClipboard(shareUrl);
        if (success) {
            setCopied(true);
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message: 'Link copied to clipboard!' }
            }));
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const style  = getCardStyle(item);
    const Icon   = getCardIcon(item);
    const badge  = getSecondaryBadge(item);

    return React.createElement('a', {
        id: `card-${item.id}`,
        href: item.url,
        target: '_blank',
        rel: 'noopener noreferrer',
        className: [
            'group relative flex flex-col rounded-xl border overflow-hidden',
            'bg-white dark:bg-slate-800',
            'border-slate-200 dark:border-slate-700',
            'shadow-sm hover:shadow-lg',
            'transition-all duration-300 hover:-translate-y-1',
            'animate-fade-in-up',
            isHighlighted ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900' : ''
        ].join(' '),
        style: { animationDelay }
    },
        // Colour strip
        React.createElement('div', { className: `h-1.5 w-full ${style.strip}` }),

        // Body
        React.createElement('div', { className: 'flex flex-col flex-1 p-5' },

            // Top row: icon + actions
            React.createElement('div', { className: 'flex items-start justify-between mb-3' },

                React.createElement('div', {
                    className: `p-2.5 rounded-lg ${style.iconBg} ${style.iconText} shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`
                },
                    React.createElement(Icon, { size: 20, strokeWidth: 2 })
                ),

                React.createElement('div', { className: 'flex items-center gap-2 ml-2' },

                    // Platform badge with real logo
                    badge && React.createElement('span', {
                        className: `inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${badge.color}`
                    },
                        badge.icon && React.createElement(badge.icon, { size: 12 }),
                        badge.label
                    ),

                    // Share button
                    React.createElement('button', {
                        onClick: handleShare,
                        className: [
                            'p-1.5 rounded-lg',
                            'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200',
                            'hover:bg-slate-100 dark:hover:bg-slate-700',
                            'transition-all duration-200 z-10'
                        ].join(' '),
                        title: 'Copy link to this item',
                        'aria-label': 'Copy link'
                    },
                        copied
                            ? React.createElement(Check, { size: 15, className: 'text-green-500' })
                            : React.createElement(Share2, { size: 15 })
                    ),

                    // External link indicator
                    React.createElement(ExternalLink, {
                        size: 15,
                        className: 'text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors shrink-0 mt-0.5'
                    })
                )
            ),

            // Title
            React.createElement('h3', {
                className: 'text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'
            }, item.title),

            // Description
            item.description && React.createElement('p', {
                className: 'text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-1'
            }, item.description)
        ),

        // Bottom bar
        React.createElement('div', {
            className: 'px-5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-700'
        },
            React.createElement('span', {
                className: 'text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest'
            }, getTypeLabel(item))
        )
    );
};

export default Card;
