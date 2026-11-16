import { Suspense, lazy, useEffect, useState } from 'react';
import { findSeoPage } from './data/seoPages.ts';
import { applyClientSeoMeta } from './lib/seoHead.ts';
import { Layout } from './components/Layout.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { CategoryLandingPage } from './pages/CategoryLandingPage.tsx';
import {
  AboutPage,
  ContactPage,
  FaqPage,
  PrivacyPolicyPage,
  TermsPage,
} from './pages/StaticPages.tsx';

const BlogPage = lazy(() => import('./pages/BlogPage.tsx'));
const BlogArticlePage = lazy(() => import('./pages/BlogArticlePage.tsx'));

function normalizePathname(raw: string): string {
  if (!raw || raw === '/') return '/';
  const cleaned = raw.replace(/\/+$/, '');
  return cleaned || '/';
}

function getBlogRouteMatch(pathname: string):
  | { type: 'index' }
  | { type: 'article'; slug: string }
  | null {
  const clean = normalizePathname(pathname);
  if (clean === '/blog') return { type: 'index' };
  if (clean.startsWith('/blog/')) {
    const slug = decodeURIComponent(clean.slice('/blog/'.length)).trim();
    if (slug && !slug.includes('/')) {
      return { type: 'article', slug };
    }
  }
  return null;
}

function RouteFallback() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-sm text-slate-500 dark:text-slate-400">
      Loading page...
    </div>
  );
}

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window === 'undefined') return '/';
    return normalizePathname(window.location.pathname || '/');
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return (localStorage.getItem('qrtiva-theme') ?? localStorage.getItem('qora-theme')) === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    try {
      localStorage.setItem('qrtiva-theme', darkMode ? 'dark' : 'light');
    } catch {
      // ignore storage restrictions
    }
  }, [darkMode]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(normalizePathname(window.location.pathname || '/'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const blogMatch = getBlogRouteMatch(currentPath);
  const activePage = findSeoPage(currentPath);

  useEffect(() => {
    if (!blogMatch) {
      applyClientSeoMeta(activePage);
    }
  }, [activePage, blogMatch]);

  const handleNavigate = (target: string) => {
    const [rawPath, hash] = target.split('#');
    const cleanPath = normalizePathname(rawPath || '/');

    if (cleanPath !== currentPath) {
      window.history.pushState({}, '', target);
      setCurrentPath(cleanPath);
      if (!hash) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    if (hash) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    }
  };

  const renderPage = () => {
    if (blogMatch) {
      return (
        <Suspense fallback={<RouteFallback />}>
          {blogMatch.type === 'index' && <BlogPage page={activePage} onNavigate={handleNavigate} />}
          {blogMatch.type === 'article' && (
            <BlogArticlePage slug={blogMatch.slug} onNavigate={handleNavigate} />
          )}
        </Suspense>
      );
    }

    switch (activePage.kind) {
      case 'home':
        return (
          <HomePage
            onNavigate={handleNavigate}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode((d) => !d)}
          />
        );
      case 'generator':
      case 'category':
        return (
          <CategoryLandingPage
            page={activePage}
            onNavigate={handleNavigate}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode((d) => !d)}
          />
        );
      case 'contact':
        return <ContactPage page={activePage} onNavigate={handleNavigate} />;
      case 'about':
        return <AboutPage page={activePage} onNavigate={handleNavigate} />;
      case 'privacy':
        return <PrivacyPolicyPage page={activePage} onNavigate={handleNavigate} />;
      case 'terms':
        return <TermsPage page={activePage} onNavigate={handleNavigate} />;
      case 'faq':
        return <FaqPage page={activePage} onNavigate={handleNavigate} />;
      case 'blog':
        return (
          <Suspense fallback={<RouteFallback />}>
            <BlogPage page={activePage} onNavigate={handleNavigate} />
          </Suspense>
        );
    }
  };

  return (
    <Layout
      currentPath={blogMatch ? currentPath : activePage.path}
      onNavigate={handleNavigate}
      darkMode={darkMode}
      onToggleDarkMode={() => setDarkMode((d) => !d)}
    >
      {renderPage()}
    </Layout>
  );
}
