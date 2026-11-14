import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button/Button';
import { useCompareList } from '@/state/useCompareList/useCompareList';
import {
  getSiteName,
  resolveCoordinates,
  useScenarioStore,
} from '@/state/useScenarioStore/useScenarioStore';

interface AddToComparisonButtonProps {
  className?: string;
}

export default function AddToComparisonButton({
  className,
}: AddToComparisonButtonProps) {
  const { t } = useTranslation();
  const add = useCompareList((state) => state.add);
  const siteName = useScenarioStore((state) => getSiteName(state));

  const handleClick = () => {
    const { epoch, duration, siteId, customSite } = useScenarioStore.getState();
    add({
      siteName,
      epoch: epoch.toISOString(),
      duration,
      coordinates: resolveCoordinates(siteId, customSite),
    });
  };

  return (
    <Button
      variant="primary"
      className={className}
      disabled={siteName === ''}
      onClick={handleClick}
    >
      {t('common.addToComparison')}
    </Button>
  );
}
