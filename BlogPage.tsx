import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { QR_CATEGORIES } from '../data/qrCategories.ts';
import { getPublishedBlogPosts, toBlogPostSummary } from '../data/blogPosts.ts';
import type { SeoPageConfig } from '../data/seoPages.ts';
import { applyBlogIndexSeoMeta } from '../lib/seoHead.ts';
import { BLOG_CATEGORIES, formatBlogDate } from '../types/blog.ts';
import { Breadcrumbs } from '../components/Layout.tsx';
import { BlogImage } from '../components/BlogImage.tsx';
import { CategoryIcon } from '../components/CategoryIcon.tsx';

interface BlogPageProps {
  page: SeoPageConfig;
  onNavigate: (path: string) => void;
}

export function BlogPage({ page, onNavigate }: BlogPageProps) {
  const posts = useMemo(() => getPublishedBlogPosts().map(toBlogPostSummary), []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    applyBlogIndexSeoMeta(page, posts);
  }, [page, posts]);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return posts.filter((post) => {
      const catMatch = selectedCategory === 'All' || post.category === selectedCategory;
      if (!catMatch) return false;
      if (!q) return true;
      return (
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        post.keywords.some((kw) => kw.toLowerCase().includes(q))
      );
    });
  }, [posts, searchQuery, selectedCategory]);

  const showFeaturedLayout =
    selectedCategory === 'All' && !searchQuery.trim() && filteredPosts.length > 0;
  const featuredPost = showFeaturedLayout ? filteredPosts[0] : null;
  const gridPosts = showFeaturedLayout ? filteredPosts.slice(1) : filteredPosts;

  const openArticle = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    e.preventDefault();
    onNavigate(`/blog/${slug}`);
  };

  return (
    <div>
      {/* Header Band */}
      <section className="border-b border-[#E8ECF4] dark:border-slate-800 bg-white dark:bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <Breadcrumbs items={page.breadcrumbs} onNavigate={onNavigate} />
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#172033] dark:text-white">
                {page.h1}
              </h1>
              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {page.subtitle}
              </p>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
              {posts.length} free QR code guides
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Search & Interactive Category Filters */}
        <section
          aria-label="Filter blog articles"
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div className="relative w-full lg:max-w-sm">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <label htmlFor="blog-search" className="sr-only">
              Search QR code articles
            </label>
            <input
              id="blog-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides (e.g. Wi-Fi, PDF, print, scams)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8ECF4] dark:border-slate-700 bg-white dark:bg-[#0F172A] text-sm text-[#172033] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
            />
          </div>

          <div
            role="tablist"
            aria-label="Article categories"
            className="flex items-center flex-wrap gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-[#E8ECF4] dark:border-slate-800"
          >
            {['All', ...BLOG_CATEGORIES].map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-white dark:bg-[#0F172A] text-[#172033] dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-[#172033] dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </section>

        {/* Featured Latest Article (2-column balanced split) */}
        {featuredPost && (
          <article className="rounded-2xl border border-[#E8ECF4] dark:border-slate-800 bg-white dark:bg-[#0F172A] overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <a
              href={`/blog/${featuredPost.slug}`}
              onClick={(e) => openArticle(e, featuredPost.slug)}
              className="lg:col-span-6 block aspect-video lg:aspect-auto lg:min-h-[320px] overflow-hidden bg-slate-100 dark:bg-slate-900"
            >
              <BlogImage
                src={featuredPost.featuredImage}
                alt={featuredPost.featuredImageAlt}
                title={featuredPost.title}
                priority
              />
            </a>
            <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-[#6366F1] dark:text-[#A78BFA]">
                    {featuredPost.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <time dateTime={featuredPost.publishedAt}>
                    {formatBlogDate(featuredPost.publishedAt)}
                  </time>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{featuredPost.readingTimeMinutes} min read</span>
                </div>

                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#172033] dark:text-white leading-snug">
                  <a
                    href={`/blog/${featuredPost.slug}`}
                    onClick={(e) => openArticle(e, featuredPost.slug)}
                    className="hover:text-[#6366F1] dark:hover:text-[#A78BFA] transition-colors"
                  >
                    {featuredPost.title}
                  </a>
                </h2>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
              </div>

              <div>
                <a
                  href={`/blog/${featuredPost.slug}`}
                  onClick={(e) => openArticle(e, featuredPost.slug)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#6366F1] hover:bg-[#5254E1] text-white text-sm font-semibold transition-colors whitespace-nowrap"
                >
                  <span>Read Full Guide</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </article>
        )}

        {/* Article Grid */}
        {gridPosts.length > 0 && (
          <section aria-label="Blog articles" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridPosts.map((post) => (
              <article
                key={post.id}
                className="rounded-2xl border border-[#E8ECF4] dark:border-slate-800 bg-white dark:bg-[#0F172A] overflow-hidden flex flex-col justify-between transition-colors hover:border-[#6366F1]/50"
              >
                <div>
                  <a
                    href={`/blog/${post.slug}`}
                    onClick={(e) => openArticle(e, post.slug)}
                    className="block aspect-video overflow-hidden bg-slate-100 dark:bg-slate-900"
                  >
                    <BlogImage
                      src={post.featuredImage}
                      alt={post.featuredImageAlt}
                      title={post.title}
                    />
                  </a>
                  <div className="p-6 space-y-2.5">
                    <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-[#6366F1] dark:text-[#A78BFA]">
                        {post.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{post.readingTimeMinutes} min read</span>
                    </div>

                    <h2 className="font-display text-lg font-bold text-[#172033] dark:text-white leading-snug">
                      <a
                        href={`/blog/${post.slug}`}
                        onClick={(e) => openArticle(e, post.slug)}
                        className="hover:text-[#6366F1] dark:hover:text-[#A78BFA] transition-colors"
                      >
                        {post.title}
                      </a>
                    </h2>

                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-1">
                  <a
                    href={`/blog/${post.slug}`}
                    onClick={(e) => openArticle(e, post.slug)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6366F1] dark:text-[#A78BFA] hover:underline"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </section>
        )}

        {/* Empty Filter State */}
        {filteredPosts.length === 0 && (
          <div className="rounded-2xl border border-[#E8ECF4] dark:border-slate-800 bg-white dark:bg-[#0F172A] p-10 text-center space-y-3">
            <h2 className="font-display text-lg font-bold text-[#172033] dark:text-white">
              No matching articles found
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              Try clearing your search terms or switching back to all QR guide categories.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 rounded-lg bg-[#6366F1] hover:bg-[#5254E1] text-white text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Internal Links to All 13 QR Categories */}
        <section
          aria-labelledby="blog-qr-tools-heading"
          className="pt-8 border-t border-[#E8ECF4] dark:border-slate-800 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2
                id="blog-qr-tools-heading"
                className="font-display text-2xl font-bold tracking-tight text-[#172033] dark:text-white"
              >
                Explore All {QR_CATEGORIES.length} Free QR Code Generators
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Put these guides into practice immediately—generate permanent PNG, JPG, and SVG QR codes with zero signup.
              </p>
            </div>
            <a
              href="/qr-code-generator"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/qr-code-generator');
              }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6366F1] dark:text-[#A78BFA] hover:underline whitespace-nowrap shrink-0"
            >
              <span>Open Full QR Studio</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {QR_CATEGORIES.map((cat) => (
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
                  <div className="w-9 h-9 rounded-lg bg-[#6366F1]/10 flex items-center justify-center text-[#6366F1] shrink-0">
                    <CategoryIcon name={cat.iconName} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#172033] dark:text-white truncate">
                      {cat.shortName}
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
      </div>
    </div>
  );
}

export default BlogPage;
