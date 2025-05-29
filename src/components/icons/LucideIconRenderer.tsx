// src/components/icons/LucideIconRenderer.tsx
"use client";

import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import React from 'react';
import { DEFAULT_REMINDER_ICON } from '@/lib/db';

interface LucideIconRendererProps extends LucideProps {
  name?: string | null; // Allow null for icon name
}

const FallbackIcon = (LucideIcons as any)[DEFAULT_REMINDER_ICON] || LucideIcons.HelpCircle;


export function LucideIconRenderer({ name, className, ...props }: LucideIconRendererProps) {
  if (!name || typeof name !== 'string' || !(name in LucideIcons)) {
    return <FallbackIcon className={className} {...props} />;
  }

  // Type assertion because 'name' is dynamic.
  // Ensure that LucideIcons only contains React components.
  const IconComponent = (LucideIcons as Record<string, React.ElementType>)[name];

  if (!IconComponent) {
     return <FallbackIcon className={className} {...props} />;
  }
  
  try {
    return <IconComponent className={className} {...props} />;
  } catch (error) {
    console.error(`Error rendering Lucide icon "${name}":`, error);
    return <FallbackIcon className={className} {...props} />;
  }
}
