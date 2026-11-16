import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Download,
  Lock,
  Smartphone,
  Sparkles,
  Zap,
  Infinity as InfinityIcon,
  Layers,
  MousePointerClick,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { QR_CATEGORIES, type QrCategoryId } from '../data/qrCategories.ts';
import { GLOBAL_FAQS } from '../data/seoPages.ts';
import {
  DEFAULT_QR_OPTIONS,
  buildQrSvgString,
  downloadQrCode,
  generateQrMatrix,
} from '../lib/qrEngine.ts';
import { detectSmartLink } from '../lib/smartLinkDetector.ts';
import { CategoryIcon } from '../components/CategoryIcon.tsx';
import { QrStudio } from '../components/QrStudio.tsx';
import { FaqAccordion } from '../components/FaqAccordion.tsx';
import { AdSenseSlot } from '../components/Layout.tsx';

interface HomePageProps {
  onNavigate: (path: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const HERO_SWATCHES = [
  { name: 'Deep Navy', fg: '#172033', frame: '#6366F1' },
  { name: 'Indigo', fg: '#4F46E5', frame: '#6366F1' },
  { name: 'Violet', fg: '#6D28D9', frame: '#A78BFA' },
];

const WHY_CHOOSE_FEATURES = [
  {
    title: '100% Free Online QR Generator',
    desc: 'Create and export static QR codes with zero subscriptions, paywalls, or hidden export charges.',
    icon: Sparkles,
  },
  {
    title: 'No Account Required',
    desc: 'Start creating QR codes online immediately without email verification, passwords, or onboarding forms.',
    icon: Lock,
  },
  {
    title: 'Unlimited QR Code Maker',
    desc: 'Produce as many permanent QR codes as your campaigns, menus, classrooms, or events require.',
    icon: InfinityIcon,
  },
  {
    title: 'Instant Live Results',
    desc: 'Live QR matrix updates render in milliseconds while you type or adjust customization.',
    icon: Zap,
  },
  {
    title: 'High-Resolution Downloads',
    desc: 'Download watermark-free PNG, JPG, and vector SVG files up to 2048×2048 pixels.',
    icon: Layers,
  },
  {
    title: 'Privacy-Friendly Generation',
    desc: 'Your URLs, Wi-Fi passwords, and contact details stay inside your browser—never logged.',
    icon: CheckCircle2,
  },
  {
    title: 'Easy Custom QR Code Generator',
    desc: 'Guided category forms automatically format Wi-Fi, WhatsApp, Email, and Phone/SMS payloads.',
    icon: MousePointerClick,
  },
  {
    title: 'Mobile-Friendly Workspace',
    desc: 'Built for smooth editing on phones, tablets, and desktop workstations alike.',
    icon: Smartphone,
  },
];

export function HomePage({ onNavigate, darkMode, onToggleDarkMode }: HomePageProps) {
  const [heroUrl, setHeroUrl] = useState('https://yourwebsite.com');
  const [heroSwatchIdx, setHeroSwatchIdx] = useState(0);
  const [studioUrlOverride, setStudioUrlOverride] = useState<{
    url?: string;
    categoryId?: QrCategoryId;
    nonce: number;
  } | null>(null);
  const [studioCategory, setStudioCategory] = useState<QrCategoryId>('url');
  const [directorySearch, setDirectorySearch] = useState('');

  const activeHeroSwatch = HERO_SWATCHES[heroSwatchIdx];

  const heroQrOptions = useMemo(
    () => ({
      ...DEFAULT_QR_OPTIONS,
      fgColor: activeHeroSwatch.fg,
      frameStyle: 'banner-bottom' as const,
      frameText: 'SCAN ME',
      frameColor: activeHeroSwatch.frame,
    }),
    [activeHeroSwatch]
  );

  const heroDetection = useMemo(() => detectSmartLink(heroUrl), [heroUrl]);

  const normalizedHeroPayload = useMemo(() => {
    if (heroDetection.isValidUrl) return heroDetection.normalizedUrl;
    const trimmed = heroUrl.trim();
    if (!trimmed) return 'https://qrtiva.tools';
    return /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
  }, [heroDetection, heroUrl]);

  const heroMatrix = useMemo(
    () => generateQrMatrix(normalizedHeroPayload, 'M'),
    [normalizedHeroPayload]
  );

  const heroPreviewSvg = useMemo(() => {
    if (!heroMatrix) return '';
    return buildQrSvgString(heroMatrix, heroQrOptions, 280, true);
  }, [heroMatrix, heroQrOptions]);

  const filteredDirectoryCategories = useMemo(() => {
    const q = directorySearch.trim().toLowerCase();
    return QR_CATEGORIES.filter((cat) => {
      if (!q) return true;
      return (
        cat.name.toLowerCase().includes(q) ||
        cat.shortName.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q) ||
        cat.id.toLowerCase().includes(q) ||
        (cat.searchTerms?.some((t) => t.toLowerCase().includes(q)) ?? false)
      );
    });
  }, [directorySearch]);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCategory: QrCategoryId = heroDetection.isValidUrl
      ? heroDetection.recognized
        ? heroDetection.suggestedCategoryId
        : 'universal-link'
      : 'universal-link';
    setStudioCategory(targetCategory);
    setStudioUrlOverride({
      url: heroDetection.isValidUrl ? heroDetection.normalizedUrl : normalizedHeroPayload,
      categoryId: targetCategory,
      nonce: Date.now(),
    });
    document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectCategoryInStudio = (categoryId: QrCategoryId) => {
    setStudioCategory(categoryId);
    setStudioUrlOverride({
      categoryId,
      nonce: Date.now(),
    });
    document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      {/* Hero Section: Two-column layout */}
      <section className="relative overflow-hidden border-b border-[#E8ECF4] dark:border-slate-800/80 bg-white dark:bg-[#0B1120]">
        {/* Soft glowing gradient backdrop */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 right-0 w-[640px] h-[520px] rounded-full bg-gradient-to-tr from-[#6366F1]/14 via-[#A78BFA]/16 to-[#67E8F9]/18 blur-3xl"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* Left Column: Headline, Description, Quick URL Input, Trust Line */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                <span>{QR_CATEGORIES.length} QR Categories</span>
                <span className="mx-2" aria-hidden="true">·</span>
                <span>One Platform, One Input</span>
                <span className="mx-2" aria-hidden="true">·</span>
                <span>PNG, JPG & SVG</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.35rem] font-extrabold tracking-tight text-[#172033] dark:text-white leading-[1.08]">
                Free QR Code Generator — Create QR Codes Online
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                Use QRtiva’s free online QR generator and custom QR code maker to build scannable
                codes for websites, social profiles, Wi-Fi, or documents. Free forever with zero
                signup.
              </p>

              {/* Quick URL Input & Primary CTA */}
              <form onSubmit={handleHeroSubmit} className="max-w-xl space-y-3">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <label htmlFor="hero-url-input" className="sr-only">
                    Paste any link to create your QR code
                  </label>
                  <input
                    id="hero-url-input"
                    type="text"
                    value={heroUrl}
                    onChange={(e) => setHeroUrl(e.target.value)}
                    placeholder="Paste any link (Website, WhatsApp, Instagram, YouTube, TikTok, or any URL)..."
                    className="flex-1 px-4 py-3.5 rounded-xl border border-[#E8ECF4] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 text-sm text-[#172033] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#6366F1] hover:bg-[#5254E1] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Generate QR Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {heroUrl.trim() && heroDetection.isValidUrl && (
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Detected{' '}
                    <span className="font-semibold text-[#172033] dark:text-white">
                      {heroDetection.platformName}
                    </span>{' '}
                    ({heroDetection.linkType}) on{' '}
                    <span className="font-mono text-[#6366F1] dark:text-[#A78BFA]">
                      {heroDetection.domain}
                    </span>
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span>Free Forever</span>
                    <span aria-hidden="true">·</span>
                    <span>No Signup</span>
                    <span aria-hidden="true">·</span>
                    <span>Instant Download</span>
                  </div>

                  <a
                    href="#qr-types"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('qr-types')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6366F1] dark:text-[#A78BFA] hover:underline whitespace-nowrap"
                  >
                    <span>Explore QR Types</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </form>
            </div>

            {/* Right Column: Interactive QR Code Preview */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="relative w-full max-w-md rounded-2xl border border-[#E8ECF4] dark:border-slate-800 bg-white/90 dark:bg-[#0F172A]/95 backdrop-blur-sm p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="text-xs font-semibold text-[#172033] dark:text-white">
                    Interactive Live Preview
                  </span>
                  <div className="flex items-center gap-1.5" role="group" aria-label="Quick preview theme">
                    {HERO_SWATCHES.map((sw, idx) => (
                      <button
                        key={sw.name}
                        type="button"
                        onClick={() => setHeroSwatchIdx(idx)}
                        aria-label={`Preview in ${sw.name}`}
                        className={`w-5 h-5 rounded-md border transition-transform ${
                          heroSwatchIdx === idx
                            ? 'scale-110 ring-2 ring-[#6366F1] border-white'
                            : 'border-[#E8ECF4] dark:border-slate-700'
                        }`}
                        style={{ backgroundColor: sw.fg }}
                      />
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-[#E8ECF4] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950 p-5 sm:p-6 flex items-center justify-center">
                  {heroPreviewSvg && (
                    <div
                      role="img"
                      className="qr-preview-box w-full max-w-[240px] sm:max-w-[260px] aspect-square mx-auto rounded-lg shadow-xs"
                      dangerouslySetInnerHTML={{ __html: heroPreviewSvg }}
                      aria-label={`Live custom QR code preview encoding ${normalizedHeroPayload}`}
                    />
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate">
                    {normalizedHeroPayload}
                  </span>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        heroMatrix &&
                        downloadQrCode('png', heroMatrix, heroQrOptions, 1024, 'qrtiva-quick-qr')
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#5254E1] text-white text-xs font-semibold transition-colors whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PNG</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        heroMatrix &&
                        downloadQrCode('svg', heroMatrix, heroQrOptions, 1024, 'qrtiva-quick-qr')
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E8ECF4] dark:border-slate-700 text-xs font-semibold text-[#172033] dark:text-white hover:border-[#6366F1] transition-colors whitespace-nowrap"
                    >
                      <span>SVG</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Full Universal QR Generator Studio */}
      <div className="pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#172033] dark:text-white">
            Custom QR Code Generator Studio
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 max-w-2xl">
            Pick one of {QR_CATEGORIES.length} streamlined categories in our QR code maker—Website,
            social media, Wi-Fi, Maps, or Other / Universal Link—to create a QR code online
            instantly.
          </p>
        </div>

        <QrStudio
          initialCategory={studioCategory}
          externalUrlOverride={studioUrlOverride}
          darkMode={darkMode}
          onToggleDarkMode={onToggleDarkMode}
          onNavigate={onNavigate}
        />
      </div>

      {/* Complete 13 QR Categories Directory */}
      <section id="qr-types" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#172033] dark:text-white">
              Explore All {QR_CATEGORIES.length} QR Code Categories
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 max-w-2xl">
              One clean generator per platform—websites, social media, Wi-Fi, email, phone/SMS,
              maps, documents, and universal links.
            </p>
          </div>
          <a
            href="/qr-code-generator"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/qr-code-generator');
            }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6366F1] dark:text-[#A78BFA] hover:underline whitespace-nowrap"
          >
            <span>Open Dedicated Studio</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Compact Directory Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <label htmlFor="home-category-search" className="sr-only">
              Search QR categories
            </label>
            <input
              id="home-category-search"
              type="search"
              value={directorySearch}
              onChange={(e) => setDirectorySearch(e.target.value)}
              placeholder={`Search ${QR_CATEGORIES.length} categories (e.g. WhatsApp, YouTube, Wi-Fi, Email, Other)...`}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8ECF4] dark:border-slate-700 bg-white dark:bg-[#0F172A] text-xs sm:text-sm text-[#172033] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
            />
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Showing {filteredDirectoryCategories.length} of {QR_CATEGORIES.length} categories
          </span>
        </div>

        {filteredDirectoryCategories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredDirectoryCategories.map((cat) => (
              <div
                key={cat.id}
                className="group rounded-xl border border-[#E8ECF4] dark:border-slate-800 bg-white dark:bg-[#0F172A] p-4 sm:p-5 flex flex-col justify-between gap-3.5 hover:border-[#6366F1]/60 transition-colors"
              >
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-lg bg-[#6366F1]/10 dark:bg-[#6366F1]/20 flex items-center justify-center text-[#6366F1] dark:text-[#A78BFA]">
                    <CategoryIcon name={cat.iconName} className="w-4 h-4" />
                  </div>
                  <h3 className="font-display text-sm sm:text-base font-semibold text-[#172033] dark:text-white">
                    <a
                      href={cat.slug}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(cat.slug);
                      }}
                      className="hover:text-[#6366F1] dark:hover:text-[#A78BFA] transition-colors"
                    >
                      {cat.name}
                    </a>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {cat.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E8ECF4] dark:border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => handleSelectCategoryInStudio(cat.id)}
                    className="text-xs font-semibold text-[#6366F1] dark:text-[#A78BFA] hover:underline whitespace-nowrap cursor-pointer"
                  >
                    Use Tool
                  </button>
                  <a
                    href={cat.slug}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(cat.slug);
                    }}
                    aria-label={`Open ${cat.name} Generator`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-[#172033] dark:hover:text-white whitespace-nowrap"
                  >
                    <span>{cat.shortName}</span>
                    <ArrowRight className="w-3 h-3" aria-hidden="true" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[#E8ECF4] dark:border-slate-800 bg-white dark:bg-[#0F172A] p-8 text-center space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              No specialized category matched "{directorySearch}". Any valid website or platform
              link works immediately with Other / Universal Link.
            </p>
            <button
              type="button"
              onClick={() => handleSelectCategoryInStudio('universal-link')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6366F1] hover:bg-[#5254E1] text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
            >
              <span>Open Other / Universal Link</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </section>

      {/* How It Works: 3 Clear Steps */}
      <section className="border-y border-[#E8ECF4] dark:border-slate-800 bg-white dark:bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="max-w-2xl mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#172033] dark:text-white">
              How to Create a QR Code Online in Three Steps
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5">
              Go from any link, Wi-Fi network, or document to print-ready vector artwork in under thirty seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: '01.',
                title: 'Choose one of 13 categories',
                body: `Select Website / URL, WhatsApp, Instagram, Facebook, TikTok, YouTube, Snapchat, Wi-Fi, Email, Phone / SMS, Location / Maps, PDF, or Other / Universal Link.`,
              },
              {
                num: '02.',
                title: 'Enter your information',
                body: 'Fill in the guided fields. Customize dot shapes, brand colors, center logo, and optional call-to-action frame.',
              },
              {
                num: '03.',
                title: 'Generate and download your QR code',
                body: 'Confirm live scannability with our built-in decoder check, then download crisp PNG, JPG, or scalable SVG with zero watermarks.',
              },
            ].map((step) => (
              <div
                key={step.num}
                className="rounded-xl border border-[#E8ECF4] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900/60 p-6 space-y-2.5"
              >
                <span className="font-mono text-sm font-semibold text-[#6366F1] dark:text-[#A78BFA]">
                  {step.num}
                </span>
                <h3 className="font-display text-lg font-semibold text-[#172033] dark:text-white">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="max-w-2xl mb-10">
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#172033] dark:text-white">
            Why Choose QRtiva’s Free Online QR Generator
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5">
            Designed to keep static QR generation fast, accessible, private, and free forever.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {WHY_CHOOSE_FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="rounded-xl border border-[#E8ECF4] dark:border-slate-800 bg-white dark:bg-[#0F172A] p-5 space-y-2.5"
              >
                <Icon className="w-5 h-5 text-[#6366F1] dark:text-[#A78BFA]" aria-hidden="true" />
                <h3 className="font-display text-base font-semibold text-[#172033] dark:text-white">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Original Guide: Custom QR Code Features & Print Quality */}
      <section className="border-t border-[#E8ECF4] dark:border-slate-800 bg-white dark:bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="max-w-2xl mb-8">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#172033] dark:text-white">
              Custom QR Code Features Built for Print &amp; Digital Use
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5">
              Every QR code generated with our custom QR code generator is encoded directly inside
              your browser following ISO/IEC 18004 standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <article className="rounded-xl border border-[#E8ECF4] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900/60 p-6 space-y-2">
              <h3 className="font-display text-base font-semibold text-[#172033] dark:text-white">
                Permanent Static QR Codes Without Tracking Redirects
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Because QRtiva stores your website URL, Wi-Fi credentials, email, or phone link
                directly inside the QR matrix, your codes never expire, require no monthly renewal,
                and work reliably without intermediary redirect servers.
              </p>
            </article>

            <article className="rounded-xl border border-[#E8ECF4] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900/60 p-6 space-y-2">
              <h3 className="font-display text-base font-semibold text-[#172033] dark:text-white">
                Brand Styling, Center Logos &amp; High Error Correction
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Customize module dot shapes, corner eye styles, frame labels, and foreground/background
                colors. Upload a center logo with protective quiet padding and up to H (30%) error
                correction so smartphone cameras stay accurate.
              </p>
            </article>

            <article className="rounded-xl border border-[#E8ECF4] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900/60 p-6 space-y-2">
              <h3 className="font-display text-base font-semibold text-[#172033] dark:text-white">
                Real-Time Scannability &amp; Contrast Checks
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                As you style your QR code, QRtiva verifies foreground-to-background contrast ratios and
                decodes the rendered matrix locally to confirm exact payload readability before you
                download or print.
              </p>
            </article>

            <article className="rounded-xl border border-[#E8ECF4] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900/60 p-6 space-y-2">
              <h3 className="font-display text-base font-semibold text-[#172033] dark:text-white">
                Crisp PNG, JPG &amp; Scalable Vector SVG Exports
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Export watermark-free raster PNG or JPG images up to 2048×2048 pixels (or custom
                dimensions up to 4096 px), or download pure vector SVG files for menus, flyers,
                packaging, and large-format signage.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Unobtrusive Monetization-Ready AdSense Slot */}
      <AdSenseSlot slotId="qrtiva-home-mid-leaderboard" format="leaderboard" />

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#172033] dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5">
            Everything you need to know about creating, downloading, and scanning free QR codes.
          </p>
        </div>

        <FaqAccordion items={GLOBAL_FAQS} />
      </section>
    </div>
  );
}
