/**
 * @module data-loader
 * @description Async loader for JSON data files with in-memory caching.
 * @agent Data Engineer (Agent 2)
 *
 * Usage:
 *   import { loadPortfolio, loadCategories, loadConfig, loadAll } from '../utils/data-loader.js';
 *   const items = await loadPortfolio();
 */

// Base URL — detect from the actual pathname so it works with both
// `node server.js` (served at /) and Jekyll (served at /Georgi-Naydenov-Portfolio/).
const REPO = '/Georgi-Naydenov-Portfolio';
const BASE = (typeof window !== 'undefined' && window.location.pathname.startsWith(REPO))
    ? REPO
    : '';

// Module-level cache — survives across calls within same page session
let _portfolioCache = null;
let _categoriesCache = null;
let _configCache = null;

async function fetchJSON(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Failed to load ${path}: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

export async function loadPortfolio() {
    if (!_portfolioCache) {
        _portfolioCache = await fetchJSON(`${BASE}/_data/portfolio.json`);
    }
    return _portfolioCache;
}

export async function loadCategories() {
    if (!_categoriesCache) {
        _categoriesCache = await fetchJSON(`${BASE}/_data/categories.json`);
    }
    return _categoriesCache;
}

export async function loadConfig() {
    if (!_configCache) {
        _configCache = await fetchJSON(`${BASE}/_data/site-config.json`);
    }
    return _configCache;
}

/**
 * Invalidate all cached data.
 * Call after content-api.js writes new data.
 */
export function invalidateCache() {
    _portfolioCache = null;
    _categoriesCache = null;
    _configCache = null;
}

/**
 * Load all data in parallel.
 * Returns { portfolio, categories, config }
 */
export async function loadAll() {
    const [portfolio, categories, config] = await Promise.all([
        loadPortfolio(),
        loadCategories(),
        loadConfig()
    ]);
    return { portfolio, categories, config };
}
