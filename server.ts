import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import dotenv from 'dotenv';
import { LEGACY_SEO_REDIRECTS, SEO_PAGES, findSeoPage } from './src/data/seoPages.ts';
import {
  findPublishedBlogPostBySlug,
  getPublishedBlogPosts,
  getRelatedBlogPosts,
  toBlogPostSummary,
} from './src/data/blogPosts.ts';
import {
  buildBlogIndexSsrHeadTags,
  buildBlogPostSsrHeadTags,
  buildSsrHeadTags,
} from './src/lib/seoHead.ts';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

function getOrigin(req: express.Request): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/+$/, '');
  }
  const rawProto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
  const proto = rawProto.split(',')[0].trim();
  const rawHost =
    (req.headers['x-forwarded-host'] as string) || req.get('host') || `localhost:${PORT}`;
  const host = rawHost.split(',')[0].trim();
  return `${proto}://${host}`;
}

function escapeHtmlText(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function replaceMetaBlock(
  template: string,
  opts: {
    title: string;
    description: string;
    robots?: string;
    ogType?: string;
    ssrHead: string;
  }
): string {
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtmlText(opts.title)}</title>`)
    .replace(
      /<meta\s+name="description"[\s\S]*?\/>/,
      `<meta name="description" content="${escapeHtmlText(opts.description)}" />`
    )
    .replace(
      /<meta\s+property="og:title"[\s\S]*?\/>/,
      `<meta property="og:title" content="${escapeHtmlText(opts.title)}" />`
    )
    .replace(
      /<meta\s+property="og:description"[\s\S]*?\/>/,
      `<meta property="og:description" content="${escapeHtmlText(opts.description)}" />`
    )
    .replace(
      /<meta\s+name="twitter:title"[\s\S]*?\/>/,
      `<meta name="twitter:title" content="${escapeHtmlText(opts.title)}" />`
    )
    .replace(
      /<meta\s+name="twitter:description"[\s\S]*?\/>/,
      `<meta name="twitter:description" content="${escapeHtmlText(opts.description)}" />`
    );

  if (opts.robots) {
    html = html.replace(
      /<meta\s+name="robots"[\s\S]*?\/>/,
      `<meta name="robots" content="${escapeHtmlText(opts.robots)}" />`
    );
  }
  if (opts.ogType) {
    html = html.replace(
      /<meta\s+property="og:type"[\s\S]*?\/>/,
      `<meta property="og:type" content="${escapeHtmlText(opts.ogType)}" />`
    );
  }

  return html.replace('<!--SSR_HEAD-->', opts.ssrHead);
}

function renderHtmlForRoute(
  template: string,
  urlPath: string,
  origin: string
): { status: number; html: string } {
  const clean = urlPath === '/' ? '/' : urlPath.replace(/\/+$/, '') || '/';

  if (clean === '/blog') {
    const page = findSeoPage('/blog');
    const posts = getPublishedBlogPosts().map(toBlogPostSummary);
    const ssrHead = buildBlogIndexSsrHeadTags(page, posts, origin);
    return {
      status: 200,
      html: replaceMetaBlock(template, {
        title: page.title,
        description: page.description,
        robots: 'index, follow',
        ogType: 'website',
        ssrHead,
      }),
    };
  }

  if (clean.startsWith('/blog/')) {
    const rawSlug = clean.slice('/blog/'.length);
    if (!rawSlug.includes('/')) {
      let decodedSlug = rawSlug;
      try {
        decodedSlug = decodeURIComponent(rawSlug);
      } catch {
        // leave rawSlug
      }

      const post = findPublishedBlogPostBySlug(decodedSlug);
      if (post) {
        const ssrHead = buildBlogPostSsrHeadTags(post, origin);
        return {
          status: 200,
          html: replaceMetaBlock(template, {
            title: post.seoTitle,
            description: post.metaDescription,
            robots: 'index, follow',
            ogType: 'article',
            ssrHead,
          }),
        };
      }

      const notFoundUrl = `${origin}/blog/${escapeHtmlText(decodedSlug)}`;
      return {
        status: 404,
        html: replaceMetaBlock(template, {
          title: 'Article Not Found | QRtiva Blog',
          description: 'The requested QRtiva blog article could not be found.',
          robots: 'noindex, nofollow',
          ogType: 'website',
          ssrHead: `<link rel="canonical" href="${notFoundUrl}" />`,
        }),
      };
    }
  }

  const page = findSeoPage(clean);
  const ssrHead = buildSsrHeadTags(page, origin);
  return {
    status: 200,
    html: replaceMetaBlock(template, {
      title: page.title,
      description: page.description,
      robots: 'index, follow',
      ogType: 'website',
      ssrHead,
    }),
  };
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '100kb' }));

  // Render health check endpoint
  app.get('/healthz', (_req, res) => {
    res.status(200).json({ ok: true });
  });

  // Technical SEO: robots.txt
  app.get('/robots.txt', (req, res) => {
    const origin = getOrigin(req);
    res.type('text/plain');
    res.send(`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
  });

  // Technical SEO: XML sitemap (core pages + all 10 static published articles)
  app.get('/sitemap.xml', (req, res) => {
    const origin = getOrigin(req);
    const today = new Date().toISOString().split('T')[0];

    const coreUrls = SEO_PAGES.map(
      (page) => `  <url>
    <loc>${escapeHtmlText(`${origin}${page.path}`)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    );

    const publishedPosts = getPublishedBlogPosts();
    const blogUrls = publishedPosts.map(
      (post) => `  <url>
    <loc>${escapeHtmlText(`${origin}/blog/${post.slug}`)}</loc>
    <lastmod>${escapeHtmlText(post.updatedAt || post.publishedAt)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
    );

    res.type('application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...coreUrls, ...blogUrls].join('\n')}
</urlset>`);
  });

  // Redirect consolidated legacy platform variation paths to canonical single-platform URLs
  for (const [legacyPath, canonicalPath] of Object.entries(LEGACY_SEO_REDIRECTS)) {
    app.get(legacyPath, (_req, res) => {
      res.redirect(301, canonicalPath);
    });
  }

  // Read-only public blog endpoints backed by static repository catalog
  app.get('/api/blog', (req, res) => {
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const query = typeof req.query.q === 'string' ? req.query.q : undefined;
    const posts = getPublishedBlogPosts({ category, query }).map(toBlogPostSummary);
    res.json({ ok: true, posts });
  });

  app.get('/api/blog/:slug', (req, res) => {
    const post = findPublishedBlogPostBySlug(req.params.slug);
    if (!post) {
      res.status(404).json({ ok: false, error: 'Article not found.' });
      return;
    }
    const related = getRelatedBlogPosts(post, 3);
    res.json({ ok: true, post, related });
  });

  // Contact API: do not report email delivery success because no email provider is configured
  app.post('/api/contact', (_req, res) => {
    res.status(501).json({
      ok: false,
      error:
        'Server-side email delivery is not configured. Please contact QRtiva support directly at ali6286791@gmail.com.',
    });
  });

  app.use('/api/*', (_req, res) => {
    res.status(404).json({ ok: false, error: 'API endpoint not found.' });
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const templatePath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(templatePath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        const cleanPath = url.split('?')[0] || '/';
        const rendered = renderHtmlForRoute(template, cleanPath, getOrigin(req));
        res.status(rendered.status).set({ 'Content-Type': 'text/html' }).end(rendered.html);
      } catch (err) {
        vite.ssrFixStacktrace(err as Error);
        next(err);
      }
    });
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    const templatePath = path.resolve(distDir, 'index.html');
    if (!fs.existsSync(templatePath)) {
      throw new Error(
        `Production build missing at ${templatePath}. Run "npm run build" before starting in production.`
      );
    }
    const prodTemplate = fs.readFileSync(templatePath, 'utf-8');

    app.use(express.static(distDir, { index: false }));

    app.use('*', (req, res) => {
      const cleanPath = (req.originalUrl || '/').split('?')[0] || '/';
      const rendered = renderHtmlForRoute(prodTemplate, cleanPath, getOrigin(req));
      res.status(rendered.status).set({ 'Content-Type': 'text/html' }).end(rendered.html);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`QRtiva server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
