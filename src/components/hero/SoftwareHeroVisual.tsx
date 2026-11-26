import React, {useState} from 'react';
import {HeroVisualContainer} from './HeroVisualContainer';
import {ResilientImage} from '../ui/ResilientImage';

const PORTAL_VIEWS = [
  {
    id: 'batches',
    label: 'Batch & Fee Ledger',
    rows: [
      {col1: 'Class 11 Science — Evening', col2: 'Schedule Mon–Fri', col3: 'Fee reminders active'},
      {col1: 'Foundation Batch — Weekend', col2: 'Schedule Sat–Sun', col3: 'Demo slots open'},
      {col1: 'Crash Revision — Morning', col2: 'Schedule Daily', col3: 'Attendance synced'},
    ],
  },
  {
    id: 'orders',
    label: 'Dealer Order Desk',
    rows: [
      {col1: 'Dispur Retail Mart', col2: '30 units', col3: 'Dispatch scheduled'},
      {col1: 'Jorhat Central Traders', col2: '18 units', col3: 'Invoice generated'},
      {col1: 'Silchar Supply House', col2: '45 units', col3: 'Confirmed via portal'},
    ],
  },
] as const;

export function SoftwareHeroVisual() {
  const [viewId, setViewId] = useState<'batches' | 'orders'>('batches');
  const activeView = PORTAL_VIEWS.find((v) => v.id === viewId) ?? PORTAL_VIEWS[0];

  return (
    <HeroVisualContainer label="Custom Software & Portal Interface Preview">
      <div className="px-5 py-4 border-b border-[#203C30] flex flex-wrap items-center justify-between gap-3 bg-[#07130F]/50">
        <span className="font-mono text-xs text-[#A6B4AC]">
          Custom Software Interface
        </span>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#07130F] border border-[#203C30]">
          {PORTAL_VIEWS.map((view) => (
            <button
              key={view.id}
              type="button"
              onClick={() => setViewId(view.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                viewId === view.id
                  ? 'bg-[#AEF830] text-[#07130F]'
                  : 'text-[#A6B4AC] hover:text-white'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">
        <div className="relative rounded-xl overflow-hidden border border-[#203C30] aspect-[16/9]">
          <ResilientImage
            src="/src/assets/images/demo_coaching_portal_1795632511868.jpg"
            alt="Custom dark-mode business portal running on desktop and tablet"
            fallbackTitle="Custom Business Portal"
            fallbackSubtitle="Clean web & tablet workflows built around your team"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07130F]/90 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-mono">
            <span className="text-white">Responsive Web & Tablet Workspace</span>
            <span className="text-[#AEF830]">Role-based access</span>
          </div>
        </div>

        <div className="rounded-xl bg-[#07130F] border border-[#203C30] divide-y divide-[#203C30]">
          {activeView.rows.map((row) => (
            <div
              key={row.col1}
              className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs"
            >
              <span className="font-medium text-white">{row.col1}</span>
              <span className="font-mono text-[#A6B4AC] tabular-nums">{row.col2}</span>
              <span className="font-mono text-[#AEF830]">{row.col3}</span>
            </div>
          ))}
        </div>
      </div>
    </HeroVisualContainer>
  );
}
