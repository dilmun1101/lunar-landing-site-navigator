import classNames from 'classnames';
import type { ComponentProps } from 'react';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary';
}

export default function Button({
  variant = 'secondary',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classNames(
        'rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        {
          'bg-accent text-space-900 hover:brightness-110':
            variant === 'primary',
          'border border-white/10 bg-white/5 text-slate-300 hover:text-accent':
            variant === 'secondary',
        },
        className
      )}
      {...props}
    />
  );
}
