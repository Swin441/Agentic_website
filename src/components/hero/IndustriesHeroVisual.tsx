import React, {useState} from 'react';
import {HeroVisualContainer} from './HeroVisualContainer';
import {INDUSTRIES} from '../../data/siteData';
import {Link} from '../../router/RouterContext';

export function IndustriesHeroVisual() {
  const [selectedId, setSelectedId] = useState<string>(INDUSTRIES[0].id);
  const current = INDUSTRIES.find((i) => i.id === selectedId) ?? INDUSTRIES[0];

  return (
    <HeroVisualContainer label="Interactive Industry Workflow Selector">
      <div className="px-5 py-4 border-b border-[#203C30] flex items-center justify-between bg-[#07130F]/50">
        <span className="font-mono text-xs text-[#A6B4AC]">
          Select an Industry · View Practical Upgrade
        </span>
        <span className="font-mono text-xs text-[#AEF830] tabular-nums">{current.number}</span>
      </div>

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-5">
        <div className="flex flex-wrap gap-2">
          {INDUSTRIES.map((industry) => {
            const active = industry.id === selectedId;
            return (
              <button
                key={industry.id}
                type="button"
                onClick={() => setSelectedId(industry.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#AEF830] text-[#07130F] border-[#AEF830]'
                    : 'bg-[#07130F] text-[#A6B4AC] border-[#203C30] hover:text-white hover:border-[#A6B4AC]/50'
                }`}
              >
                {industry.name}
              </button>
            );
          })}
        </div>

        <div className="rounded-xl bg-[#07130F] border border-[#203C30] p-5 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{current.name}</h2>
            <p className="text-xs text-[#A6B4AC] mt-1">{current.audience}</p>
          </div>

          <div className="pt-3 border-t border-[#203C30]">
            <p className="font-mono text-[11px] text-[#53685E] mb-1">Daily bottleneck</p>
            <p className="text-sm text-[#A6B4AC] leading-relaxed">{current.bottleneck}</p>
          </div>

          <div className="pt-3 border-t border-[#203C30]">
            <p className="font-mono text-[11px] text-[#AEF830] mb-1">Axom Hub solution</p>
            <p className="text-sm text-white leading-relaxed">{current.solution}</p>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <Link
              to="/contact"
              className="font-mono text-xs text-[#AEF830] hover:underline"
            >
              Book a demo for {current.name} →
            </Link>
          </div>
        </div>
      </div>
    </HeroVisualContainer>
  );
}
