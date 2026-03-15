/**
 * @module content-api
 * @description CRUD operations for portfolio data with dual persistence
 *              (localStorage drafts + GitHub API commits).
 * @agent Content Manager (Agent 9)
 */

// ── Draft Layer (localStorage) ──

const DRAFT_KEY = 'portfolio-drafts';
const TRASH_KEY = 'portfolio-trash';
const CONFIG_KEY = 'portfolio-admin-config';

export function loadDrafts() {
    try {
        return JSON.parse(localStorage.getItem(DRAFT_KEY)) || [];
    } catch { return []; }
}

export function saveDrafts(items) {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(items));
}

export function loadTrash() {
    try {
        return JSON.parse(localStorage.getItem(TRASH_KEY)) || [];
    } catch { return []; }
}

export function moveToTrash(item) {
    const trash = loadTrash();
    trash.push({ ...item, deletedAt: new Date().toISOString() });
    localStorage.setItem(TRASH_KEY, JSON.stringify(trash));
}

export function restoreFromTrash(id) {
    const trash = loadTrash();
    const item = trash.find(t => t.id === id);
    const remaining = trash.filter(t => t.id !== id);
    localStorage.setItem(TRASH_KEY, JSON.stringify(remaining));
    return item;
}

// ── Validation ──

export function validateItem(item, existingIds = []) {
    const errors = [];

    if (!item.title?.trim()) errors.push('Title is required');
    if (!item.url?.trim()) errors.push('URL is required');
    if (!item.description?.trim()) errors.push('Description is required');
    if (!item.category) errors.push('Category is required');

    if (item.category === 'artifacts') {
        if (!item.section) errors.push('Section is required for artifacts');
        if (item.section === 'ai-prototypes' && !item.platform) {
            errors.push('Platform is required for AI prototypes');
        }
        if (!item.subCategory) errors.push('Subcategory is required for artifacts');
    }

    if (item.category === 'appearances' && !item.type) {
        errors.push('Type (video/article) is required for appearances');
    }

    try { new URL(item.url); }
    catch { errors.push('URL must be a valid URL'); }

    if (existingIds.includes(item.id)) {
        errors.push(`ID "${item.id}" already exists`);
    }

    return { valid: errors.length === 0, errors };
}

export function generateId(title) {
    return title
        .toLowerCase()
        .replace(/[®™©]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 60);
}

export function generateTags(title, category, subCategory, platform) {
    const words = title.toLowerCase()
        .replace(/[®™©()]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2 && !['the', 'and', 'for', 'with'].includes(w));

    const tags = [...new Set([
        ...words.slice(0, 4),
        category,
        subCategory,
        platform
    ].filter(Boolean))];

    return tags.map(t => t.replace(/\s+/g, '-'));
}

// ── GitHub API Layer ──

export function getAdminConfig() {
    try {
        return JSON.parse(localStorage.getItem(CONFIG_KEY)) || {
            pat: '',
            owner: 'georginaydenov',
            repo: 'Georgi-Naydenov-Portfolio',
            branch: 'main'
        };
    } catch {
        return { pat: '', owner: 'georginaydenov', repo: 'Georgi-Naydenov-Portfolio', branch: 'main' };
    }
}

export function saveAdminConfig(config) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export async function testGitHubConnection() {
    const { pat, owner, repo } = getAdminConfig();
    if (!pat) return { ok: false, error: 'No PAT configured' };

    try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: { 'Authorization': `Bearer ${pat}` }
        });
        if (res.ok) return { ok: true, data: await res.json() };
        return { ok: false, error: `GitHub returned ${res.status}` };
    } catch (err) {
        return { ok: false, error: err.message };
    }
}

export async function fetchRemotePortfolio() {
    const { pat, owner, repo, branch } = getAdminConfig();

    const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/_data/portfolio.json?ref=${branch}`,
        { headers: pat ? { 'Authorization': `Bearer ${pat}` } : {} }
    );

    if (!res.ok) throw new Error(`Failed to fetch remote data: ${res.status}`);

    const data = await res.json();
    const content = JSON.parse(atob(data.content));
    return { content, sha: data.sha };
}

export async function publishToGitHub(items, commitMessage) {
    const { pat, owner, repo, branch } = getAdminConfig();
    if (!pat) throw new Error('GitHub PAT not configured');

    const { sha } = await fetchRemotePortfolio();

    const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/_data/portfolio.json`,
        {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${pat}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: commitMessage || `content: update portfolio data`,
                content: btoa(unescape(encodeURIComponent(
                    JSON.stringify(items, null, 2)
                ))),
                sha,
                branch
            })
        }
    );

    if (!res.ok) {
        const err = await res.json();
        throw new Error(`GitHub commit failed: ${err.message}`);
    }

    return await res.json();
}

// ── Export/Import ──

export function exportToJSON(items) {
    const blob = new Blob(
        [JSON.stringify(items, null, 2)],
        { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

export function importFromJSON(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const items = JSON.parse(e.target.result);
                if (!Array.isArray(items)) throw new Error('Expected array');
                resolve(items);
            } catch (err) {
                reject(new Error(`Invalid JSON: ${err.message}`));
            }
        };
        reader.onerror = () => reject(new Error('File read failed'));
        reader.readAsText(file);
    });
}
