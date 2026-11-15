import classNames from 'classnames';
import type { ReactNode } from 'react';
import SectionTitle from '@/components/ui/SectionTitle/SectionTitle';
import Hint from '@/components/ui/Tooltip/Tooltip';

interface TitleWithHintProps {
  /** Beginner-mode explanation of how to read the block */
  hint: string;
  children: ReactNode;
  className?: string;
}

/** A section title with a "?" next to it; the "?" exists in beginner mode only. */
export default function TitleWithHint({
  hint,
  children,
  className,
}: TitleWithHintProps) {
  return (
    <div className={classNames('flex items-center gap-2', className)}>
      <SectionTitle>{children}</SectionTitle>
      <Hint text={hint} wide />
    </div>
  );
}
