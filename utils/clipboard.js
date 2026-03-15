/**
 * @module clipboard
 * @description Clipboard utility with Clipboard API and textarea fallback.
 * @agent Component Developer (Agent 3)
 */

/**
 * Copy text to clipboard.
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} true on success
 */
export async function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            return fallbackCopy(text);
        }
    } else {
        return fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        textArea.style.top = '0';
        textArea.style.left = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
    } catch (err) {
        console.warn('Clipboard copy failed:', err);
        return false;
    }
}
