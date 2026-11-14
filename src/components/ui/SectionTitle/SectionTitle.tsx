import classNames from 'classnames';
import type { ComponentProps } from 'react';

export default function SectionTitle({
  className,
  ...props
}: ComponentProps<'h2'>) {
  return (
    <h2
      className={classNames(
        'text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase',
        className
      )}
      {...props}
    />
  );
}
