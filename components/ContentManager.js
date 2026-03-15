/**
 * @module ContentManager
 * @description CMS slide-over panel for managing portfolio items.
 * Activated via Ctrl+Shift+M or ?admin=true URL param.
 * Hidden from regular visitors — only PAT holders can publish.
 * @agent Content Manager (Agent 9)
 */
import React, { useState, useEffect } from 'react';
import { Settings, X, Plus, Edit2, Trash2, Save, Upload, Download, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Card } from './Card.js';
import {
    loadDrafts, saveDrafts, moveToTrash,
    validateItem, generateId,
    getAdminConfig, saveAdminConfig, testGitHubConnection,
    publishToGitHub, exportToJSON, importFromJSON
} from '../utils/content-api.js';
import { loadPortfolio } from '../utils/data-loader.js';

// ── Empty form state ──────────────────────────────────────────────────────────

const EMPTY_FORM = {
    id: '', title: '', url: '', description: '',
    category: 'artifacts', section: 'ai-prototypes',
    platform: null, subCategory: null,
    type: null, tags: [], thumbnail: null,
    language: 'en', featured: false,
    dateAdded: new Date().toISOString().split('T')[0]
};

// ── FormField helper ──────────────────────────────────────────────────────────

function FormField({ label, required, children }) {
    return React.createElement('div', { className: 'mb-3' },
        React.createElement('label', {
            className: 'block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5'
        },
            label,
            required && React.createElement('span', { className: 'text-red-500 ml-0.5' }, '*')
        ),
        children
    );
}

const inputCls = [
    'w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg',
    'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
].join(' ');

// ── Main component ────────────────────────────────────────────────────────────

export const ContentManager = ({ onSave, categories: categoriesData, sections: sectionsData }) => {
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [isOpen, setIsOpen]           = useState(false);
    const [activePanel, setActivePanel] = useState('list'); // 'list' | 'form' | 'settings'

    const [remoteItems, setRemoteItems] = useState([]);
    const [draftItems, setDraftItems]   = useState([]);
    const [listSearch, setListSearch]   = useState('');
    const [listCatFilter, setListCatFilter] = useState('all');

    const [form, setForm]           = useState({ ...EMPTY_FORM });
    const [editingId, setEditingId] = useState(null);
    const [formErrors, setFormErrors] = useState([]);
    const [showPreview, setShowPreview] = useState(false);

    const [adminConfig, setAdminConfig]         = useState(getAdminConfig());
    const [connectionStatus, setConnectionStatus] = useState(null); // null | 'ok' | 'error'
    const [statusMsg, setStatusMsg]             = useState('');
    const [isPublishing, setIsPublishing]       = useState(false);

    // ── Admin mode gate ──────────────────────────────────────────────────────

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('admin') === 'true') setIsAdminMode(true);

        const handleKeydown = (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'M') setIsAdminMode(prev => !prev);
        };
        window.addEventListener('keydown', handleKeydown);
        return () => window.removeEventListener('keydown', handleKeydown);
    }, []);

    // ── Load data on admin open ──────────────────────────────────────────────

    useEffect(() => {
        if (!isAdminMode) return;
        loadPortfolio().then(items => setRemoteItems(items)).catch(() => {});
        setDraftItems(loadDrafts());
    }, [isAdminMode]);

    // Merged view: drafts override remote
    const allItems = React.useMemo ? React.useMemo(() => {
        const draftIds = new Set(draftItems.map(d => d.id));
        const base = remoteItems.filter(r => !draftIds.has(r.id));
        return [...base, ...draftItems].sort((a, b) => a.title.localeCompare(b.title));
    }, [remoteItems, draftItems]) : [];

    const filteredList = (allItems || []).filter(item => {
        if (listCatFilter !== 'all' && item.category !== listCatFilter) return false;
        if (listSearch && !item.title.toLowerCase().includes(listSearch.toLowerCase())) return false;
        return true;
    });

    const isDraft = (id) => draftItems.some(d => d.id === id);

    // ── Form helpers ─────────────────────────────────────────────────────────

    const updateForm = (field, value) => setForm(f => ({ ...f, [field]: value }));

    const openNew = () => {
        setForm({ ...EMPTY_FORM, dateAdded: new Date().toISOString().split('T')[0] });
        setEditingId(null);
        setFormErrors([]);
        setShowPreview(false);
        setActivePanel('form');
    };

    const openEdit = (item) => {
        setForm({ ...EMPTY_FORM, ...item });
        setEditingId(item.id);
        setFormErrors([]);
        setShowPreview(false);
        setActivePanel('form');
    };

    const handleTitleChange = (title) => {
        updateForm('title', title);
        if (!editingId) updateForm('id', generateId(title));
    };

    const persistDraft = (item) => {
        const updated = [...draftItems.filter(d => d.id !== item.id), item];
        saveDrafts(updated);
        setDraftItems(updated);
        return updated;
    };

    const handleSaveDraft = () => {
        const item = { ...form };
        persistDraft(item);
        setStatusMsg('Draft saved ✓');
        setTimeout(() => setStatusMsg(''), 2500);
        if (onSave) onSave();
    };

    const handleDelete = (id) => {
        if (!confirm(`Move "${id}" to trash?`)) return;
        const item = (allItems || []).find(i => i.id === id);
        if (item) moveToTrash(item);
        const updated = draftItems.filter(d => d.id !== id);
        saveDrafts(updated);
        setDraftItems(updated);
        if (editingId === id) setActivePanel('list');
    };

    // ── Publish ──────────────────────────────────────────────────────────────

    const handlePublish = async () => {
        const item = { ...form };
        const existingIds = (allItems || []).filter(i => i.id !== editingId).map(i => i.id);
        const validation = validateItem(item, existingIds);
        if (!validation.valid) { setFormErrors(validation.errors); return; }
        setFormErrors([]);
        const drafts = persistDraft(item);

        if (!adminConfig.pat) {
            setStatusMsg('No PAT — draft saved. Configure GitHub in Settings to publish.');
            return;
        }

        setIsPublishing(true);
        try {
            const existing = (allItems || []).filter(i => i.id !== item.id);
            const newList  = [...existing, item].sort((a, b) => a.title.localeCompare(b.title));
            await publishToGitHub(newList, `content: ${editingId ? 'update' : 'add'} "${item.title}"`);
            setRemoteItems(newList);
            const cleanedDrafts = drafts.filter(d => d.id !== item.id);
            saveDrafts(cleanedDrafts);
            setDraftItems(cleanedDrafts);
            setStatusMsg('Published to GitHub ✓');
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Published successfully!' } }));
        } catch (err) {
            setStatusMsg(`Publish failed: ${err.message}`);
        } finally {
            setIsPublishing(false);
            setTimeout(() => setStatusMsg(''), 4000);
        }
    };

    // ── Settings ─────────────────────────────────────────────────────────────

    const handleTestConnection = async () => {
        setConnectionStatus(null);
        const result = await testGitHubConnection();
        setConnectionStatus(result.ok ? 'ok' : 'error');
        setStatusMsg(result.ok ? `Connected to ${adminConfig.owner}/${adminConfig.repo}` : result.error);
    };

    const handleExport = async () => {
        const items = await loadPortfolio();
        exportToJSON(items);
    };

    const handleImport = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        importFromJSON(file).then(items => {
            saveDrafts(items);
            setDraftItems(items);
            setStatusMsg(`Imported ${items.length} items as drafts`);
        }).catch(err => setStatusMsg(`Import failed: ${err.message}`));
    };

    const handleSaveConfig = () => {
        saveAdminConfig(adminConfig);
        setStatusMsg('Settings saved ✓');
        setTimeout(() => setStatusMsg(''), 2000);
    };

    // ── Not in admin mode → render nothing ───────────────────────────────────

    if (!isAdminMode) return null;

    const categories = categoriesData || [];
    const sections   = sectionsData   || [];

    // ── Trigger button ────────────────────────────────────────────────────────

    const triggerButton = React.createElement('button', {
        onClick: () => setIsOpen(true),
        className: [
            'fixed bottom-20 left-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg',
            'bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600',
            'text-white text-sm font-medium transition-all duration-200'
        ].join(' '),
        title: 'Open Content Manager (Ctrl+Shift+M)'
    },
        React.createElement(Settings, { size: 16 }),
        React.createElement('span', { className: 'hidden sm:inline' }, 'CMS')
    );

    if (!isOpen) return triggerButton;

    // ── Panel: Item List ──────────────────────────────────────────────────────

    const panelList = React.createElement('div', { className: 'flex flex-col flex-1 overflow-hidden' },
        React.createElement('div', { className: 'p-4 border-b border-slate-200 dark:border-slate-700 space-y-2 shrink-0' },
            React.createElement('div', { className: 'flex items-center gap-2' },
                React.createElement('input', {
                    type: 'text', placeholder: 'Search items…', value: listSearch,
                    onChange: e => setListSearch(e.target.value), className: inputCls + ' flex-1'
                }),
                React.createElement('button', {
                    onClick: openNew,
                    className: 'shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors'
                }, React.createElement(Plus, { size: 15 }), 'Add')
            ),
            React.createElement('select', {
                value: listCatFilter, onChange: e => setListCatFilter(e.target.value), className: inputCls
            },
                React.createElement('option', { value: 'all' }, 'All Categories'),
                ...categories.map(c => React.createElement('option', { key: c.id, value: c.id }, c.label))
            )
        ),
        React.createElement('div', { className: 'flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50' },
            filteredList.length === 0 && React.createElement('p', { className: 'p-6 text-center text-sm text-slate-400' }, 'No items found'),
            ...filteredList.map(item =>
                React.createElement('div', {
                    key: item.id,
                    className: 'flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 group'
                },
                    React.createElement('span', {
                        className: `w-2 h-2 rounded-full shrink-0 ${isDraft(item.id) ? 'bg-orange-400' : 'bg-green-400'}`,
                        title: isDraft(item.id) ? 'Unsaved draft' : 'Published'
                    }),
                    React.createElement('span', { className: 'flex-1 text-xs text-slate-700 dark:text-slate-200 truncate' }, item.title),
                    React.createElement('div', { className: 'flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0' },
                        React.createElement('button', {
                            onClick: () => openEdit(item), title: 'Edit',
                            className: 'p-1.5 rounded text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors'
                        }, React.createElement(Edit2, { size: 13 })),
                        React.createElement('button', {
                            onClick: () => handleDelete(item.id), title: 'Delete',
                            className: 'p-1.5 rounded text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors'
                        }, React.createElement(Trash2, { size: 13 }))
                    )
                )
            )
        )
    );

    // ── Panel: Edit Form ──────────────────────────────────────────────────────

    const panelForm = React.createElement('div', { className: 'flex-1 overflow-y-auto p-4' },
        React.createElement('div', { className: 'flex items-center justify-between mb-3' },
            React.createElement('h3', { className: 'text-sm font-semibold text-slate-700 dark:text-slate-200' },
                editingId ? 'Edit Item' : 'New Item'
            ),
            React.createElement('button', {
                onClick: () => setShowPreview(p => !p),
                className: 'flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors'
            },
                showPreview ? React.createElement(EyeOff, { size: 13 }) : React.createElement(Eye, { size: 13 }),
                showPreview ? 'Hide Preview' : 'Preview'
            )
        ),

        showPreview && React.createElement('div', { className: 'mb-4 transform scale-[0.8] origin-top-left w-[125%]' },
            React.createElement(Card, { item: form, animationDelay: '0ms' })
        ),

        formErrors.length > 0 && React.createElement('div', {
            className: 'mb-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }, ...formErrors.map((err, i) =>
            React.createElement('p', { key: i, className: 'text-xs text-red-600 dark:text-red-400' }, `• ${err}`)
        )),

        React.createElement(FormField, { label: 'ID' },
            React.createElement('input', { type: 'text', value: form.id, onChange: e => updateForm('id', e.target.value), className: inputCls, placeholder: 'auto-from-title' })
        ),
        React.createElement(FormField, { label: 'Title', required: true },
            React.createElement('input', { type: 'text', value: form.title, onChange: e => handleTitleChange(e.target.value), className: inputCls })
        ),
        React.createElement(FormField, { label: 'URL', required: true },
            React.createElement('input', { type: 'url', value: form.url, onChange: e => updateForm('url', e.target.value), className: inputCls, placeholder: 'https://…' })
        ),
        React.createElement(FormField, { label: 'Description', required: true },
            React.createElement('textarea', { value: form.description, onChange: e => updateForm('description', e.target.value), className: inputCls, rows: 3 })
        ),
        React.createElement(FormField, { label: 'Category', required: true },
            React.createElement('select', { value: form.category, onChange: e => updateForm('category', e.target.value), className: inputCls },
                ...categories.map(c => React.createElement('option', { key: c.id, value: c.id }, c.label))
            )
        ),

        form.category === 'artifacts' && React.createElement(FormField, { label: 'Section', required: true },
            React.createElement('select', { value: form.section || '', onChange: e => updateForm('section', e.target.value), className: inputCls },
                React.createElement('option', { value: '' }, '— Select —'),
                ...sections.filter(s => s.id !== 'all').map(s => React.createElement('option', { key: s.id, value: s.id }, s.label))
            )
        ),

        form.category === 'artifacts' && form.section === 'ai-prototypes' && React.createElement(FormField, { label: 'Platform', required: true },
            React.createElement('select', { value: form.platform || '', onChange: e => updateForm('platform', e.target.value || null), className: inputCls },
                React.createElement('option', { value: '' }, '— Select —'),
                React.createElement('option', { value: 'claude' }, 'Claude'),
                React.createElement('option', { value: 'notebooklm' }, 'NotebookLM')
            )
        ),

        form.category === 'artifacts' && React.createElement(FormField, { label: 'Subcategory', required: true },
            React.createElement('select', { value: form.subCategory || '', onChange: e => updateForm('subCategory', e.target.value || null), className: inputCls },
                React.createElement('option', { value: '' }, '— Select —'),
                React.createElement('option', { value: 'togaf-ea' }, 'TOGAF® Ent. Architecture'),
                React.createElement('option', { value: 'togaf-ba' }, 'TOGAF® Bus. Architecture'),
                React.createElement('option', { value: 'cbap' }, 'IIBA® CBAP Prep'),
                React.createElement('option', { value: 'technical' }, 'Claude Skills Deep Dive'),
                React.createElement('option', { value: 'agile' }, 'Agile Methodologies'),
                React.createElement('option', { value: 'scrum' }, 'Scrum.org Prep'),
                React.createElement('option', { value: 'research' }, 'Deep Research'),
                React.createElement('option', { value: 'ai-architecture' }, 'AI Architecture')
            )
        ),

        form.category === 'appearances' && React.createElement(FormField, { label: 'Type', required: true },
            React.createElement('select', { value: form.type || '', onChange: e => updateForm('type', e.target.value || null), className: inputCls },
                React.createElement('option', { value: '' }, '— Select —'),
                React.createElement('option', { value: 'video' }, 'Video'),
                React.createElement('option', { value: 'article' }, 'Article')
            )
        ),

        React.createElement(FormField, { label: 'Language' },
            React.createElement('select', { value: form.language || 'en', onChange: e => updateForm('language', e.target.value), className: inputCls },
                React.createElement('option', { value: 'en' }, 'English'),
                React.createElement('option', { value: 'bg' }, 'Bulgarian')
            )
        ),

        React.createElement(FormField, { label: 'Date Added' },
            React.createElement('input', { type: 'date', value: form.dateAdded || '', onChange: e => updateForm('dateAdded', e.target.value), className: inputCls })
        ),

        React.createElement('div', { className: 'flex items-center gap-2 mb-4' },
            React.createElement('input', { type: 'checkbox', id: 'feat-cb', checked: !!form.featured, onChange: e => updateForm('featured', e.target.checked), className: 'rounded' }),
            React.createElement('label', { htmlFor: 'feat-cb', className: 'text-sm text-slate-600 dark:text-slate-300' }, 'Featured item')
        ),

        statusMsg && React.createElement('p', { className: 'text-xs text-blue-600 dark:text-blue-400 mb-3' }, statusMsg),

        React.createElement('div', { className: 'flex flex-wrap gap-2 pb-6' },
            React.createElement('button', {
                onClick: handleSaveDraft,
                className: 'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors'
            }, React.createElement(Save, { size: 14 }), 'Save Draft'),
            React.createElement('button', {
                onClick: handlePublish, disabled: isPublishing,
                className: 'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white transition-colors'
            }, React.createElement(Upload, { size: 14 }), isPublishing ? 'Publishing…' : 'Publish'),
            React.createElement('button', {
                onClick: () => setActivePanel('list'),
                className: 'px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors'
            }, 'Cancel')
        )
    );

    // ── Panel: Settings ───────────────────────────────────────────────────────

    const panelSettings = React.createElement('div', { className: 'flex-1 overflow-y-auto p-4' },
        React.createElement('h3', { className: 'text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4' }, 'GitHub Configuration'),

        React.createElement(FormField, { label: 'Personal Access Token (PAT)' },
            React.createElement('input', { type: 'password', value: adminConfig.pat || '', onChange: e => setAdminConfig(c => ({ ...c, pat: e.target.value })), className: inputCls, placeholder: 'ghp_…' })
        ),
        React.createElement(FormField, { label: 'Repository Owner' },
            React.createElement('input', { type: 'text', value: adminConfig.owner || '', onChange: e => setAdminConfig(c => ({ ...c, owner: e.target.value })), className: inputCls })
        ),
        React.createElement(FormField, { label: 'Repository Name' },
            React.createElement('input', { type: 'text', value: adminConfig.repo || '', onChange: e => setAdminConfig(c => ({ ...c, repo: e.target.value })), className: inputCls })
        ),
        React.createElement(FormField, { label: 'Branch' },
            React.createElement('input', { type: 'text', value: adminConfig.branch || 'main', onChange: e => setAdminConfig(c => ({ ...c, branch: e.target.value })), className: inputCls })
        ),

        React.createElement('div', { className: 'flex flex-wrap gap-2 mb-4' },
            React.createElement('button', {
                onClick: handleSaveConfig,
                className: 'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors'
            }, React.createElement(Save, { size: 14 }), 'Save'),
            React.createElement('button', {
                onClick: handleTestConnection,
                className: 'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors'
            },
                connectionStatus === 'ok'    ? React.createElement(CheckCircle,  { size: 14, className: 'text-green-500' }) :
                connectionStatus === 'error' ? React.createElement(AlertCircle, { size: 14, className: 'text-red-500' }) : null,
                'Test Connection'
            )
        ),

        statusMsg && React.createElement('p', { className: 'text-xs text-blue-600 dark:text-blue-400 mb-4' }, statusMsg),

        React.createElement('hr', { className: 'border-slate-200 dark:border-slate-700 my-4' }),
        React.createElement('h3', { className: 'text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3' }, 'Data Export / Import'),

        React.createElement('div', { className: 'flex flex-wrap gap-2 mb-4' },
            React.createElement('button', {
                onClick: handleExport,
                className: 'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors'
            }, React.createElement(Download, { size: 14 }), 'Export JSON'),
            React.createElement('label', {
                className: 'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer'
            },
                React.createElement(Upload, { size: 14 }), 'Import JSON',
                React.createElement('input', { type: 'file', accept: '.json', className: 'sr-only', onChange: handleImport })
            )
        ),

        React.createElement('p', { className: 'text-xs text-slate-400 dark:text-slate-500 leading-relaxed' },
            '⚠️ Your PAT is stored only in this browser\'s localStorage. Never share it or commit it to version control. Use a PAT with minimal scope (public_repo).'
        )
    );

    // ── Full panel render ─────────────────────────────────────────────────────

    return React.createElement(React.Fragment, null,
        triggerButton,

        // Overlay + panel
        React.createElement('div', {
            className: 'fixed inset-0 z-50 flex',
        },
            // Backdrop
            React.createElement('div', {
                className: 'absolute inset-0 bg-black/40 backdrop-blur-sm',
                onClick: () => setIsOpen(false)
            }),

            // Slide-over panel
            React.createElement('div', {
                className: [
                    'relative ml-auto w-full max-w-sm h-full',
                    'bg-white dark:bg-slate-900 shadow-2xl flex flex-col',
                    'animate-fade-in-right'
                ].join(' '),
                role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Content Manager'
            },
                // Header
                React.createElement('div', {
                    className: 'flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 shrink-0'
                },
                    React.createElement('div', { className: 'flex items-center gap-2' },
                        React.createElement('span', { className: 'text-sm font-bold text-slate-800 dark:text-slate-100' }, 'Content Manager'),
                        React.createElement('span', { className: 'text-xs text-orange-600 font-semibold bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-full' }, 'Admin')
                    ),
                    React.createElement('div', { className: 'flex items-center gap-1' },
                        // Nav tabs
                        [
                            { id: 'list', label: `Items (${(allItems || []).length})` },
                            { id: 'form', label: 'Edit' },
                            { id: 'settings', label: '⚙️' }
                        ].map(tab =>
                            React.createElement('button', {
                                key: tab.id,
                                onClick: () => setActivePanel(tab.id),
                                className: [
                                    'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                                    activePanel === tab.id
                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                                ].join(' ')
                            }, tab.label)
                        ),
                        React.createElement('button', {
                            onClick: () => setIsOpen(false),
                            className: 'p-1.5 ml-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors',
                            'aria-label': 'Close'
                        }, React.createElement(X, { size: 16 }))
                    )
                ),

                // Active panel body
                activePanel === 'list'     && panelList,
                activePanel === 'form'     && panelForm,
                activePanel === 'settings' && panelSettings
            )
        )
    );
};

export default ContentManager;
