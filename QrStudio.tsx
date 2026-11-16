import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Globe,
  ImagePlus,
  Moon,
  RotateCcw,
  Search,
  Sliders,
  Sparkles,
  Sun,
  Trash2,
} from 'lucide-react';
import {
  QR_CATEGORIES,
  buildQrPayload,
  getCategoryById,
  type QrCategoryId,
} from '../data/qrCategories.ts';
import {
  DEFAULT_QR_OPTIONS,
  buildQrSvgString,
  copyQrPngToClipboard,
  downloadQrCode,
  generateQrMatrix,
  getContrastRatio,
  verifyQrScannable,
  type DotStyle,
  type ErrorCorrectionLevel,
  type EyeStyle,
  type FrameStyle,
  type QrRenderOptions,
  type ScannabilityResult,
} from '../lib/qrEngine.ts';
import { CategoryIcon } from './CategoryIcon.tsx';
import {
  detectSmartLink,
  getPrimaryFieldKeyForCategory,
} from '../lib/smartLinkDetector.ts';

interface QrStudioProps {
  initialCategory?: QrCategoryId;
  externalUrlOverride?: { url?: string; categoryId?: QrCategoryId; nonce: number } | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  lockCategory?: boolean;
  onNavigate?: (path: string) => void;
}

type CustomizerTab = 'style' | 'logo' | 'frame' | 'advanced';
type ResolutionPreset = 512 | 1024 | 2048 | 'custom';

const COLOR_PRESETS = [
  { name: 'Deep Navy', fg: '#172033', bg: '#FFFFFF', frame: '#6366F1' },
  { name: 'Indigo Studio', fg: '#4338CA', bg: '#FFFFFF', frame: '#6366F1' },
  { name: 'Obsidian', fg: '#0F172A', bg: '#F8FAFC', frame: '#172033' },
  { name: 'Violet Ink', fg: '#5B21B6', bg: '#FFFFFF', frame: '#7C3AED' },
  { name: 'Teal Slate', fg: '#0F766E', bg: '#FFFFFF', frame: '#0D9488' },
];

export function QrStudio({
  initialCategory = 'url',
  externalUrlOverride = null,
  darkMode,
  onToggleDarkMode,
  lockCategory = false,
  onNavigate,
}: QrStudioProps) {
  const [selectedCategory, setSelectedCategory] = useState<QrCategoryId>(initialCategory);
  const [formValuesByCategory, setFormValuesByCategory] = useState<
    Record<string, Record<string, string | boolean>>
  >(() => {
    const initial: Record<string, Record<string, string | boolean>> = {};
    for (const cat of QR_CATEGORIES) {
      initial[cat.id] = { ...cat.defaultValues };
    }
    return initial;
  });

  const [options, setOptions] = useState<QrRenderOptions>(() => ({
    ...DEFAULT_QR_OPTIONS,
    frameText: getCategoryById(initialCategory).defaultFrameLabel,
  }));
  const [activeTab, setActiveTab] = useState<CustomizerTab>('style');
  const [resolutionPreset, setResolutionPreset] = useState<ResolutionPreset>(1024);
  const [customResolution, setCustomResolution] = useState<number>(1500);
  const [scannability, setScannability] = useState<ScannabilityResult>({
    verified: true,
    exactMatch: true,
    contrastRatio: 16.08,
    decodedText: null,
  });
  const [downloadingFormat, setDownloadingFormat] = useState<'png' | 'jpg' | 'svg' | null>(null);
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setSelectedCategory(initialCategory);
    setOptions((prev) => ({
      ...prev,
      frameText: getCategoryById(initialCategory).defaultFrameLabel,
    }));
  }, [initialCategory]);

  const applySmartUrlToCategory = (targetCatId: QrCategoryId, rawUrl: string) => {
    const cleanUrl = rawUrl.trim();
    if (!cleanUrl) return;
    setSelectedCategory(targetCatId);
    const nextCat = getCategoryById(targetCatId);
    setOptions((prev) => ({
      ...prev,
      frameText: nextCat.defaultFrameLabel,
    }));
    const fieldKey = getPrimaryFieldKeyForCategory(targetCatId) ?? 'url';
    setFormValuesByCategory((prev) => ({
      ...prev,
      [targetCatId]: {
        ...(prev[targetCatId] ?? nextCat.defaultValues),
        [fieldKey]: cleanUrl,
      },
    }));
  };

  useEffect(() => {
    if (!externalUrlOverride) return;
    const targetCat = externalUrlOverride.categoryId ?? 'url';
    const trimmed = (externalUrlOverride.url ?? '').trim();
    if (trimmed) {
      applySmartUrlToCategory(targetCat, trimmed);
    } else if (externalUrlOverride.categoryId) {
      setSelectedCategory(targetCat);
      setOptions((prev) => ({
        ...prev,
        frameText: getCategoryById(targetCat).defaultFrameLabel,
      }));
    }
  }, [externalUrlOverride]);

  const universalFieldDetection = useMemo(() => {
    if (selectedCategory !== 'universal-link') return null;
    const raw = String((formValuesByCategory['universal-link'] ?? {}).url ?? '').trim();
    return raw ? detectSmartLink(raw) : null;
  }, [selectedCategory, formValuesByCategory]);

  const filteredCategories = useMemo(() => {
    const q = categorySearch.trim().toLowerCase();
    return QR_CATEGORIES.filter((cat) => {
      if (!q) return true;
      return (
        cat.name.toLowerCase().includes(q) ||
        cat.shortName.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q) ||
        (cat.searchTerms?.some((t) => t.toLowerCase().includes(q)) ?? false)
      );
    });
  }, [categorySearch]);

  const category = useMemo(() => getCategoryById(selectedCategory), [selectedCategory]);
  const currentValues = formValuesByCategory[selectedCategory] ?? category.defaultValues;

  const standardBuild = useMemo(
    () => buildQrPayload(selectedCategory, currentValues),
    [selectedCategory, currentValues]
  );

  const payload = standardBuild.payload;
  const isValid = standardBuild.isValid;
  const error = standardBuild.error;

  const mismatchDetection = useMemo(() => {
    if (!standardBuild.suggestUniversal) return null;
    const key = getPrimaryFieldKeyForCategory(selectedCategory) ?? 'url';
    const raw = String(currentValues[key] ?? '').trim();
    return raw ? detectSmartLink(raw) : null;
  }, [selectedCategory, standardBuild.suggestUniversal, currentValues]);

  const previewPayload = useMemo(() => {
    if (isValid && payload) return payload;
    const fallback = buildQrPayload(selectedCategory, category.defaultValues);
    return fallback.payload || 'https://qrtiva.tools';
  }, [isValid, payload, selectedCategory, category.defaultValues]);

  const matrix = useMemo(
    () => (previewPayload ? generateQrMatrix(previewPayload, options.errorCorrectionLevel) : null),
    [previewPayload, options.errorCorrectionLevel]
  );

  const previewSvg = useMemo(() => {
    if (!matrix) return '';
    return buildQrSvgString(matrix, options, 360, true);
  }, [matrix, options]);

  const contrastRatio = useMemo(
    () => getContrastRatio(options.fgColor, options.bgColor),
    [options.fgColor, options.bgColor]
  );

  useEffect(() => {
    let cancelled = false;
    if (!matrix) return;
    verifyQrScannable(matrix, options, previewPayload).then((res) => {
      if (!cancelled) {
        setScannability(res);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [matrix, options, previewPayload]);

  const exportPixelSize = useMemo(() => {
    if (resolutionPreset === 'custom') {
      const clamped = Math.max(256, Math.min(4096, Number(customResolution) || 1024));
      return clamped;
    }
    return resolutionPreset;
  }, [resolutionPreset, customResolution]);

  const handleCategoryChange = (catId: QrCategoryId) => {
    setSelectedCategory(catId);
    const nextCat = getCategoryById(catId);
    setOptions((prev) => ({
      ...prev,
      frameText: nextCat.defaultFrameLabel,
    }));
  };

  const handleFieldChange = (key: string, value: string | boolean) => {
    setFormValuesByCategory((prev) => ({
      ...prev,
      [selectedCategory]: {
        ...(prev[selectedCategory] ?? category.defaultValues),
        [key]: value,
      },
    }));
  };

  const handleLoadExample = () => {
    setFormValuesByCategory((prev) => ({
      ...prev,
      [selectedCategory]: { ...category.exampleValues },
    }));
  };

  const handleResetCategory = () => {
    setFormValuesByCategory((prev) => ({
      ...prev,
      [selectedCategory]: { ...category.defaultValues },
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setOptions((prev) => ({
          ...prev,
          logoDataUrl: reader.result as string,
          errorCorrectionLevel:
            prev.errorCorrectionLevel === 'L' || prev.errorCorrectionLevel === 'M'
              ? 'H'
              : prev.errorCorrectionLevel,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const canDownload = Boolean(matrix && isValid);

  const handleDownload = async (format: 'png' | 'jpg' | 'svg') => {
    if (!canDownload || !matrix) return;
    setDownloadingFormat(format);
    try {
      await downloadQrCode(
        format,
        matrix,
        options,
        exportPixelSize,
        `qrtiva-${selectedCategory}-qr`
      );
    } finally {
      setDownloadingFormat(null);
    }
  };

  const handleCopyImage = async () => {
    if (!canDownload || !matrix) return;
    try {
      const ok = await copyQrPngToClipboard(matrix, options, exportPixelSize);
      if (ok) {
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 1800);
      }
    } catch {
      // Clipboard API may be restricted in some browsers
    }
  };

  const handleCopyPayload = async () => {
    if (!payload) return;
    try {
      await navigator.clipboard.writeText(payload);
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 1800);
    } catch {
      // ignore clipboard restriction
    }
  };

  const fixReadability = () => {
    setOptions((prev) => ({
      ...prev,
      fgColor: '#172033',
      bgColor: '#FFFFFF',
      errorCorrectionLevel: prev.logoDataUrl ? 'H' : 'M',
      logoSizeRatio: prev.logoDataUrl ? Math.min(prev.logoSizeRatio, 0.2) : prev.logoSizeRatio,
    }));
  };

  return (
    <section
      id="generator"
      aria-label="QR Code Generator Studio"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="rounded-2xl border border-[#E8ECF4] dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-sm overflow-hidden">
        {/* Studio Toolbar */}
        <div className="px-5 sm:px-7 py-4 border-b border-[#E8ECF4] dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-[#F8FAFC]/60 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <CategoryIcon name={category.iconName} className="w-5 h-5 text-[#6366F1]" />
            <div>
              <h2 className="font-display text-base sm:text-lg font-semibold text-[#172033] dark:text-white">
                {category.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instant client-side generation · High-resolution export · Zero watermarks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onToggleDarkMode}
              aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8ECF4] dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-[#6366F1] transition-colors whitespace-nowrap shrink-0"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{darkMode ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>

        {/* Clean 13-Category Grid + Search Selector */}
        {!lockCategory && (
          <div className="px-5 sm:px-7 py-4 border-b border-[#E8ECF4] dark:border-slate-800 bg-white dark:bg-[#0F172A] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <label htmlFor="qrtiva-category-search" className="sr-only">
                  Search QR categories
                </label>
                <input
                  id="qrtiva-category-search"
                  type="search"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder={`Search ${QR_CATEGORIES.length} QR categories (e.g. WhatsApp, YouTube, Wi-Fi, Email, Universal)...`}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E8ECF4] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800/80 text-xs text-[#172033] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                />
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {filteredCategories.length} of {QR_CATEGORIES.length} categories
              </span>
            </div>

            {filteredCategories.length > 0 ? (
              <div
                role="tablist"
                aria-label="Select QR Code Category"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5"
              >
                {filteredCategories.map((cat) => {
                  const active = cat.id === selectedCategory;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                        active
                          ? 'bg-[#6366F1] text-white shadow-xs'
                          : 'bg-[#F8FAFC] dark:bg-slate-800/70 text-[#172033] dark:text-slate-200 hover:bg-[#6366F1]/10 dark:hover:bg-slate-800 border border-[#E8ECF4] dark:border-slate-800'
                      }`}
                    >
                      <CategoryIcon
                        name={cat.iconName}
                        className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-[#6366F1] dark:text-[#A78BFA]'}`}
                      />
                      <span className="truncate">{cat.shortName}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-[#E8ECF4] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900/50 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-slate-600 dark:text-slate-300">
                  No category matched "{categorySearch}". You can convert any valid URL using Other
                  / Universal Link.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCategorySearch('');
                      handleCategoryChange('universal-link');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#6366F1] text-white font-semibold whitespace-nowrap shrink-0"
                  >
                    Open Other / Universal Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategorySearch('')}
                    className="px-3 py-1.5 rounded-lg border border-[#E8ECF4] dark:border-slate-700 font-medium whitespace-nowrap shrink-0"
                  >
                    Clear Search
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main 2-Column Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E8ECF4] dark:divide-slate-800">
          {/* Left Column: Content Input + Customization */}
          <div className="lg:col-span-7 p-5 sm:p-7 space-y-8">
            {/* Step 1: Content Input Form */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="font-display text-base font-semibold text-[#172033] dark:text-white">
                    {['url', 'universal-link', 'whatsapp', 'instagram', 'facebook', 'tiktok', 'youtube', 'snapchat'].includes(
                      category.id
                    )
                      ? `01. Create Your ${category.shortName} QR Code`
                      : `01. Enter ${category.shortName} Details`}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {category.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadExample}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E8ECF4] dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-[#6366F1] transition-colors whitespace-nowrap shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#6366F1]" />
                    <span>Load Example</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetCategory}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E8ECF4] dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-slate-400 transition-colors whitespace-nowrap shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {category.fields.map((field) => {
                    if (field.showWhen) {
                      const depValue = String(currentValues[field.showWhen.field] ?? '');
                      if (field.showWhen.equals && depValue !== field.showWhen.equals) return null;
                      if (field.showWhen.notEquals && depValue === field.showWhen.notEquals) return null;
                    }

                    const value = currentValues[field.key];
                    const colSpan = field.halfWidth ? 'sm:col-span-1' : 'sm:col-span-2';
                    const inputId = `qr-field-${selectedCategory}-${field.key}`;

                    if (field.type === 'checkbox') {
                      return (
                        <div key={field.key} className={`${colSpan} flex items-center gap-2.5 pt-1`}>
                          <input
                            id={inputId}
                            type="checkbox"
                            checked={Boolean(value)}
                            onChange={(e) => handleFieldChange(field.key, e.target.checked)}
                            className="w-4 h-4 rounded border-[#E8ECF4] text-[#6366F1] focus:ring-[#6366F1]"
                          />
                          <label
                            htmlFor={inputId}
                            className="text-sm font-medium text-[#172033] dark:text-slate-200 cursor-pointer"
                          >
                            {field.label}
                          </label>
                        </div>
                      );
                    }

                    return (
                      <div key={field.key} className={colSpan}>
                        <label
                          htmlFor={inputId}
                          className="block text-xs font-semibold text-[#172033] dark:text-slate-200 mb-1.5"
                        >
                          {field.label}
                          {field.required && <span className="text-[#6366F1] ml-1">*</span>}
                        </label>

                        {field.type === 'select' ? (
                          <select
                            id={inputId}
                            value={String(value ?? '')}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8ECF4] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800/80 text-sm text-[#172033] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                          >
                            {field.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : field.type === 'textarea' ? (
                          <textarea
                            id={inputId}
                            rows={3}
                            value={String(value ?? '')}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8ECF4] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800/80 text-sm text-[#172033] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                          />
                        ) : (
                          <input
                            id={inputId}
                            type={field.type}
                            value={String(value ?? '')}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8ECF4] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800/80 text-sm text-[#172033] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                          />
                        )}

                        {field.helperText && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            {field.helperText}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

              {selectedCategory === 'universal-link' && universalFieldDetection?.isValidUrl && (
                <div className="mt-4 rounded-xl border border-[#E8ECF4] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900/50 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1.5 font-medium text-[#172033] dark:text-white">
                        <Globe className="w-3.5 h-3.5 text-[#6366F1]" />
                        {universalFieldDetection.platformName}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{universalFieldDetection.linkType}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[#6366F1] dark:text-[#A78BFA]">
                        {universalFieldDetection.domain}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Encodes exact link: <span className="font-mono">{payload}</span>. QRtiva does not
                      verify destination website content or safety.
                    </p>
                  </div>

                  {universalFieldDetection.recognized &&
                    universalFieldDetection.suggestedCategoryId !== 'universal-link' &&
                    !lockCategory && (
                      <button
                        type="button"
                        onClick={() =>
                          applySmartUrlToCategory(
                            universalFieldDetection.suggestedCategoryId,
                            universalFieldDetection.normalizedUrl
                          )
                        }
                        className="px-3 py-1.5 rounded-lg border border-[#6366F1]/40 bg-[#6366F1]/10 text-[#6366F1] dark:text-[#A78BFA] font-semibold whitespace-nowrap shrink-0 hover:bg-[#6366F1]/15"
                      >
                        Switch to {universalFieldDetection.suggestedCategoryLabel}
                      </button>
                    )}
                </div>
              )}

              {!isValid && error && (
                <div
                  role="alert"
                  className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3.5 py-3 text-xs font-medium text-amber-800 dark:text-amber-200 space-y-2.5"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>

                  {standardBuild?.suggestUniversal && (
                    <div className="flex flex-wrap items-center gap-2 pl-6">
                      {!lockCategory ? (
                        <>
                          {mismatchDetection?.isValidUrl &&
                            mismatchDetection.recognized &&
                            mismatchDetection.suggestedCategoryId !== selectedCategory && (
                              <button
                                type="button"
                                onClick={() =>
                                  applySmartUrlToCategory(
                                    mismatchDetection.suggestedCategoryId,
                                    mismatchDetection.normalizedUrl
                                  )
                                }
                                className="px-3 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#5254E1] text-white text-xs font-semibold whitespace-nowrap shrink-0 transition-colors"
                              >
                                Switch to {mismatchDetection.suggestedCategoryLabel}
                              </button>
                            )}
                          <button
                            type="button"
                            onClick={() => {
                              const key = getPrimaryFieldKeyForCategory(selectedCategory) ?? 'url';
                              const raw = String(currentValues[key] ?? '').trim();
                              applySmartUrlToCategory(
                                'universal-link',
                                mismatchDetection?.isValidUrl ? mismatchDetection.normalizedUrl : raw
                              );
                            }}
                            className="px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-amber-900 dark:text-amber-100 hover:border-[#6366F1] text-xs font-semibold whitespace-nowrap shrink-0 transition-colors"
                          >
                            Use Other / Universal Link
                          </button>
                        </>
                      ) : (
                        onNavigate && (
                          <button
                            type="button"
                            onClick={() => onNavigate('/universal-qr-code-generator')}
                            className="px-3 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#5254E1] text-white text-xs font-semibold whitespace-nowrap shrink-0 transition-colors"
                          >
                            Open Other / Universal Link
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Design & Customization */}
            <div className="pt-6 border-t border-[#E8ECF4] dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h3 className="font-display text-base font-semibold text-[#172033] dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#6366F1]" />
                  <span>02. Customize Design</span>
                </h3>

                <div
                  role="tablist"
                  aria-label="Customization Sections"
                  className="flex items-center gap-1 p-1 rounded-lg bg-[#F8FAFC] dark:bg-slate-800/80 border border-[#E8ECF4] dark:border-slate-700"
                >
                  {(
                    [
                      ['style', 'Style & Colors'],
                      ['logo', 'Logo'],
                      ['frame', 'Frame'],
                      ['advanced', 'Precision'],
                    ] as const
                  ).map(([tabKey, tabLabel]) => (
                    <button
                      key={tabKey}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === tabKey}
                      onClick={() => setActiveTab(tabKey)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        activeTab === tabKey
                          ? 'bg-white dark:bg-slate-900 text-[#172033] dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-[#172033] dark:hover:text-white'
                      }`}
                    >
                      {tabLabel}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab 1: Style & Colors */}
              {activeTab === 'style' && (
                <div className="space-y-5">
                  <div>
                    <span className="block text-xs font-semibold text-[#172033] dark:text-slate-200 mb-2">
                      Quick Color Palettes
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() =>
                            setOptions((prev) => ({
                              ...prev,
                              fgColor: preset.fg,
                              bgColor: preset.bg,
                              frameColor: preset.frame,
                            }))
                          }
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E8ECF4] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800/60 text-xs font-medium text-[#172033] dark:text-slate-200 hover:border-[#6366F1] transition-colors whitespace-nowrap shrink-0"
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-sm border border-black/10"
                            style={{ backgroundColor: preset.fg }}
                          />
                          <span>{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="qr-fg-color"
                        className="block text-xs font-semibold text-[#172033] dark:text-slate-200 mb-1.5"
                      >
                        Foreground Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id="qr-fg-color"
                          type="color"
                          value={options.fgColor}
                          onChange={(e) =>
                            setOptions((prev) => ({ ...prev, fgColor: e.target.value }))
                          }
                          className="w-10 h-10 rounded-lg border border-[#E8ECF4] dark:border-slate-700 cursor-pointer bg-transparent p-0.5"
                        />
                        <input
                          type="text"
                          aria-label="Foreground hex color"
                          value={options.fgColor}
                          onChange={(e) =>
                            setOptions((prev) => ({ ...prev, fgColor: e.target.value }))
                          }
                          className="flex-1 px-3 py-2 rounded-lg border border-[#E8ECF4] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800 text-xs font-mono text-[#172033] dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="qr-bg-color"
                        className="block text-xs font-semibold text-[#172033] dark:text-slate-200 mb-1.5"
                      >
                        Background Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id="qr-bg-color"
                          type="color"
                          value={options.bgColor}
                          onChange={(e) =>
                            setOptions((prev) => ({ ...prev, bgColor: e.target.value }))
                          }
                          className="w-10 h-10 rounded-lg border border-[#E8ECF4] dark:border-slate-700 cursor-pointer bg-transparent p-0.5"
                        />
                        <input
                          type="text"
                          aria-label="Background hex color"
                          value={options.bgColor}
                          onChange={(e) =>
                            setOptions((prev) => ({ ...prev, bgColor: e.target.value }))
                          }
                          className="flex-1 px-3 py-2 rounded-lg border border-[#E8ECF4] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800 text-xs font-mono text-[#172033] dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="block text-xs font-semibold text-[#172033] dark:text-slate-200 mb-2">
                        Module Dot Shape
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {(
                          [
                            ['square', 'Square'],
                            ['rounded', 'Rounded'],
                            ['dots', 'Circular Dots'],
                            ['diamond', 'Diamond'],
                          ] as [DotStyle, string][]
                        ).map(([val, label]) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setOptions((prev) => ({ ...prev, dotStyle: val }))}
                            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                              options.dotStyle === val
                                ? 'border-[#6366F1] bg-[#6366F1]/10 text-[#6366F1] dark:text-[#A78BFA]'
                                : 'border-[#E8ECF4] dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="block text-xs font-semibold text-[#172033] dark:text-slate-200 mb-2">
                        Corner Eye Style
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {(
                          [
                            ['square', 'Square'],
                            ['rounded', 'Soft'],
                            ['circle', 'Circle'],
                          ] as [EyeStyle, string][]
                        ).map(([val, label]) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setOptions((prev) => ({ ...prev, eyeStyle: val }))}
                            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                              options.eyeStyle === val
                                ? 'border-[#6366F1] bg-[#6366F1]/10 text-[#6366F1] dark:text-[#A78BFA]'
                                : 'border-[#E8ECF4] dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Logo Overlay */}
              {activeTab === 'logo' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#6366F1] hover:bg-[#5254E1] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                    >
                      <ImagePlus className="w-4 h-4" />
                      <span>{options.logoDataUrl ? 'Replace Center Logo' : 'Upload Center Logo'}</span>
                    </button>

                    {options.logoDataUrl && (
                      <button
                        type="button"
                        onClick={() => setOptions((prev) => ({ ...prev, logoDataUrl: null }))}
                        className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-[#E8ECF4] dark:border-slate-700 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors whitespace-nowrap shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Logo</span>
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Supports PNG, SVG, JPG, or WebP up to 2 MB. Adding a logo automatically keeps a
                    protective quiet padding zone and recommends High (H) error correction.
                  </p>

                  {options.logoDataUrl && (
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-[#172033] dark:text-slate-200 mb-1.5">
                        <span>Logo Size Coverage</span>
                        <span className="font-mono tabular-nums">
                          {Math.round(options.logoSizeRatio * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={14}
                        max={26}
                        step={1}
                        value={Math.round(options.logoSizeRatio * 100)}
                        onChange={(e) =>
                          setOptions((prev) => ({
                            ...prev,
                            logoSizeRatio: Number(e.target.value) / 100,
                          }))
                        }
                        className="w-full accent-[#6366F1]"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Frame & Label */}
              {activeTab === 'frame' && (
                <div className="space-y-4">
                  <div>
                    <span className="block text-xs font-semibold text-[#172033] dark:text-slate-200 mb-2">
                      Frame Layout
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(
                        [
                          ['none', 'No Frame'],
                          ['minimal', 'Clean Border'],
                          ['banner-bottom', 'Bottom Label'],
                          ['banner-top', 'Top Label'],
                        ] as [FrameStyle, string][]
                      ).map(([val, label]) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setOptions((prev) => ({ ...prev, frameStyle: val }))}
                          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                            options.frameStyle === val
                              ? 'border-[#6366F1] bg-[#6366F1]/10 text-[#6366F1] dark:text-[#A78BFA]'
                              : 'border-[#E8ECF4] dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {options.frameStyle !== 'none' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {options.frameStyle !== 'minimal' && (
                        <div>
                          <label
                            htmlFor="qr-frame-label"
                            className="block text-xs font-semibold text-[#172033] dark:text-slate-200 mb-1.5"
                          >
                            Frame Call-to-Action Text
                          </label>
                          <input
                            id="qr-frame-label"
                            type="text"
                            maxLength={24}
                            value={options.frameText}
                            onChange={(e) =>
                              setOptions((prev) => ({ ...prev, frameText: e.target.value }))
                            }
                            placeholder="SCAN ME"
                            className="w-full px-3.5 py-2 rounded-lg border border-[#E8ECF4] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800 text-sm text-[#172033] dark:text-white"
                          />
                        </div>
                      )}

                      <div>
                        <label
                          htmlFor="qr-frame-color"
                          className="block text-xs font-semibold text-[#172033] dark:text-slate-200 mb-1.5"
                        >
                          Frame Accent Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            id="qr-frame-color"
                            type="color"
                            value={options.frameColor}
                            onChange={(e) =>
                              setOptions((prev) => ({ ...prev, frameColor: e.target.value }))
                            }
                            className="w-10 h-10 rounded-lg border border-[#E8ECF4] dark:border-slate-700 cursor-pointer bg-transparent p-0.5"
                          />
                          <input
                            type="text"
                            aria-label="Frame color hex"
                            value={options.frameColor}
                            onChange={(e) =>
                              setOptions((prev) => ({ ...prev, frameColor: e.target.value }))
                            }
                            className="flex-1 px-3 py-2 rounded-lg border border-[#E8ECF4] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800 text-xs font-mono text-[#172033] dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Precision / Error Correction */}
              {activeTab === 'advanced' && (
                <div className="space-y-4">
                  <div>
                    <span className="block text-xs font-semibold text-[#172033] dark:text-slate-200 mb-2">
                      Error Correction Level
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(
                        [
                          ['L', 'L · 7%'],
                          ['M', 'M · 15%'],
                          ['Q', 'Q · 25%'],
                          ['H', 'H · 30%'],
                        ] as [ErrorCorrectionLevel, string][]
                      ).map(([lvl, label]) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() =>
                            setOptions((prev) => ({ ...prev, errorCorrectionLevel: lvl }))
                          }
                          className={`px-3 py-2 rounded-lg text-xs font-medium font-mono border transition-colors whitespace-nowrap ${
                            options.errorCorrectionLevel === lvl
                              ? 'border-[#6366F1] bg-[#6366F1]/10 text-[#6366F1] dark:text-[#A78BFA]'
                              : 'border-[#E8ECF4] dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                      Higher error correction allows QR codes to still scan cleanly even when a
                      logo covers the center or printed labels wear down.
                    </p>
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-[#172033] dark:text-slate-200 mb-2">
                      Quiet Zone Margin
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {[2, 3, 4, 6].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setOptions((prev) => ({ ...prev, margin: m }))}
                          className={`px-3 py-2 rounded-lg text-xs font-medium font-mono border transition-colors ${
                            options.margin === m
                              ? 'border-[#6366F1] bg-[#6366F1]/10 text-[#6366F1] dark:text-[#A78BFA]'
                              : 'border-[#E8ECF4] dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {m} mod
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live QR Preview + Scannability Check + Free Downloads */}
          <div className="lg:col-span-5 p-5 sm:p-7 bg-[#F8FAFC]/70 dark:bg-slate-900/40 flex flex-col justify-between gap-6">
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-base font-semibold text-[#172033] dark:text-white">
                  Live QR Preview
                </h3>
                <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  {matrix ? `${matrix.size}×${matrix.size} matrix` : 'Ready'}
                </span>
              </div>

              {/* QR Preview Frame */}
              <div className="relative rounded-xl border border-[#E8ECF4] dark:border-slate-800 bg-white dark:bg-slate-950 p-5 sm:p-7 flex items-center justify-center min-h-[280px] sm:min-h-[320px]">
                <div
                  className="pointer-events-none absolute inset-4 rounded-xl bg-gradient-to-tr from-[#6366F1]/10 via-[#A78BFA]/10 to-[#67E8F9]/10 blur-xl"
                  aria-hidden="true"
                />
                {previewSvg ? (
                  <div
                    className="qr-preview-box relative z-10 w-full max-w-[260px] sm:max-w-[280px] mx-auto rounded-lg shadow-xs border border-[#E8ECF4] dark:border-slate-800"
                    dangerouslySetInnerHTML={{ __html: previewSvg }}
                    aria-label="Generated QR code preview"
                  />
                ) : (
                  <div className="relative z-10 text-center max-w-xs space-y-2 px-3">
                    <p className="text-xs font-semibold text-[#172033] dark:text-slate-200">
                      Enter valid data to preview QR code
                    </p>
                  </div>
                )}
              </div>

              {/* Real-Time Optical QR Readability Verification */}
              {matrix && (
                <div
                  className={`rounded-xl border px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs ${
                    scannability.verified && scannability.exactMatch && contrastRatio >= 3
                      ? 'border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200'
                      : 'border-amber-200 dark:border-amber-900/70 bg-amber-50/70 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {scannability.verified && scannability.exactMatch && contrastRatio >= 3 ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    )}
                    <span className="font-medium truncate">
                      {!scannability.exactMatch && scannability.verified
                        ? 'Decoded QR image mismatch — click Auto-Fix to restore exact payload'
                        : scannability.verified && contrastRatio >= 3
                          ? `Scannable · ${contrastRatio}:1 contrast`
                          : `Low scan contrast (${contrastRatio}:1) — adjust colors or logo`}
                    </span>
                  </div>

                  {(!scannability.verified || !scannability.exactMatch || contrastRatio < 3) && (
                    <button
                      type="button"
                      onClick={fixReadability}
                      className="px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-[11px] font-semibold shrink-0 hover:bg-amber-50"
                    >
                      Auto-Fix
                    </button>
                  )}
                </div>
              )}

              {/* Export Resolution Picker */}
              <div>
                <span className="block text-xs font-semibold text-[#172033] dark:text-slate-200 mb-2">
                  Export Resolution
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      [512, '512 px'],
                      [1024, '1024 × 1024'],
                      [2048, '2048 × 2048'],
                      ['custom', 'Custom'],
                    ] as [ResolutionPreset, string][]
                  ).map(([res, label]) => (
                    <button
                      key={String(res)}
                      type="button"
                      onClick={() => setResolutionPreset(res)}
                      className={`px-2.5 py-2 rounded-lg text-xs font-medium font-mono tabular-nums border transition-colors whitespace-nowrap ${
                        resolutionPreset === res
                          ? 'border-[#6366F1] bg-[#6366F1]/10 text-[#6366F1] dark:text-[#A78BFA]'
                          : 'border-[#E8ECF4] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {resolutionPreset === 'custom' && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <label
                      htmlFor="qr-custom-size"
                      className="text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap"
                    >
                      Width (px):
                    </label>
                    <input
                      id="qr-custom-size"
                      type="number"
                      min={256}
                      max={4096}
                      step={64}
                      value={customResolution}
                      onChange={(e) => setCustomResolution(Number(e.target.value))}
                      className="w-28 px-3 py-1.5 rounded-lg border border-[#E8ECF4] dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-[#172033] dark:text-white"
                    />
                    <span className="text-[11px] text-slate-500">256 – 4096 px</span>
                  </div>
                )}
              </div>
            </div>

            {/* Download & Copy Action Bar */}
            <div className="space-y-3 pt-4 border-t border-[#E8ECF4] dark:border-slate-800">
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  disabled={!canDownload || downloadingFormat !== null}
                  onClick={() => handleDownload('png')}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-[#6366F1] hover:bg-[#5254E1] disabled:opacity-50 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloadingFormat === 'png' ? 'Saving...' : 'PNG'}</span>
                </button>
                <button
                  type="button"
                  disabled={!canDownload || downloadingFormat !== null}
                  onClick={() => handleDownload('jpg')}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-[#E8ECF4] dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-[#6366F1] disabled:opacity-50 text-[#172033] dark:text-white text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5 text-[#6366F1]" />
                  <span>{downloadingFormat === 'jpg' ? 'Saving...' : 'JPG'}</span>
                </button>
                <button
                  type="button"
                  disabled={!canDownload || downloadingFormat !== null}
                  onClick={() => handleDownload('svg')}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-[#E8ECF4] dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-[#6366F1] disabled:opacity-50 text-[#172033] dark:text-white text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5 text-[#6366F1]" />
                  <span>{downloadingFormat === 'svg' ? 'Saving...' : 'SVG'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={!canDownload}
                  onClick={handleCopyImage}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[#E8ECF4] dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-[#F8FAFC] dark:hover:bg-slate-800 disabled:opacity-50 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap"
                >
                  {copiedImage ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedImage ? 'Copied PNG' : 'Copy QR Image'}</span>
                </button>
                <button
                  type="button"
                  disabled={!isValid}
                  onClick={handleCopyPayload}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[#E8ECF4] dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-[#F8FAFC] dark:hover:bg-slate-800 disabled:opacity-50 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap"
                >
                  {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPayload ? 'Copied' : 'Copy Payload'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
