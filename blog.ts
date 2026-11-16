import type { QrCategoryId } from '../data/qrCategories.ts';

export type BlogPostStatus = 'published' | 'draft';

export type BlogCategory =
  | 'QR Guides'
  | 'Tutorials'
  | 'Business & Marketing'
  | 'Print & Design'
  | 'Security';

export const BLOG_CATEGORIES: BlogCategory[] = [
  'QR Guides',
  'Tutorials',
  'Business & Marketing',
  'Print & Design',
  'Security',
];

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  excerpt: string;
  category: BlogCategory;
  keywords: string[];
  featuredImage: string;
  featuredImageAlt: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  readingTimeMinutes: number;
  status: BlogPostStatus;
  relatedCategoryIds: QrCategoryId[];
  contentMarkdown: string;
}

export type BlogPostSummary = Omit<BlogPost, 'contentMarkdown'>;

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function estimateReadingTime(markdown: string): number {
  const words = markdown
    .replace(/[#>*`[\]()-]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 210));
}

export function countWords(markdown: string): number {
  return markdown
    .replace(/[#>*`[\]()-]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function headingToAnchorId(text: string): string {
  return sanitizeSlug(text) || 'section';
}

export function extractTocHeadings(markdown: string): TocHeading[] {
  const lines = markdown.split(/\r?\n/);
  const headings: TocHeading[] = [];
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith('## ')) {
      const text = line.slice(3).trim();
      if (text) headings.push({ id: headingToAnchorId(text), text, level: 2 });
    } else if (line.startsWith('### ')) {
      const text = line.slice(4).trim();
      if (text) headings.push({ id: headingToAnchorId(text), text, level: 3 });
    }
  }
  return headings;
}

export function formatBlogDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}

export function toWebpPath(imageUrl: string): string | null {
  if (imageUrl.startsWith('/images/blog/') && imageUrl.endsWith('.jpg')) {
    return imageUrl.replace(/\.jpg$/, '.webp');
  }
  return null;
}
