import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { QR_CATEGORIES } from '../data/qrCategories.ts';
import type { SeoPageConfig } from '../data/seoPages.ts';
import { AdSenseSlot, Breadcrumbs } from '../components/Layout.tsx';
import { QrStudio } from '../components/QrStudio.tsx';
import { FaqAccordion } from '../components/FaqAccordion.tsx';
import { CategoryIcon } from '../components/CategoryIcon.tsx';

interface CategoryLandingPageProps {
  page: SeoPageConfig;
  onNavigate: (path: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function CategoryLandingPage({
  page,
  onNavigate,
  darkMode,
  onToggleDarkMode,
}: CategoryLandingPageProps) {
  const isFullStudio = page.kind === 'generator';
  const relatedCategories = (() => {
    const others = QR_CATEGORIES.filter((c) => c.id !== page.categoryId);
    const curatedIds = [
      'universal-link',
      'url',
      'whatsapp',
      'instagram',
      'youtube',
      'wifi',
      'email',
      'location',
    ];
    const picked: typeof QR_CATEGORIES = [];
    const pushUnique = (cat: (typeof QR_CATEGORIES)[number] | undefined) => {
      if (cat && !picked.some((item) => item.id === cat.id)) {
        picked.push(cat);
      }
    };
    for (const id of curatedIds) {
      if (picked.length >= 6) break;
      pushUnique(others.find((c) => c.id === id));
    }
    for (const cat of others) {
      if (picked.length >= 6) break;
      pushUnique(cat);
    }
    return picked.slice(0, 6);
  })();

  return (
    <div>
      {/* Page Hero / Header */}
      <section className="border-b border-[#E8ECF4] dark:border-slate-800 bg-white dark:bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumbs items={page.breadcrumbs} onNavigate={onNavigate} />
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#172033] dark:text-white max-w-3xl">
            {page.h1}
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-300 mt-3 max-w-2xl leading-relaxed">
            {page.subtitle}
          </p>
        </div>
      </section>

      {/* Embedded Interactive Studio */}
      <QrStudio
        initialCategory={page.categoryId ?? 'url'}
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
        lockCategory={!isFullStudio}
        onNavigate={onNavigate}
      />

      {/* Helpful Original SEO Guide Content */}
      {(page.useCases || page.guideSections) && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          {page.useCases && page.useCases.length > 0 && (
            <div className="rounded-2xl border border-[#E8ECF4] dark:border-slate-800 bg-white dark:bg-[#0F172A] p-6 sm:p-8">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#172033] dark:text-white mb-4">
                Popular Use Cases
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {page.useCases.map((uc) => (
                  <li
                    key={uc}
                    className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#6366F1] shrink-0 mt-0.5" />
                    <span>{uc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {page.guideSections && page.guideSections.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {page.guideSections.map((sec) => (
                <article
                  key={sec.heading}
                  className="rounded-2xl border border-[#E8ECF4] dark:border-slate-800 bg-white dark:bg-[#0F172A] p-6 space-y-2.5"
                >
                  <h2 className="font-display text-lg font-bold text-[#172033] dark:text-white">
                    {sec.heading}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {sec.body}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <AdSenseSlot slotId={`qrtiva-${page.categoryId ?? 'studio'}-banner`} />

      {/* Category FAQs */}
      {page.faqs && page.faqs.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="font-display text-2xl font-bold text-[#172033] dark:text-white mb-6">
            {page.h1} — Frequently Asked Questions
          </h2>
          <FaqAccordion items={page.faqs} />
        </section>
      )}

      {/* Internal Links to Other QR Tools */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="font-display text-xl font-bold text-[#172033] dark:text-white">
            More Free QR Code Generators
          </h2>
          <a
            href="/qr-code-generator"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/qr-code-generator');
            }}
            className="text-xs font-semibold text-[#6366F1] dark:text-[#A78BFA] hover:underline"
          >
            View all {QR_CATEGORIES.length} tools
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {relatedCategories.map((cat) => (
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
                    {cat.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {cat.description}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
