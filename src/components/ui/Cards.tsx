import React from 'react';
import {ArrowRight} from 'lucide-react';
import {Link} from '../../router/RouterContext';
import type {AppRoute} from '../../router/RouterContext';

interface ServiceCardProps {
  number: string;
  title: string;
  summary: string;
  outcome: string;
  route: AppRoute;
  deliverables?: string[];
  actionLabel?: string;
}

export function ServiceCard({
  number,
  title,
  summary,
  outcome,
  route,
  deliverables,
  actionLabel = 'Explore capability',
}: ServiceCardProps) {
  return (
    <article className="bg-[#101C18] border border-[#203C30] rounded-xl p-6 sm:p-7 flex flex-col justify-between axom-card-hover h-full">
      <div>
        <div className="flex items-center justify-between gap-4 mb-5">
          <span className="font-mono text-xs font-medium tracking-wider text-[#AEF830] tabular-nums">
            {number}
          </span>
          <span className="font-mono text-[11px] text-[#53685E]">Axom Hub Capability</span>
        </div>

        <h3 className="text-xl font-semibold text-white tracking-[-0.02em] mb-3">{title}</h3>
        <p className="text-sm sm:text-[15px] leading-relaxed text-[#A6B4AC] mb-5">{summary}</p>

        <div className="pt-4 border-t border-[#203C30] mb-5">
          <p className="font-mono text-[11px] text-[#53685E] mb-1.5">Practical outcome</p>
          <p className="text-sm text-white leading-relaxed">{outcome}</p>
        </div>

        {deliverables && deliverables.length > 0 && (
          <ul className="space-y-2 mb-6">
            {deliverables.map((item) => (
              <li key={item} className="text-xs sm:text-sm text-[#A6B4AC] flex items-start gap-2.5">
                <span className="text-[#AEF830] font-mono mt-0.5" aria-hidden="true">
                  —
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="pt-2">
        <Link
          to={route}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#AEF830] hover:text-[#B5FF38] transition-colors group whitespace-nowrap"
        >
          <span>{actionLabel}</span>
          <ArrowRight
            className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}

interface IndustryCardProps {
  number: string;
  name: string;
  audience: string;
  bottleneck: string;
  solution: string;
  workflows: string[];
  onInspect?: () => void;
}

export function IndustryCard({
  number,
  name,
  audience,
  bottleneck,
  solution,
  workflows,
}: IndustryCardProps) {
  return (
    <article className="bg-[#101C18] border border-[#203C30] rounded-xl p-6 sm:p-7 flex flex-col justify-between axom-card-hover h-full">
      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <span className="font-mono text-xs font-medium text-[#AEF830] tabular-nums">{number}</span>
          <span className="font-mono text-[11px] text-[#53685E]">Indian SMB Focus</span>
        </div>

        <h3 className="text-xl font-semibold text-white tracking-[-0.02em]">{name}</h3>
        <p className="text-xs text-[#A6B4AC] mt-1.5 mb-5">{audience}</p>

        <div className="space-y-4 border-t border-[#203C30] pt-4 mb-5">
          <div>
            <p className="font-mono text-[11px] text-[#53685E] mb-1">Common bottleneck</p>
            <p className="text-sm text-[#A6B4AC] leading-relaxed">{bottleneck}</p>
          </div>
          <div>
            <p className="font-mono text-[11px] text-[#AEF830] mb-1">How Axom Hub helps</p>
            <p className="text-sm text-white leading-relaxed">{solution}</p>
          </div>
        </div>

        <ul className="space-y-2 mb-6">
          {workflows.map((wf) => (
            <li key={wf} className="text-xs sm:text-sm text-[#A6B4AC] flex items-start gap-2.5">
              <span className="text-[#AEF830] font-mono mt-0.5" aria-hidden="true">
                —
              </span>
              <span>{wf}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-2">
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-[#AEF830] transition-colors group whitespace-nowrap"
        >
          <span>Discuss workflow for {name.split(' ')[0]}</span>
          <ArrowRight
            className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}

interface ProjectDemoCardProps {
  kind: 'Concept Demo' | 'Product Prototype';
  sector: string;
  title: string;
  summary: string;
  highlights: string[];
  relatedServiceRoute: AppRoute;
  onPreview?: () => void;
  isActivePreview?: boolean;
}

export function ProjectDemoCard({
  kind,
  sector,
  title,
  summary,
  highlights,
  relatedServiceRoute,
  onPreview,
  isActivePreview,
}: ProjectDemoCardProps) {
  return (
    <article
      className={`bg-[#101C18] border rounded-xl p-6 sm:p-7 flex flex-col justify-between axom-card-hover h-full ${
        isActivePreview ? 'border-[#AEF830]' : 'border-[#203C30]'
      }`}
    >
      <div>
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs mb-4">
          <span className="text-[#AEF830] font-medium">{kind}</span>
          <span className="text-[#53685E]" aria-hidden="true">
            ·
          </span>
          <span className="text-[#A6B4AC]">{sector}</span>
        </div>

        <h3 className="text-xl font-semibold text-white tracking-[-0.02em] mb-3">{title}</h3>
        <p className="text-sm sm:text-[15px] leading-relaxed text-[#A6B4AC] mb-5">{summary}</p>

        <ul className="space-y-2 border-t border-[#203C30] pt-4 mb-6">
          {highlights.map((item) => (
            <li key={item} className="text-xs sm:text-sm text-[#A6B4AC] flex items-start gap-2.5">
              <span className="text-[#AEF830] font-mono mt-0.5" aria-hidden="true">
                —
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        {onPreview ? (
          <button
            type="button"
            onClick={onPreview}
            className={`text-sm font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              isActivePreview ? 'text-[#AEF830]' : 'text-white hover:text-[#AEF830]'
            }`}
          >
            <span>{isActivePreview ? 'Viewing interactive preview' : 'Inspect interactive preview'}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        ) : (
          <Link
            to={relatedServiceRoute}
            className="text-sm font-medium text-[#AEF830] hover:text-[#B5FF38] inline-flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <span>View capability</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        )}

        <Link
          to="/contact"
          className="text-xs font-mono text-[#A6B4AC] hover:text-white transition-colors whitespace-nowrap"
        >
          Request similar build
        </Link>
      </div>
    </article>
  );
}
