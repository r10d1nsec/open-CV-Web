import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
  as?: 'div' | 'article' | 'section' | 'a';
  href?: string;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { hover, className, as = 'div', ...rest },
  ref,
) {
  const Tag = as as 'div';
  return (
    <Tag
      ref={ref as never}
      className={cn('card', hover && 'card-hover', className)}
      {...(rest as HTMLAttributes<HTMLDivElement>)}
    />
  );
});
