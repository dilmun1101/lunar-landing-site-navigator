import classNames from 'classnames';

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className={classNames('shrink-0', className)}
    >
      <circle cx="13" cy="15" r="10" fill="#CBD5E1" />
      <circle cx="9.5" cy="12" r="2.2" fill="#94A3B8" />
      <circle cx="15.5" cy="19" r="1.6" fill="#94A3B8" />
      <circle cx="16" cy="11.5" r="1.1" fill="#94A3B8" />
      <circle cx="22.5" cy="5.5" r="3.5" fill="#4DA3FF" />
    </svg>
  );
}
