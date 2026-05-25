import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type PillVariant = 'default' | 'mono' | 'accent';

export type PillProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: PillVariant;
  dot?: boolean;
};

export function Pill({ variant = 'default', dot, className, ...rest }: PillProps) {
  return (
    <span
      className={cn(
        'pill',
        variant === 'mono' && 'pill-mono',
        variant === 'accent' && 'pill-accent',
        dot && 'pill-dot',
        className,
      )}
      {...rest}
    />
  );
}
