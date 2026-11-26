import React from 'react';
import {PrimaryButton, SecondaryButton} from '../components/ui/Buttons';

export function NotFoundPage() {
  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="max-w-xl bg-[#101C18] border border-[#203C30] rounded-2xl p-8 sm:p-10">
          <p className="font-mono text-xs text-[#AEF830] mb-3">404 · Page not found</p>
          <h1 className="text-3xl font-bold text-white tracking-[-0.03em]">
            This page could not be found.
          </h1>
          <p className="mt-4 text-base text-[#A6B4AC] leading-relaxed">
            The route you opened does not exist on Axom Hub. Return to the homepage or explore our
            services below.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <PrimaryButton to="/">Back to Home</PrimaryButton>
            <SecondaryButton to="/services">View Services</SecondaryButton>
          </div>
        </div>
      </div>
    </section>
  );
}
