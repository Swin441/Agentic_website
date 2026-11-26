import React, {useState} from 'react';
import {HeroVisualContainer} from './HeroVisualContainer';
import {PROCESS_STEPS} from '../../data/siteData';

export function AboutHeroVisual() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const step = PROCESS_STEPS[selectedIndex];

  return (
    <HeroVisualContainer label="Axom Hub Delivery Blueprint">
      <div className="px-5 py-4 border-b border-[#203C30] flex items-center justify-between bg-[#07130F]/50">
        <span className="font-mono text-xs text-[#A6B4AC]">
          How We Work With SMB Owners
        </span>
        <span className="font-mono text-xs text-[#AEF830]">4-Step Process</span>
      </div>

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-5">
        <div className="grid grid-cols-2 gap-3">
          {PROCESS_STEPS.map((item, idx) => {
            const active = idx === selectedIndex;
            return (
              <button
                key={item.number}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`text-left rounded-xl p-4 border transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#16221E] border-[#AEF830]'
                    : 'bg-[#07130F] border-[#203C30] hover:border-[#A6B4AC]/50'
                }`}
              >
                <span className="font-mono text-xs text-[#AEF830] tabular-nums">
                  {item.number}
                </span>
                <p className="text-sm font-semibold text-white mt-1.5">{item.title}</p>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl bg-[#07130F] border border-[#203C30] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-[#AEF830]">
              Step {step.number} · {step.title}
            </span>
          </div>
          <p className="text-sm text-[#A6B4AC] leading-relaxed">{step.description}</p>
          <div className="pt-3 border-t border-[#203C30]">
            <p className="font-mono text-[11px] text-[#53685E]">Outcome</p>
            <p className="text-xs sm:text-sm text-white mt-1 font-medium">{step.deliverable}</p>
          </div>
        </div>
      </div>
    </HeroVisualContainer>
  );
}
