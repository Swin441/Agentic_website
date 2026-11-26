import React, {useState} from 'react';
import {HeroVisualContainer} from './HeroVisualContainer';
import {CONCEPT_DEMOS} from '../../data/siteData';
import {ResilientImage} from '../ui/ResilientImage';
import {Link} from '../../router/RouterContext';

export function WorkHeroVisual() {
  const [activeIndex, setActiveIndex] = useState(0);
  const demo = CONCEPT_DEMOS[activeIndex];

  return (
    <HeroVisualContainer label="Interactive Concept Demo Showcase">
      <div className="px-5 py-4 border-b border-[#203C30] flex flex-wrap items-center justify-between gap-2 bg-[#07130F]/50">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-[#AEF830]">{demo.kind}</span>
          <span className="text-[#53685E]" aria-hidden="true">
            ·
          </span>
          <span className="text-[#A6B4AC]">{demo.sector}</span>
        </div>

        <div className="flex items-center gap-1">
          {CONCEPT_DEMOS.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`Preview ${item.title}`}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                idx === activeIndex
                  ? 'bg-[#AEF830] text-[#07130F] font-semibold'
                  : 'bg-[#07130F] text-[#A6B4AC] border border-[#203C30] hover:text-white'
              }`}
            >
              0{idx + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">
        <div className="relative rounded-xl overflow-hidden border border-[#203C30] aspect-[16/9]">
          <ResilientImage
            src="/src/assets/images/demo_coaching_portal_1795632511868.jpg"
            alt={`${demo.title} concept interface`}
            fallbackTitle={demo.title}
            fallbackSubtitle={`${demo.kind} · ${demo.sector}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07130F] via-[#07130F]/40 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <p className="font-mono text-[11px] text-[#AEF830]">{demo.kind}</p>
            <p className="text-base font-semibold text-white mt-0.5">{demo.title}</p>
          </div>
        </div>

        <div className="rounded-xl bg-[#07130F] border border-[#203C30] p-4 space-y-3">
          <p className="text-xs sm:text-sm text-[#A6B4AC] leading-relaxed">{demo.summary}</p>
          <div className="flex items-center justify-between pt-2 border-t border-[#203C30]">
            <Link
              to={demo.relatedServiceRoute}
              className="font-mono text-xs text-[#AEF830] hover:underline"
            >
              Inspect architecture →
            </Link>
            <span className="font-mono text-[11px] text-[#53685E]">
              Unverified client claims omitted
            </span>
          </div>
        </div>
      </div>
    </HeroVisualContainer>
  );
}
