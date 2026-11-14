import classNames from 'classnames';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button/Button';
import TextInput from '@/components/ui/TextInput/TextInput';

/** Принимает и точку, и запятую; возвращает null, если пусто или вне диапазона. */
function parseCoordinate(value: string, limit: number): number | null {
  const normalized = value.trim().replace(',', '.');
  if (normalized === '') return null;
  const number = Number(normalized);
  return Number.isFinite(number) && Math.abs(number) <= limit ? number : null;
}

interface CustomCoordinatesProps {
  className?: string;
}

export default function CustomCoordinates({
  className,
}: CustomCoordinatesProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');

  const latValid = parseCoordinate(lat, 90) !== null;
  const lonValid = parseCoordinate(lon, 180) !== null;
  const latInvalid = lat.trim() !== '' && !latValid;
  const lonInvalid = lon.trim() !== '' && !lonValid;

  return (
    <div className={classNames('flex flex-col gap-3', className)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 text-left text-sm text-accent"
      >
        <span aria-hidden="true">{open ? '−' : '+'}</span>
        {t('sites.custom.title')}
      </button>

      {open && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              {t('sites.custom.lat')}
              <TextInput
                inputMode="decimal"
                value={lat}
                onChange={(event) => setLat(event.target.value)}
                aria-invalid={latInvalid}
                placeholder="-89.9"
                className="font-mono normal-case"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              {t('sites.custom.lon')}
              <TextInput
                inputMode="decimal"
                value={lon}
                onChange={(event) => setLon(event.target.value)}
                aria-invalid={lonInvalid}
                placeholder="0.0"
                className="font-mono normal-case"
              />
            </label>
          </div>

          {(latInvalid || lonInvalid) && (
            <p className="text-xs text-red-300">{t('sites.custom.invalid')}</p>
          )}

          {/* TODO: передать координаты в сценарий (state/useScenarioParams.ts) */}
          <Button disabled={!latValid || !lonValid}>
            {t('sites.custom.apply')}
          </Button>
        </div>
      )}
    </div>
  );
}
