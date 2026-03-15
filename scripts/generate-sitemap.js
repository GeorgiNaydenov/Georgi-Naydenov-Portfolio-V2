#!/usr/bin/env node
/**
 * generate-sitemap.js
 * Generates sitemap.xml for the React SPA (category/filter URLs).
 * The jekyll-sitemap plugin handles blog post URLs automatically.
 * Run: node scripts/generate-sitemap.js
 *
 * @agent SEO & Performance Engineer (Agent 7)
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://georginaydenov.github.io/Georgi-Naydenov-Portfolio';
const TODAY = new Date().toISOString().split('T')[0];

// Load data
const portfolioPath = path.join(__dirname, '../_data/portfolio.json');
const categoriesPath = path.join(__dirname, '../_data/categories.json');

let portfolio = [];
let categories = { categories: [], sections: [] };

try {
    portfolio = JSON.parse(fs.readFileSync(portfolioPath, 'utf-8'));
    categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));
} catch (e) {
    console.error('Error reading data files:', e.message);
    process.exit(1);
}

const urls = [];

// Main portfolio page
urls.push({ loc: `${BASE_URL}/`, lastmod: TODAY, changefreq: 'weekly', priority: '1.0' });

// Category URLs
(categories.categories || []).forEach(cat => {
    urls.push({
        loc: `${BASE_URL}/?activeCategory=${cat.id}`,
        changefreq: 'monthly',
        priority: '0.8'
    });
});

// Section URLs (artifacts only)
(categories.sections || []).filter(s => s.id !== 'all').forEach(sec => {
    urls.push({
        loc: `${BASE_URL}/?activeCategory=artifacts&activeSection=${sec.id}`,
        changefreq: 'monthly',
        priority: '0.7'
    });
});

// Embed pages
['togaf-adm-diagram', 'skill-map', 'stats-dashboard'].forEach(embed => {
    urls.push({
        loc: `${BASE_URL}/embeds/${embed}.html`,
        changefreq: 'monthly',
        priority: '0.6'
    });
});

// Generate XML
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `    <url>
        <loc>${u.loc}</loc>
        ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
        <changefreq>${u.changefreq}</changefreq>
        <priority>${u.priority}</priority>
    </url>`).join('\n')}
</urlset>`;

const outPath = path.join(__dirname, '../sitemap-spa.xml');
fs.writeFileSync(outPath, xml, 'utf-8');
console.log(`✅ Generated ${urls.length} URLs → ${outPath}`);
