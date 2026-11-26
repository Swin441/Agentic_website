import React, {useState} from 'react';
import {Bot, Globe, LayoutDashboard, Workflow} from 'lucide-react';
import {HeroVisualContainer} from './HeroVisualContainer';
import {Link} from '../../router/RouterContext';

const ENGINE_LAYERS = [
  {
    id: 'agents',
    title: '01. AI Agents',
    subtitle: 'Customer-facing reception & lead qualification',
    icon: Bot,
    detail:
      'Responds immediately on WhatsApp and web chat, collects key customer details, and books appointments or callbacks.',
    connectsTo: 'Passes clean enquiry data directly into Business Automation.',
    route: '/services/ai-agents',
  },
  {
    id: 'automation',
    title: '02. Business Automation',
    subtitle: 'Connected follow-ups, sheets & reminders',
    icon: Workflow,
    detail:
      'Eliminates manual copy-paste between WhatsApp, forms, Google Sheets, calendars, and billing alerts.',
    connectsTo: 'Updates your Custom Software or team ledger automatically.',
    route: '/services/automation',
  },
  {
    id: 'software',
    title: '03. Custom Software',
    subtitle: 'Internal operations portals & dashboards',
    icon: LayoutDashboard,
    detail:
      'Gives owners and staff one clear system for student batches, clinic queues, dealer orders, or client tasks.',
    connectsTo: 'Exposes clean booking and status views to your Website & App.',
    route: '/services/software',
  },
  {
    id: 'web',
    title: '04. Websites & Applications',
    subtitle: 'Mobile-first digital storefront & customer portals',
    icon: Globe,
    detail:
      'Presents your business clearly on mobile phones and turns local visitors into structured enquiries.',
    connectsTo: 'Captures leads straight into AI Agents & Automation.',
    route: '/services/software',
  },
] as const;

export function ServicesHeroVisual() {
  const [selectedId, setSelectedId] = useState<(typeof ENGINE_LAYERS)[number]['id']>('agents');
  const activeLayer = ENGINE_LAYERS.find((l) => l.id === selectedId) ?? ENGINE_LAYERS[0];

  return (
    <HeroVisualContainer label="Axom Hub Connected Business Engine">
      <div className="px-5 py-4 border-b border-[#203C30] flex items-center justify-between bg-[#07130F]/50">
        <span className="font-mono text-xs text-[#A6B4AC]">
          Connected Business Engine · Click a layer
        </span>
        <span className="font-mono text-xs text-[#AEF830]">4 Core Layers</span>
      </div>

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ENGINE_LAYERS.map((layer) => {
            const Icon = layer.icon;
            const isSelected = layer.id === selectedId;
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => setSelectedId(layer.id)}
                className={`text-left rounded-xl p-4 border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#16221E] border-[#AEF830]'
                    : 'bg-[#07130F] border-[#203C30] hover:border-[#A6B4AC]/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon
                    className={`w-4 h-4 ${isSelected ? 'text-[#AEF830]' : 'text-[#A6B4AC]'}`}
                    aria-hidden="true"
                  />
                  <span className="font-mono text-[11px] text-[#53685E]">
                    {isSelected ? 'Selected' : 'Inspect'}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white">{layer.title}</p>
                <p className="text-xs text-[#A6B4AC] mt-1">{layer.subtitle}</p>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl bg-[#07130F] border border-[#203C30] p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-white">{activeLayer.title}</p>
            <Link
              to={activeLayer.route}
              className="font-mono text-xs text-[#AEF830] hover:underline whitespace-nowrap"
            >
              Open service page →
            </Link>
          </div>
          <p className="text-sm text-[#A6B4AC] leading-relaxed">{activeLayer.detail}</p>
          <p className="font-mono text-xs text-[#D8E6DE] pt-2 border-t border-[#203C30]">
            Integration: {activeLayer.connectsTo}
          </p>
        </div>
      </div>
    </HeroVisualContainer>
  );
}
