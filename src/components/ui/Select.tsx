import classNames from 'classnames';
import type { ComponentProps } from 'react';

export default function Select({
  className,
  ...props
}: ComponentProps<'select'>) {
  return (
    <select
      className={classNames(
        'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-accent focus:outline-none scheme-dark [&_option]:bg-space-900',
        className
      )}
      {...props}
    />
  );
}
