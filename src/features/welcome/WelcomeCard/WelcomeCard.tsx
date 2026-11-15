import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button/Button';
import Panel from '@/components/ui/Panel/Panel';
import SectionTitle from '@/components/ui/SectionTitle/SectionTitle';
import { useModeStore } from '@/hooks/useMode/useMode';

const STEPS = ['site', 'date', 'verdict'] as const;

interface WelcomeCardProps {
  className?: string;
}

/** Shown once on the first visit: what the app does and how to start */
export default function WelcomeCard({ className }: WelcomeCardProps) {
  const { t } = useTranslation();
  const welcomed = useModeStore((state) => state.welcomed);
  const dismiss = useModeStore((state) => state.dismissWelcome);
  const setMode = useModeStore((state) => state.setMode);

  if (welcomed) return null;

  return (
    <Panel
      className={classNames('flex flex-col gap-4', className)}
      role="region"
      aria-label={t('welcome.title')}
    >
      <div className="flex flex-col gap-1">
        <SectionTitle>{t('welcome.title')}</SectionTitle>
        <p className="max-w-prose text-sm leading-relaxed text-slate-300">
          {t('welcome.intro')}
        </p>
      </div>

      <ol className="flex flex-col gap-2 text-sm text-slate-200">
        {STEPS.map((step, index) => (
          <li key={step} className="flex items-start gap-3">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent">
              {index + 1}
            </span>
            {t(`welcome.steps.${step}`)}
          </li>
        ))}
      </ol>

      <p className="text-xs text-slate-500">{t('welcome.modeNote')}</p>

      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={dismiss}>
          {t('welcome.gotIt')}
        </Button>
        <Button
          onClick={() => {
            setMode('expert');
            dismiss();
          }}
        >
          {t('welcome.expert')}
        </Button>
      </div>
    </Panel>
  );
}
