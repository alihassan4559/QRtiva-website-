import type { SeoPageConfig } from '../data/seoPages.ts';
import type { BlogPost, BlogPostSummary } from '../types/blog.ts';
import { countWords } from '../types/blog.ts';

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function buildStructuredData(page: SeoPageConfig, origin: string) {
  const canonicalUrl = `${origin}${page.path === '/' ? '/' : page.path}`;
  const graphs: Record<string, unknown>[] = [
    {
      '@type': 'Organization',
      '@id': `${origin}/#organization`,
      name: 'QRtiva',
      url: origin,
      description: 'Free privacy-first QR code generator for individuals and businesses.',
    },
    {
      '@type': 'WebSite',
      '@id': `${origin}/#website`,
      name: 'QRtiva',
      alternateName: 'QRtiva Free QR Code Generator',
      url: origin,
      description:
        'Free online QR code generator and custom QR code maker for static PNG, JPG, and SVG QR codes.',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'QRtiva Free QR Code Generator',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web, Windows, macOS, iOS, Android',
      isAccessibleForFree: true,
      url: canonicalUrl,
      description: page.description,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        '13 QR code categories',
        'Custom foreground and background colors',
        'Logo overlay with high error correction',
        'PNG, JPG, and SVG exports up to 2048x2048',
        'Live built-in scannability verification',
        'No signup or watermarks',
      ],
    },
  ];

  if (page.breadcrumbs.length > 0) {
    graphs.push({
      '@type': 'BreadcrumbList',
      itemListElement: page.breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: `${origin}${crumb.path}`,
      })),
    });
  }

  if (page.faqs && page.faqs.length > 0) {
    graphs.push({
      '@type': 'FAQPage',
      mainEntity: page.faqs.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    });
  }

  if (page.kind === 'contact') {
    graphs.push({
      '@type': 'ContactPage',
      name: page.title,
      description: page.description,
      url: canonicalUrl,
      mainEntity: {
        '@type': 'Organization',
        name: 'QRtiva',
        url: origin,
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: 'ali6286791@gmail.com',
          availableLanguage: 'English',
        },
      },
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graphs,
  };
}

export function buildBlogIndexStructuredData(
  page: SeoPageConfig,
  posts: BlogPostSummary[],
  origin: string
) {
  const base = buildStructuredData(page, origin);
  const blogUrl = `${origin}/blog`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ...base['@graph'],
      {
        '@type': 'Blog',
        '@id': `${blogUrl}#blog`,
        name: 'QRtiva Blog',
        description: page.description,
        url: blogUrl,
        publisher: {
          '@type': 'Organization',
          name: 'QRtiva',
          url: origin,
        },
        blogPost: posts.slice(0, 12).map((post) => ({
          '@type': 'BlogPosting',
          headline: post.title,
          url: `${origin}/blog/${post.slug}`,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt,
          image: `${origin}${post.featuredImage}`,
          author: {
            '@type': 'Organization',
            name: post.author,
          },
        })),
      },
    ],
  };
}

export function buildBlogPostStructuredData(post: BlogPost, origin: string) {
  const canonicalUrl = `${origin}/blog/${post.slug}`;
  const imageUrl = `${origin}${post.featuredImage}`;
  const wordCount = countWords(post.contentMarkdown);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${origin}/#organization`,
        name: 'QRtiva',
        url: origin,
      },
      {
        '@type': 'WebSite',
        '@id': `${origin}/#website`,
        name: 'QRtiva',
        url: origin,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${origin}/blog` },
          { '@type': 'ListItem', position: 3, name: post.title, item: canonicalUrl },
        ],
      },
      {
        '@type': 'BlogPosting',
        '@id': `${canonicalUrl}#article`,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl,
        },
        headline: post.title,
        name: post.seoTitle,
        description: post.metaDescription,
        image: [imageUrl],
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        articleSection: post.category,
        keywords: post.keywords.join(', '),
        wordCount,
        inLanguage: 'en',
        isAccessibleForFree: true,
        author: {
          '@type': 'Organization',
          name: post.author,
          url: origin,
        },
        publisher: {
          '@type': 'Organization',
          name: 'QRtiva',
          url: origin,
        },
      },
    ],
  };
}

export function buildSsrHeadTags(page: SeoPageConfig, origin: string): string {
  const canonicalUrl = `${origin}${page.path === '/' ? '/' : page.path}`;
  const ldJson = JSON.stringify(buildStructuredData(page, origin)).replace(/</g, '\\u003c');

  return [
    `<link rel="canonical" href="${escapeAttr(canonicalUrl)}" />`,
    `<meta property="og:url" content="${escapeAttr(canonicalUrl)}" />`,
    `<meta name="keywords" content="${escapeAttr(page.keywords.join(', '))}" />`,
    `<script type="application/ld+json" id="qrtiva-structured-data">${ldJson}</script>`,
  ].join('\n    ');
}

export function buildBlogIndexSsrHeadTags(
  page: SeoPageConfig,
  posts: BlogPostSummary[],
  origin: string
): string {
  const canonicalUrl = `${origin}/blog`;
  const coverImage = `${origin}/images/blog/qr-basics.jpg`;
  const ldJson = JSON.stringify(buildBlogIndexStructuredData(page, posts, origin)).replace(
    /</g,
    '\\u003c'
  );

  return [
    `<link rel="canonical" href="${escapeAttr(canonicalUrl)}" />`,
    `<meta property="og:url" content="${escapeAttr(canonicalUrl)}" />`,
    `<meta property="og:image" content="${escapeAttr(coverImage)}" />`,
    `<meta name="twitter:image" content="${escapeAttr(coverImage)}" />`,
    `<meta name="keywords" content="${escapeAttr(page.keywords.join(', '))}" />`,
    `<script type="application/ld+json" id="qrtiva-structured-data">${ldJson}</script>`,
  ].join('\n    ');
}

export function buildBlogPostSsrHeadTags(post: BlogPost, origin: string): string {
  const canonicalUrl = `${origin}/blog/${post.slug}`;
  const imageUrl = `${origin}${post.featuredImage}`;
  const ldJson = JSON.stringify(buildBlogPostStructuredData(post, origin)).replace(/</g, '\\u003c');

  return [
    `<link rel="canonical" href="${escapeAttr(canonicalUrl)}" />`,
    `<meta property="og:url" content="${escapeAttr(canonicalUrl)}" />`,
    `<meta property="og:image" content="${escapeAttr(imageUrl)}" />`,
    `<meta property="og:image:alt" content="${escapeAttr(post.featuredImageAlt)}" />`,
    `<meta property="article:published_time" content="${escapeAttr(post.publishedAt)}" />`,
    `<meta property="article:modified_time" content="${escapeAttr(post.updatedAt)}" />`,
    `<meta property="article:section" content="${escapeAttr(post.category)}" />`,
    `<meta name="twitter:image" content="${escapeAttr(imageUrl)}" />`,
    `<meta name="keywords" content="${escapeAttr(post.keywords.join(', '))}" />`,
    `<script type="application/ld+json" id="qrtiva-structured-data">${ldJson}</script>`,
  ].join('\n    ');
}

function setMetaTag(
  selector: string,
  attrName: 'name' | 'property',
  attrVal: string,
  content: string
) {
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrVal);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setCanonicalLink(url: string) {
  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = url;
}

function setJsonLdScript(data: unknown) {
  let ldScript = document.getElementById('qrtiva-structured-data') as HTMLScriptElement | null;
  if (!ldScript) {
    ldScript = document.createElement('script');
    ldScript.id = 'qrtiva-structured-data';
    ldScript.type = 'application/ld+json';
    document.head.appendChild(ldScript);
  }
  ldScript.textContent = JSON.stringify(data);
}

export function applyClientSeoMeta(page: SeoPageConfig): void {
  if (typeof document === 'undefined') return;
  const origin = window.location.origin;
  const canonicalUrl = `${origin}${page.path === '/' ? '/' : page.path}`;

  document.title = page.title;

  setMetaTag('meta[name="description"]', 'name', 'description', page.description);
  setMetaTag('meta[name="keywords"]', 'name', 'keywords', page.keywords.join(', '));
  setMetaTag('meta[name="robots"]', 'name', 'robots', 'index, follow');
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website');
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', page.title);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', page.description);
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', page.title);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', page.description);

  setCanonicalLink(canonicalUrl);
  setJsonLdScript(buildStructuredData(page, origin));
}

export function applyBlogIndexSeoMeta(page: SeoPageConfig, posts: BlogPostSummary[]): void {
  if (typeof document === 'undefined') return;
  const origin = window.location.origin;
  const canonicalUrl = `${origin}/blog`;
  const coverImage = `${origin}/images/blog/qr-basics.jpg`;

  document.title = page.title;
  setMetaTag('meta[name="description"]', 'name', 'description', page.description);
  setMetaTag('meta[name="keywords"]', 'name', 'keywords', page.keywords.join(', '));
  setMetaTag('meta[name="robots"]', 'name', 'robots', 'index, follow');
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website');
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', page.title);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', page.description);
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
  setMetaTag('meta[property="og:image"]', 'property', 'og:image', coverImage);
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', page.title);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', page.description);
  setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', coverImage);

  setCanonicalLink(canonicalUrl);
  setJsonLdScript(buildBlogIndexStructuredData(page, posts, origin));
}

export function applyBlogPostSeoMeta(post: BlogPost): void {
  if (typeof document === 'undefined') return;
  const origin = window.location.origin;
  const canonicalUrl = `${origin}/blog/${post.slug}`;
  const imageUrl = `${origin}${post.featuredImage}`;

  document.title = post.seoTitle;

  setMetaTag('meta[name="description"]', 'name', 'description', post.metaDescription);
  setMetaTag('meta[name="keywords"]', 'name', 'keywords', post.keywords.join(', '));
  setMetaTag(
    'meta[name="robots"]',
    'name',
    'robots',
    post.status === 'published' ? 'index, follow' : 'noindex, nofollow'
  );
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'article');
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', post.seoTitle);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', post.metaDescription);
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
  setMetaTag('meta[property="og:image"]', 'property', 'og:image', imageUrl);
  setMetaTag('meta[property="article:published_time"]', 'property', 'article:published_time', post.publishedAt);
  setMetaTag('meta[property="article:modified_time"]', 'property', 'article:modified_time', post.updatedAt);
  setMetaTag('meta[property="article:section"]', 'property', 'article:section', post.category);
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', post.seoTitle);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', post.metaDescription);
  setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);

  setCanonicalLink(canonicalUrl);
  setJsonLdScript(buildBlogPostStructuredData(post, origin));
}

export function applyNoIndexSeoMeta(title: string, description: string, path: string): void {
  if (typeof document === 'undefined') return;
  const origin = window.location.origin;
  const canonicalUrl = `${origin}${path}`;

  document.title = title;
  setMetaTag('meta[name="description"]', 'name', 'description', description);
  setMetaTag('meta[name="robots"]', 'name', 'robots', 'noindex, nofollow');
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website');
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  setCanonicalLink(canonicalUrl);
}
