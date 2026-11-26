import React, {useState} from 'react';
import {Bot, User} from 'lucide-react';
import {HeroVisualContainer} from './HeroVisualContainer';

const AGENT_MODES = [
  {
    id: 'intake',
    label: 'Admission Intake',
    userMsg: 'Can you share details for the weekend NEET foundation batch and fees?',
    agentMsg:
      'Sure. Our Weekend Foundation Batch meets Sat–Sun (9:00 AM – 1:00 PM) at the Zoo Road centre. Would you like the PDF fee structure and a counselling call slot?',
    capturedFields: [
      {label: 'Intent', value: 'NEET Foundation · Weekend'},
      {label: 'Next Step', value: 'Send fee brochure + book call'},
      {label: 'Staff Handoff', value: 'Assigned to Academic Counsellor'},
    ],
  },
  {
    id: 'reschedule',
    label: 'Slot Reschedule',
    userMsg: 'I booked a dental checkup for 4 PM today, can I move it to tomorrow morning?',
    agentMsg:
      'No problem. Tomorrow morning has openings at 10:30 AM and 11:15 AM with Dr. Baruah. Which slot works better for you?',
    capturedFields: [
      {label: 'Action', value: 'Reschedule Dental Checkup'},
      {label: 'Calendar Check', value: '10:30 AM / 11:15 AM open'},
      {label: 'Desk Alert', value: 'Freed today 4:00 PM slot'},
    ],
  },
] as const;

export function AiAgentsHeroVisual() {
  const [modeId, setModeId] = useState<'intake' | 'reschedule'>('intake');
  const active = AGENT_MODES.find((m) => m.id === modeId) ?? AGENT_MODES[0];

  return (
    <HeroVisualContainer label="Interactive AI Agent Conversation Simulator">
      <div className="px-5 py-4 border-b border-[#203C30] flex flex-wrap items-center justify-between gap-3 bg-[#07130F]/50">
        <span className="font-mono text-xs text-[#A6B4AC]">
          Agent Conversation Flow
        </span>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#07130F] border border-[#203C30]">
          {AGENT_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setModeId(m.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                modeId === m.id
                  ? 'bg-[#AEF830] text-[#07130F]'
                  : 'text-[#A6B4AC] hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-5">
        <div className="space-y-3.5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#07130F] border border-[#203C30] flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-[#A6B4AC]" aria-hidden="true" />
            </div>
            <div className="rounded-xl bg-[#07130F] border border-[#203C30] p-3.5 flex-1">
              <p className="font-mono text-[11px] text-[#53685E] mb-1">Incoming Enquiry</p>
              <p className="text-sm text-white leading-relaxed">{active.userMsg}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#AEF830]/15 border border-[#AEF830]/40 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-[#AEF830]" aria-hidden="true" />
            </div>
            <div className="rounded-xl bg-[#16221E] border border-[#AEF830]/35 p-3.5 flex-1">
              <p className="font-mono text-[11px] text-[#AEF830] mb-1">
                Trained Business Agent
              </p>
              <p className="text-sm text-[#D8E6DE] leading-relaxed">{active.agentMsg}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-[#07130F] border border-[#203C30] p-4">
          <p className="font-mono text-[11px] text-[#A6B4AC] mb-3">
            Structured record created for your staff
          </p>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {active.capturedFields.map((field) => (
              <div key={field.label} className="border-t border-[#203C30] pt-2">
                <dt className="font-mono text-[11px] text-[#53685E]">{field.label}</dt>
                <dd className="text-xs text-white mt-1 font-medium">{field.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </HeroVisualContainer>
  );
}
