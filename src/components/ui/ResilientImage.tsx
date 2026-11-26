import React, {useState} from 'react';
import {Layers} from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  fallbackTitle: string;
  fallbackSubtitle?: string;
  className?: string;
}

export function ResilientImage({
  src,
  alt,
  fallbackTitle,
  fallbackSubtitle,
  className = 'w-full h-full object-cover',
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className="w-full h-full bg-[#101C18] border border-[#203C30] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-11 h-11 rounded-lg bg-[#07130F] border border-[#203C30] flex items-center justify-center mb-3">
          <Layers className="w-5 h-5 text-[#AEF830]" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-white">{fallbackTitle}</p>
        {fallbackSubtitle && (
          <p className="text-xs text-[#A6B4AC] mt-1 max-w-xs">{fallbackSubtitle}</p>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
