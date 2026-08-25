import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MOCK_SITES, CATEGORIES } from '../src/data/mockSites.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface SitemapRoute {
  path: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  lastmod?: string;
}

export const DEFAULT_BASE_URL = 'https://ais-pre-o34fdgj3pna42sqf37qhxo-5633841879.europe-west1.run.app';

/**
 * Automatically discovers all public routes for the application, including:
 * - Core views (home, marketplace, downloads, seller dashboard)
 * - Standalone demo applications (e.g. site-b-ecommerce)
 * - Marketplace product categories
 * - Individual site detail and demo pages for each template
 */
export function getPublicRoutes(): SitemapRoute[] {
  const today = new Date().toISOString().split('T')[0];

  const routes: SitemapRoute[] = [
    // Primary Landing & Marketplace Home
    { path: '/', changefreq: 'daily', priority: 1.0, lastmod: today },
    { path: '/marketplace', changefreq: 'daily', priority: 1.0, lastmod: today },

    // Core Public Views & Features
    { path: '/site-b-ecommerce', changefreq: 'weekly', priority: 0.9, lastmod: today },
    { path: '/seller', changefreq: 'weekly', priority: 0.8, lastmod: today },
    { path: '/downloads', changefreq: 'monthly', priority: 0.7, lastmod: today },
  ];

  // Category Filtering Routes in Marketplace
  for (const cat of CATEGORIES) {
    routes.push({
      path: `/?category=${cat.id}`,
      changefreq: 'weekly',
      priority: cat.id === 'all' ? 0.9 : 0.8,
      lastmod: today,
    });
    if (cat.id !== 'all') {
      routes.push({
        path: `/marketplace?category=${cat.id}`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: today,
      });
    }
  }

  // Dynamic Product Pages & Live Demo Pages for every site template
  for (const site of MOCK_SITES) {
    const slug = site.slug || site.id;
    routes.push({
      path: `/?product=${slug}`,
      changefreq: 'weekly',
      priority: 0.85,
      lastmod: today,
    });
    routes.push({
      path: `/marketplace?product=${slug}`,
      changefreq: 'weekly',
      priority: 0.85,
      lastmod: today,
    });
    routes.push({
      path: `/demo/${site.id}`,
      changefreq: 'monthly',
      priority: 0.75,
      lastmod: today,
    });
  }

  return routes;
}

/**
 * Builds standard XML sitemap format from route definitions.
 */
export function buildSitemapXml(baseUrl: string = DEFAULT_BASE_URL, routes?: SitemapRoute[]): string {
  const activeRoutes = routes || getPublicRoutes();
  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');

  const xmlUrls = activeRoutes
    .map((route) => {
      const url = `${cleanBaseUrl}${route.path.startsWith('/') ? route.path : `/${route.path}`}`;
      return `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${route.lastmod || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(2)}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates and writes sitemap.xml to the public directory and returns generation stats.
 */
export function generateSitemapFile(outputDir: string = path.join(process.cwd(), 'public'), baseUrl?: string) {
  const routes = getPublicRoutes();
  const xml = buildSitemapXml(baseUrl, routes);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf-8');

  return {
    outputPath,
    routesCount: routes.length,
    timestamp: new Date().toISOString(),
  };
}

// Standalone CLI execution support (e.g. `npm run generate:sitemap`)
const isDirectExecution = process.argv[1] && (
  process.argv[1].endsWith('generate-sitemap.ts') || 
  process.argv[1].endsWith('generate-sitemap.js') ||
  process.argv[1].includes('generate-sitemap')
);

if (isDirectExecution) {
  try {
    const customBaseUrl = process.env.SITE_URL || process.argv[2] || DEFAULT_BASE_URL;
    const result = generateSitemapFile(path.join(process.cwd(), 'public'), customBaseUrl);
    console.log(`[Sitemap Generator] Successfully generated ${result.routesCount} routes into ${result.outputPath}`);
  } catch (error) {
    console.error('[Sitemap Generator] Failed to generate sitemap:', error);
    process.exit(1);
  }
}
