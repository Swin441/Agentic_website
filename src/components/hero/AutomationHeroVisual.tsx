import React, {useState} from 'react';
import {CheckCircle2, Play} from 'lucide-react';
import {HeroVisualContainer} from './HeroVisualContainer';

const PIPELINES = [
  {
    id: 'lead',
    label: 'New Website Lead',
    steps: [
      {stage: '01. Trigger', title: 'Customer submits enquiry form', detail: 'Captures name, phone, and service requirement'},
      {stage: '02. Reply', title: 'WhatsApp welcome message sent', detail: 'Shares brochure and asks preferred callback time'},
      {stage: '03. Sync', title: 'Row added to Google Sheet / CRM', detail: 'Zero manual copy-paste by office staff'},
      {stage: '04. Alert', title: 'Assigned staff notified', detail: 'Follow-up reminder queued if not contacted'},
    ],
  },
  {
    id: 'fee',
    label: 'Fee / Invoice Due',
    steps: [
      {stage: '01. Trigger', title: 'Installment due date approaches', detail: 'Checked automatically from your billing sheet'},
      {stage: '02. Notify', title: 'Polite payment reminder sent', detail: 'Includes invoice summary and payment instructions'},
      {stage: '03. Record', title: 'Receipt logged on confirmation', detail: 'Accounts sheet updated cleanly'},
      {stage: '04. Digest', title: 'Daily summary to owner', detail: 'Lists pending vs. cleared dues without manual checking'},
    ],
  },
] as const;

export function AutomationHeroVisual() {
  const [pipelineId, setPipelineId] = useState<'lead' | 'fee'>('lead');
  const [activeStep, setActiveStep] = useState(0);

  const pipeline = PIPELINES.find((p) => p.id === pipelineId) ?? PIPELINES[0];

  const handleStepAdvance = () => {
    setActiveStep((prev) => (prev + 1) % pipeline.steps.length);
  };

  return (
    <HeroVisualContainer label="Interactive Business Automation Workflow">
      <div className="px-5 py-4 border-b border-[#203C30] flex flex-wrap items-center justify-between gap-3 bg-[#07130F]/50">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#07130F] border border-[#203C30]">
          {PIPELINES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setPipelineId(p.id);
                setActiveStep(0);
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                pipelineId === p.id
                  ? 'bg-[#AEF830] text-[#07130F]'
                  : 'text-[#A6B4AC] hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleStepAdvance}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#203C30] bg-[#07130F] text-xs font-mono text-[#AEF830] hover:border-[#AEF830] transition-colors cursor-pointer whitespace-nowrap"
        >
          <Play className="w-3 h-3" aria-hidden="true" />
          <span>Step workflow</span>
        </button>
      </div>

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-center space-y-3">
        {pipeline.steps.map((step, index) => {
          const isCurrent = index === activeStep;
          const isCompleted = index < activeStep;
          return (
            <button
              key={step.stage}
              type="button"
              onClick={() => setActiveStep(index)}
              className={`w-full text-left rounded-xl p-4 border transition-colors flex items-start gap-3.5 cursor-pointer ${
                isCurrent
                  ? 'bg-[#16221E] border-[#AEF830]'
                  : 'bg-[#07130F] border-[#203C30] hover:border-[#A6B4AC]/50'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                <CheckCircle2
                  className={`w-4 h-4 ${
                    isCurrent || isCompleted ? 'text-[#AEF830]' : 'text-[#53685E]'
                  }`}
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-[#AEF830]">{step.stage}</span>
                  {isCurrent && (
                    <span className="font-mono text-[11px] text-[#A6B4AC]">Active step</span>
                  )}
                </div>
                <p className="text-sm font-medium text-white mt-0.5">{step.title}</p>
                <p className="text-xs text-[#A6B4AC] mt-1">{step.detail}</p>
              </div>
            </button>
          );
        })}
      </div>
    </HeroVisualContainer>
  );
}
