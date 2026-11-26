import React, {useState} from 'react';
import {ArrowRight, Calendar, MessageSquare, Sheet} from 'lucide-react';
import {HeroVisualContainer} from './HeroVisualContainer';
import {MiniRobot} from './MiniRobot';

type ScenarioId = 'coaching' | 'clinic' | 'retail';

const SCENARIOS: Record<
  ScenarioId,
  {
    tabLabel: string;
    channel: string;
    customerMessage: string;
    agentReply: string;
    automatedSteps: {icon: 'chat' | 'sheet' | 'calendar'; title: string; detail: string}[];
  }
> = {
  coaching: {
    tabLabel: 'Coaching',
    channel: 'WhatsApp Enquiry · 9:42 PM',
    customerMessage:
      'Hi, do you have an evening batch for Class 11 Science starting next month? What is the fee?',
    agentReply:
      'Yes — our evening Science batch runs 5:30 PM to 7:30 PM (Mon–Fri). Would you like me to share the fee card and book a free demo class for Saturday?',
    automatedSteps: [
      {
        icon: 'chat',
        title: 'Instant brochure & batch reply',
        detail: 'Answered outside office hours with verified batch timings',
      },
      {
        icon: 'sheet',
        title: 'Logged in Admissions Tracker',
        detail: 'Class 11 Science · Evening Batch · Parent Callback Requested',
      },
      {
        icon: 'calendar',
        title: 'Demo slot reserved',
        detail: 'Saturday 11:00 AM · Reminder scheduled on WhatsApp',
      },
    ],
  },
  clinic: {
    tabLabel: 'Clinic',
    channel: 'Web & WhatsApp Desk',
    customerMessage:
      'Need an orthopaedic consultation tomorrow morning. Is Dr. Sen available around 11 AM?',
    agentReply:
      'Dr. Sen is available tomorrow at 11:15 AM and 11:45 AM. Reply with your preferred slot and patient name to confirm your token.',
    automatedSteps: [
      {
        icon: 'calendar',
        title: 'Live slot check & token hold',
        detail: 'Matched against morning OPD schedule without phone wait',
      },
      {
        icon: 'chat',
        title: 'Pre-visit reminder queued',
        detail: 'Location map & previous-report checklist sent automatically',
      },
      {
        icon: 'sheet',
        title: 'Front-desk queue updated',
        detail: 'Reception sees confirmed arrival in the clinic portal',
      },
    ],
  },
  retail: {
    tabLabel: 'Distribution',
    channel: 'Dealer Order Desk',
    customerMessage:
      'Send 20 cartons of 1L Mustard Oil and 10 boxes of 500ml pack to Dispur Mart by Thursday.',
    agentReply:
      'Order draft prepared for Dispur Mart (30 total units). Confirm delivery address and GST billing preference to generate dispatch ticket.',
    automatedSteps: [
      {
        icon: 'sheet',
        title: 'Structured order entry',
        detail: 'Converted free-text message into SKU quantities automatically',
      },
      {
        icon: 'chat',
        title: 'Dispatch & LR updates',
        detail: 'Retailer receives automated dispatch confirmation when loaded',
      },
      {
        icon: 'calendar',
        title: 'Due-date reminder scheduled',
        detail: 'Polite invoice follow-up queued as per credit terms',
      },
    ],
  },
};

export function HomeHeroVisual() {
  const [active, setActive] = useState<ScenarioId>('coaching');
  const [robotPanelHovered, setRobotPanelHovered] = useState(false);
  const scenario = SCENARIOS[active];

  return (
    <HeroVisualContainer label="Interactive Axom Hub AI Operations Preview">
      {/* Top interactive switcher bar */}
      <div className="px-5 py-4 border-b border-[#203C30] flex flex-wrap items-center justify-between gap-3 bg-[#07130F]/50">
        <span className="font-mono text-xs text-[#A6B4AC]">
          Interactive Preview · Select Business Type
        </span>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#07130F] border border-[#203C30]">
          {(Object.keys(SCENARIOS) as ScenarioId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setActive(id)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                active === id
                  ? 'bg-[#AEF830] text-[#07130F]'
                  : 'text-[#A6B4AC] hover:text-white'
              }`}
            >
              {SCENARIOS[id].tabLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Main preview workspace */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-5">
        <div className="flex flex-col sm:flex-row items-stretch gap-4">
          {/* Mobile compact miniature robot stage */}
          <div className="flex sm:hidden items-center gap-4 rounded-xl bg-[#07130F]/70 border border-[#203C30] px-4 py-3">
            <MiniRobot size="sm" scenarioKey={active} simplified />
            <div className="min-w-0">
              <p className="font-mono text-[11px] text-[#AEF830]">
                {scenario.tabLabel} Agent
              </p>
              <p className="text-xs text-[#A6B4AC] mt-1 leading-relaxed">
                Handles incoming enquiries and logs structured updates automatically.
              </p>
            </div>
          </div>

          {/* Conversation preview */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="font-mono text-[11px] text-[#53685E]">{scenario.channel}</div>

            {/* Customer prompt bubble */}
            <div className="rounded-xl bg-[#07130F] border border-[#203C30] p-4">
              <p className="font-mono text-[11px] text-[#A6B4AC] mb-1">Customer message</p>
              <p className="text-sm text-white leading-relaxed">{scenario.customerMessage}</p>
            </div>

            {/* Agent reply bubble */}
            <div className="rounded-xl bg-[#16221E] border border-[#AEF830]/35 p-4">
              <p className="font-mono text-[11px] text-[#AEF830] mb-1">Axom Hub AI Agent</p>
              <p className="text-sm text-[#D8E6DE] leading-relaxed">{scenario.agentReply}</p>
            </div>
          </div>

          {/* Desktop miniature robot showcase stage */}
          <div
            onMouseEnter={() => setRobotPanelHovered(true)}
            onMouseLeave={() => setRobotPanelHovered(false)}
            className={`hidden sm:flex w-[168px] xl:w-[184px] shrink-0 rounded-xl bg-[#07130F]/65 border px-3 py-4 flex-col items-center justify-center relative overflow-hidden transition-colors duration-300 ${
              robotPanelHovered ? 'border-[#AEF830]/45' : 'border-[#203C30]'
            }`}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 axom-grid-bg opacity-35 [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]"
            />
            <MiniRobot
              size="md"
              scenarioKey={active}
              panelHovered={robotPanelHovered}
              statusText={`${scenario.tabLabel} Agent`}
              className="relative z-10"
            />
          </div>
        </div>

        {/* Automated downstream actions */}
        <div className="pt-4 border-t border-[#203C30]">
          <p className="font-mono text-[11px] text-[#A6B4AC] mb-3">
            Automated background actions
          </p>
          <div className="space-y-2.5">
            {scenario.automatedSteps.map((step) => {
              const Icon =
                step.icon === 'chat'
                  ? MessageSquare
                  : step.icon === 'sheet'
                    ? Sheet
                    : Calendar;
              return (
                <div
                  key={step.title}
                  className="flex items-start gap-3 rounded-lg bg-[#07130F]/70 border border-[#203C30] px-3.5 py-2.5"
                >
                  <Icon className="w-4 h-4 text-[#AEF830] shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white">{step.title}</p>
                    <p className="text-xs text-[#A6B4AC] mt-0.5">{step.detail}</p>
                  </div>
                  <ArrowRight
                    className="w-3.5 h-3.5 text-[#53685E] shrink-0 ml-auto mt-1"
                    aria-hidden="true"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </HeroVisualContainer>
  );
}
