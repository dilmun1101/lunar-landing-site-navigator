import classNames from 'classnames';
import type { ComponentProps } from 'react';

export default function Panel({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={classNames(
        'rounded-xl border border-white/10 bg-white/[0.03] p-4',
        className
      )}
      {...props}
    />
  );
}
