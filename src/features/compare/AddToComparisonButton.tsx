import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';

interface AddToComparisonButtonProps {
  className?: string;
}

export default function AddToComparisonButton({
  className,
}: AddToComparisonButtonProps) {
  const { t } = useTranslation();

  // TODO: добавлять текущий сценарий в список сравнения (state/useCompareList.ts)
  return (
    <Button variant="primary" className={className}>
      {t('common.addToComparison')}
    </Button>
  );
}
