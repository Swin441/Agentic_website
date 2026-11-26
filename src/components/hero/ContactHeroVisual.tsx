import React, {useState} from 'react';
import {HeroVisualContainer} from './HeroVisualContainer';

const SESSION_TOPICS = [
  {
    id: 'audit',
    title: '01. Understand your daily routine',
    summary:
      'We ask where enquiries currently arrive (WhatsApp, phone, Instagram, website) and what your staff types or copies repeatedly.',
    bring: 'Helpful to share: 2–3 common customer questions you receive every day.',
  },
  {
    id: 'demo',
    title: '02. Walk through a live tailored demo',
    summary:
      'We demonstrate how an AI agent, automation flow, or simple portal would look for your specific type of business.',
    bring: 'Helpful to share: Which tools you already use (WhatsApp Business, Google Sheets, Excel, etc.).',
  },
  {
    id: 'plan',
    title: '03. Agree on a practical first milestone',
    summary:
      'You receive a clear scope, realistic timeline, and transparent build plan—focused on solving one bottleneck well first.',
    bring: 'Helpful to share: When you would like to begin.',
  },
] as const;

export function ContactHeroVisual() {
  const [selectedId, setSelectedId] = useState<'audit' | 'demo' | 'plan'>('audit');
  const current = SESSION_TOPICS.find((t) => t.id === selectedId) ?? SESSION_TOPICS[0];

  return (
    <HeroVisualContainer label="What Happens in Your Free Demo Walkthrough">
      <div className="px-5 py-4 border-b border-[#203C30] flex items-center justify-between bg-[#07130F]/50">
        <span className="font-mono text-xs text-[#A6B4AC]">
          What to Expect on Your Demo Call
        </span>
        <span className="font-mono text-xs text-[#AEF830]">30 Minutes</span>
      </div>

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-3">
          {SESSION_TOPICS.map((topic) => {
            const active = topic.id === selectedId;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => setSelectedId(topic.id)}
                className={`w-full text-left rounded-xl p-4 border transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#16221E] border-[#AEF830]'
                    : 'bg-[#07130F] border-[#203C30] hover:border-[#A6B4AC]/50'
                }`}
              >
                <p className="text-sm font-semibold text-white">{topic.title}</p>
                {active && (
                  <p className="text-xs sm:text-sm text-[#A6B4AC] mt-2 leading-relaxed">
                    {topic.summary}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        <div className="rounded-xl bg-[#07130F] border border-[#203C30] p-4">
          <p className="font-mono text-[11px] text-[#AEF830] mb-1">Preparation note</p>
          <p className="text-xs sm:text-sm text-white leading-relaxed">{current.bring}</p>
        </div>
      </div>
    </HeroVisualContainer>
  );
}
