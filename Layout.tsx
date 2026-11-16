import { useState, type ReactNode } from 'react';
import { ChevronRight, Menu, Moon, Sun, X } from 'lucide-react';
import type { BreadcrumbItem } from '../data/seoPages.ts';

interface LayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  children: ReactNode;
}

const NAV_ITEMS = [
  { label: 'Generator', path: '/qr-code-generator' },
  { label: 'QR Types', path: '/#qr-types' },
  { label: 'Blog', path: '/blog' },
  { label: 'FAQ', path: '/faq' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

export function Layout({
  currentPath,
  onNavigate,
  darkMode,
  onToggleDarkMode,
  children,
}: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    onNavigate(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#172033] dark:bg-[#0B1120] dark:text-[#F1F5F9] transition-colors duration-200">
      {/* Top Bar: Strictly 3 Zones separated by gap-8 */}
      <header className="sticky top-0 z-40 border-b border-[#E8ECF4] dark:border-slate-800/80 bg-[#F8FAFC]/90 dark:bg-[#0B1120]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, '/')}
            className="font-display text-xl font-bold tracking-tight text-[#172033] dark:text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] rounded"
          >
            QRtiva
          </a>

          {/* Zone 2: 5 concise single-line nav links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.path === '/blog'
                  ? currentPath === '/blog' || currentPath.startsWith('/blog/')
                  : currentPath === item.path;
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleLinkClick(e, item.path)}
                  className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-[#6366F1] dark:hover:text-[#A78BFA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] rounded ${
                    isActive
                      ? 'text-[#6366F1] dark:text-[#A78BFA] underline underline-offset-8 decoration-2'
                      : ''
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary CTA button (plus mobile menu trigger on small screens) */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="/qr-code-generator"
              onClick={(e) => handleLinkClick(e, '/qr-code-generator')}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#6366F1] hover:bg-[#5254E1] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:ring-offset-2"
            >
              Create QR Code
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#E8ECF4] dark:border-slate-800 text-[#172033] dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E8ECF4] dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-2">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => handleLinkClick(e, item.path)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#172033] dark:text-slate-200 hover:bg-[#F8FAFC] dark:hover:bg-slate-800"
              >
                {item.label}
              </a>
            ))}
            <a
              href="/qr-code-generator"
              onClick={(e) => handleLinkClick(e, '/qr-code-generator')}
              className="block text-center mt-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#6366F1] hover:bg-[#5254E1]"
            >
              Create QR Code
            </a>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-[#E8ECF4] dark:border-slate-800 bg-white dark:bg-[#0F172A] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-2 space-y-4">
              <a
                href="/"
                onClick={(e) => handleLinkClick(e, '/')}
                className="font-display text-xl font-bold tracking-tight text-[#172033] dark:text-white inline-block"
              >
                QRtiva
              </a>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
                Create permanent, customizable QR codes across 13 clean categories—websites, Wi-Fi
                networks, WhatsApp, email, maps, and social media. Generated locally in your
                browser—free forever with zero watermarks.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onToggleDarkMode}
                  aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#E8ECF4] dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-[#6366F1] dark:hover:border-[#A78BFA] transition-colors whitespace-nowrap shrink-0"
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  <span>{darkMode ? 'Light Appearance' : 'Dark Appearance'}</span>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#172033] dark:text-white mb-4">
                Core Generators
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <a href="/website-qr-code-generator" onClick={(e) => handleLinkClick(e, '/website-qr-code-generator')} className="hover:text-[#6366F1] dark:hover:text-[#A78BFA] transition-colors">
                    Website / URL QR
                  </a>
                </li>
                <li>
                  <a href="/wifi-qr-code-generator" onClick={(e) => handleLinkClick(e, '/wifi-qr-code-generator')} className="hover:text-[#6366F1] dark:hover:text-[#A78BFA] transition-colors">
                    Wi-Fi QR Code
                  </a>
                </li>
                <li>
                  <a href="/email-qr-code-generator" onClick={(e) => handleLinkClick(e, '/email-qr-code-generator')} className="hover:text-[#6366F1] dark:hover:text-[#A78BFA] transition-colors">
                    Email QR Code
                  </a>
                </li>
                <li>
                  <a href="/phone-qr-code-generator" onClick={(e) => handleLinkClick(e, '/phone-qr-code-generator')} className="hover:text-[#6366F1] dark:hover:text-[#A78BFA] transition-colors">
                    Phone / SMS QR
                  </a>
                </li>
                <li>
                  <a href="/google-maps-qr-code-generator" onClick={(e) => handleLinkClick(e, '/google-maps-qr-code-generator')} className="hover:text-[#6366F1] dark:hover:text-[#A78BFA] transition-colors">
                    Location / Maps QR
                  </a>
                </li>
                <li>
                  <a href="/pdf-qr-code-generator" onClick={(e) => handleLinkClick(e, '/pdf-qr-code-generator')} className="hover:text-[#6366F1] dark:hover:text-[#A78BFA] transition-colors">
                    PDF / Document QR
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#172033] dark:text-white mb-4">
                Social &amp; Universal
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <a href="/whatsapp-qr-code-generator" onClick={(e) => handleLinkClick(e, '/whatsapp-qr-code-generator')} className="hover:text-[#6366F1] dark:hover:text-[#A78BFA] transition-colors">
                    WhatsApp QR Code
                  </a>
                </li>
                <li>
                  <a href="/instagram-qr-code-generator" onClick={(e) => handleLinkClick(e, '/instagram-qr-code-generator')} className="hover:text-[#6366F1] dark:hover:text-[#A78BFA] transition-colors">
                    Instagram QR Code
                  </a>
                </li>
                <li>
                  <a href="/facebook-qr-code-generator" onClick={(e) => handleLinkClick(e, '/facebook-qr-code-generator')} className="hover:text-[#6366F1] dark:hover:text-[#A78BFA] transition-colors">
                    Facebook QR Code
                  </a>
                </li>
                <li>
                  <a href="/tiktok-qr-code-generator" onClick={(e) => handleLinkClick(e, '/tiktok-qr-code-generator')} className="hover:text-[#6366F1] dark:hover:text-[#A78BFA] transition-colors">
                    TikTok QR Code
                  </a>
                </li>
                <li>
                  <a href="/youtube-qr-code-generator" onClick={(e) => handleLinkClick(e, '/youtube-qr-code-generator')} className="hover:text-[#6366F1] dark:hover:text-[#A78BFA] transition-colors">
                    YouTube QR Code
                  </a>
                </li>
                <li>
                  <a href="/snapchat-qr-code-generator" onClick={(e) => handleLinkClick(e, '/snapchat-qr-code-generator')} className="hover:text-[#6366F1] dark:hover:text-[#A78BFA] transition-colors">
                    Snapchat QR Code
                  </a>
                </li>
                <li>
                  <a href="/universal-qr-code-generator" onClick={(e) => handleLinkClick(e, '/universal-qr-code-generator')} className="hover:text-[#6366F1] dark:hover:text-[#A78BFA] transition-colors">
                    Other / Universal Link
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#172033] dark:text-white mb-4">
                Company & Legal
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <a href="/qr-code-generator" onClick={(e) => handleLinkClick(e, '/qr-code-generator')} className="hover:text-[#6366F1] dark:hover:text-[#A78BFA] transition-colors">
                    Full QR Studio
                  </a>
                </li>
                <li>
                  <a href="/blog" onClick={(e) => handleLinkClick(e, '/blog')} className="hover:text-[#6366F1] dark:hover:text-[#A78BFA] transition-colors">
                    Blog &amp; Guides
                  </a>
                </li>
                <li>
                  <a href="/faq" onClick={(e) => handleLinkClick(e, '/faq')} className="hover:text-[#6366F1] dark:hover:text-[#A78BFA] transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="/about" onClick={(e) => handleLinkClick(e, '/about')} className="hover:text-[#6366F1] dark:hover:text-[#A78BFA] transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/contact" onClick={(e) => handleLinkClick(e, '/contact')} className="hover:text-[#6366F1] dark:hover:text-[#A78BFA] transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="/privacy-policy" onClick={(e) => handleLinkClick(e, '/privacy-policy')} className="hover:text-[#6366F1] dark:hover:text-[#A78BFA] transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms-and-conditions" onClick={(e) => handleLinkClick(e, '/terms-and-conditions')} className="hover:text-[#6366F1] dark:hover:text-[#A78BFA] transition-colors">
                    Terms &amp; Conditions
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[#E8ECF4] dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <p>© {new Date().getFullYear()} QRtiva. All static QR codes generated are free for personal and commercial use.</p>
            <p>Client-side ISO/IEC 18004 QR generation · Zero tracking · No watermarks</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (path: string) => void;
}

export function Breadcrumbs({ items, onNavigate }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <span key={item.path} className="inline-flex items-center gap-1.5">
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />}
            {isLast ? (
              <span className="font-medium text-[#172033] dark:text-slate-200">{item.name}</span>
            ) : (
              <a
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.path);
                }}
                className="hover:text-[#6366F1] dark:hover:text-[#A78BFA] transition-colors"
              >
                {item.name}
              </a>
            )}
          </span>
        );
      })}
    </nav>
  );
}

interface AdSenseSlotProps {
  slotId: string;
  format?: 'leaderboard' | 'responsive';
}

/**
 * Unobtrusive monetization-ready ad slot container positioned outside
 * the interactive QR generation workspace so it never interferes with editing or downloads.
 */
export function AdSenseSlot({ slotId, format = 'responsive' }: AdSenseSlotProps) {
  return (
    <aside
      aria-label="Sponsored placement"
      data-ad-slot={slotId}
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 my-10"
    >
      <div
        className={`w-full rounded-xl border border-dashed border-[#E8ECF4] dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 flex flex-col items-center justify-center text-center px-4 ${
          format === 'leaderboard' ? 'min-h-[90px]' : 'min-h-[100px]'
        }`}
      >
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
          Advertisement Placement · AdSense Ready ({slotId})
        </span>
      </div>
    </aside>
  );
}
