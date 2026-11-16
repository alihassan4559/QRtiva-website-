import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SeoFaqItem } from '../data/seoPages.ts';

interface FaqAccordionProps {
  items: SeoFaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-[#E8ECF4] dark:divide-slate-800 rounded-2xl border border-[#E8ECF4] dark:border-slate-800 bg-white dark:bg-[#0F172A] overflow-hidden">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={item.question}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="w-full px-6 py-4.5 flex items-center justify-between gap-4 text-left hover:bg-[#F8FAFC] dark:hover:bg-slate-800/50 transition-colors"
            >
              <span className="font-display text-sm sm:text-base font-semibold text-[#172033] dark:text-white">
                {item.question}
              </span>
              <ChevronDown
                className={`w-4 h-4 shrink-0 text-slate-500 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-[#6366F1]' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-5 pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
