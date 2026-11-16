import { useState } from 'react';
import { QrCode } from 'lucide-react';
import { toWebpPath } from '../types/blog.ts';

interface BlogImageProps {
  src: string;
  alt: string;
  title?: string;
  priority?: boolean;
  className?: string;
}

export function BlogImage({
  src,
  alt,
  title,
  priority = false,
  className = '',
}: BlogImageProps) {
  const [failed, setFailed] = useState(false);
  const webpSrc = toWebpPath(src);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`w-full aspect-video bg-gradient-to-br from-slate-100 via-indigo-50/70 to-slate-200 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 flex flex-col items-center justify-center gap-2 p-6 text-center ${className}`}
      >
        <div className="w-11 h-11 rounded-xl bg-[#6366F1]/10 dark:bg-[#6366F1]/20 flex items-center justify-center text-[#6366F1] dark:text-[#A78BFA]">
          <QrCode className="w-5 h-5" aria-hidden="true" />
        </div>
        {title && (
          <p className="font-display text-xs font-semibold text-slate-600 dark:text-slate-300 max-w-xs line-clamp-2">
            {title}
          </p>
        )}
      </div>
    );
  }

  return (
    <picture className={`block w-full h-full ${className}`}>
      {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
      <img
        src={src}
        alt={alt}
        width={1200}
        height={675}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="w-full h-full object-cover"
      />
    </picture>
  );
}
