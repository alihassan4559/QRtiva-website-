import { useEffect, useMemo } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getCategoryById } from '../data/qrCategories.ts';
import { findPublishedBlogPostBySlug, getRelatedBlogPosts } from '../data/blogPosts.ts';
import { applyBlogPostSeoMeta, applyNoIndexSeoMeta } from '../lib/seoHead.ts';
import { extractTocHeadings, formatBlogDate } from '../types/blog.ts';
import { Breadcrumbs } from '../components/Layout.tsx';
import { BlogImage } from '../components/BlogImage.tsx';
import { MarkdownRenderer } from '../components/MarkdownRenderer.tsx';
import { CategoryIcon } from '../components/CategoryIcon.tsx';

interface BlogArticlePageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export function BlogArticlePage({ slug, onNavigate }: BlogArticlePageProps) {
  const post = useMemo(() => findPublishedBlogPostBySlug(slug), [slug]);
  const relatedPosts = useMemo(() => (post ? getRelatedBlogPosts(post, 3) : []), [post]);

  useEffect(() => {
    if (post) {
      applyBlogPostSeoMeta(post);
    } else {
      applyNoIndexSeoMeta(
        'Article Not Found | QRtiva Blog',
        'The requested QRtiva blog article could not be found.',
        `/blog/${slug}`
      );
    }
  }, [post, slug]);

  const tocHeadings = useMemo(
    () => (post ? extractTocHeadings(post.contentMarkdown).filter((h) => h.level === 2) : []),
    [post]
  );

  const relatedTools = useMemo(() => {
    if (!post) return [];
    return post.relatedCategoryIds.map((id) => getCategoryById(id));
  }, [post]);

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-5">
        <h1 className="font-display text-3xl font-extrabold text-[#172033] dark:text-white">
          Article Not Found
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
          This guide may have been moved or does not exist. Browse all published QR code tutorials on the QRtiva Blog.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <a
            href="/blog"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/blog');
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#6366F1] hover:bg-[#5254E1] text-white text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Blog</span>
          </a>
          <a
            href="/qr-code-generator"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/qr-code-generator');
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#E8ECF4] dark:border-slate-700 text-sm font-semibold text-[#172033] dark:text-white hover:border-[#6366F1]"
          >
            <span>Open QR Studio</span>
          </a>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: post.title, path: `/blog/${post.slug}` },
  ];

  return (
    <article className="pb-8">
      {/* Article Header */}
      <header className="border-b border-[#E8ECF4] dark:border-slate-800 bg-white dark:bg-[#0F172A]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-5">
          <Breadcrumbs items={breadcrumbs} onNavigate={onNavigate} />

          <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-[#6366F1] dark:text-[#A78BFA]">{post.category}</span>
            <span aria-hidden="true">·</span>
            <span>By {post.author}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.publishedAt}>Published {formatBlogDate(post.publishedAt)}</time>
            {post.updatedAt !== post.publishedAt && (
              <>
                <span aria-hidden="true">·</span>
                <time dateTime={post.updatedAt}>Updated {formatBlogDate(post.updatedAt)}</time>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{post.readingTimeMinutes} min read</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold tracking-tight text-[#172033] dark:text-white leading-[1.15] max-w-4xl">
            {post.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
            {post.excerpt}
          </p>

          <figure className="pt-3">
            <div className="aspect-video w-full rounded-2xl overflow-hidden border border-[#E8ECF4] dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
              <BlogImage
                src={post.featuredImage}
                alt={post.featuredImageAlt}
                title={post.title}
                priority
              />
            </div>
          </figure>
        </div>
      </header>

      {/* Main Content + Desktop Table of Contents */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Sticky TOC Sidebar */}
          {tocHeadings.length > 0 && (
            <aside
              aria-label="Table of contents"
              className="lg:col-span-4 lg:sticky lg:top-24 rounded-2xl border border-[#E8ECF4] dark:border-slate-800 bg-white dark:bg-[#0F172A] p-5 space-y-4"
            >
              <h2 className="font-display text-sm font-bold text-[#172033] dark:text-white">
                In This Guide
              </h2>
              <nav aria-label="Article sections">
                <ol className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  {tocHeadings.map((h, idx) => (
                    <li key={`${h.id}-${idx}`}>
                      <a
                        href={`#${h.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="hover:text-[#6366F1] dark:hover:text-[#A78BFA] transition-colors block py-0.5 leading-snug"
                      >
                        <span className="font-mono text-xs text-slate-400 mr-2 tabular-nums">
                          {String(idx + 1).padStart(2, '0')}.
                        </span>
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>

              <div className="pt-3 border-t border-[#E8ECF4] dark:border-slate-800">
                <a
                  href="/qr-code-generator"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/qr-code-generator');
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#6366F1] hover:bg-[#5254E1] text-white text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  <span>Create a Free QR Code</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </div>
            </aside>
          )}

          {/* Editorial Body */}
          <div className={tocHeadings.length > 0 ? 'lg:col-span-8 max-w-[72ch]' : 'lg:col-span-12 max-w-[72ch] mx-auto'}>
            <MarkdownRenderer markdown={post.contentMarkdown} onNavigate={onNavigate} />

            <div className="mt-10 pt-6 border-t border-[#E8ECF4] dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <a
                href="/blog"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/blog');
                }}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#6366F1] dark:text-[#A78BFA] hover:underline"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>All QRtiva Guides</span>
              </a>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Topics: {post.keywords.slice(0, 4).join(' · ')}
              </p>
            </div>
          </div>
        </div>

        {/* Related QR Generators */}
        {relatedTools.length > 0 && (
          <section
            aria-labelledby="article-related-tools-heading"
            className="mt-14 pt-10 border-t border-[#E8ECF4] dark:border-slate-800 space-y-5"
          >
            <div className="flex items-center justify-between gap-4">
              <h2
                id="article-related-tools-heading"
                className="font-display text-xl sm:text-2xl font-bold text-[#172033] dark:text-white"
              >
                Try Related QRtiva Generators
              </h2>
              <a
                href="/qr-code-generator"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/qr-code-generator');
                }}
                className="text-xs font-semibold text-[#6366F1] dark:text-[#A78BFA] hover:underline whitespace-nowrap shrink-0"
              >
                View all 13 categories
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedTools.map((cat) => (
                <a
                  key={cat.id}
                  href={cat.slug}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(cat.slug);
                  }}
                  className="rounded-xl border border-[#E8ECF4] dark:border-slate-800 bg-white dark:bg-[#0F172A] p-4 flex items-center justify-between gap-3 hover:border-[#6366F1] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#6366F1]/10 flex items-center justify-center text-[#6366F1] shrink-0">
                      <CategoryIcon name={cat.iconName} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#172033] dark:text-white truncate">
                        {cat.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section
            aria-labelledby="related-articles-heading"
            className="mt-14 pt-10 border-t border-[#E8ECF4] dark:border-slate-800 space-y-6"
          >
            <h2
              id="related-articles-heading"
              className="font-display text-xl sm:text-2xl font-bold text-[#172033] dark:text-white"
            >
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((rel) => (
                <article
                  key={rel.id}
                  className="rounded-2xl border border-[#E8ECF4] dark:border-slate-800 bg-white dark:bg-[#0F172A] overflow-hidden flex flex-col justify-between hover:border-[#6366F1]/50 transition-colors"
                >
                  <div>
                    <a
                      href={`/blog/${rel.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(`/blog/${rel.slug}`);
                      }}
                      className="block aspect-video overflow-hidden bg-slate-100 dark:bg-slate-900"
                    >
                      <BlogImage src={rel.featuredImage} alt={rel.featuredImageAlt} title={rel.title} />
                    </a>
                    <div className="p-5 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-[#6366F1] dark:text-[#A78BFA]">
                          {rel.category}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{rel.readingTimeMinutes} min read</span>
                      </div>
                      <h3 className="font-display text-base font-bold text-[#172033] dark:text-white leading-snug">
                        <a
                          href={`/blog/${rel.slug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate(`/blog/${rel.slug}`);
                          }}
                          className="hover:text-[#6366F1] dark:hover:text-[#A78BFA] transition-colors"
                        >
                          {rel.title}
                        </a>
                      </h3>
                    </div>
                  </div>
                  <div className="px-5 pb-5">
                    <a
                      href={`/blog/${rel.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(`/blog/${rel.slug}`);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6366F1] dark:text-[#A78BFA] hover:underline"
                    >
                      <span>Read Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

export default BlogArticlePage;
