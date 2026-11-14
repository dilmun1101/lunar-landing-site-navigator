import classNames from 'classnames';
import type { ComponentProps } from 'react';

export default function TextInput({
  className,
  ...props
}: ComponentProps<'input'>) {
  return (
    <input
      className={classNames(
        'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none aria-invalid:border-red-400/70 scheme-dark',
        className
      )}
      {...props}
    />
  );
}
