/**
 * @module theme
 * @description Dark/light mode detection and application.
 * @agent Component Developer (Agent 3)
 */

/**
 * Get the initial theme preference.
 * @returns {boolean} true if dark mode should be active
 */
export function getInitialTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return true;
    }
    return false;
}

/**
 * Apply theme to the document.
 * @param {boolean} isDark - Whether to apply dark mode
 */
export function applyTheme(isDark) {
    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}
