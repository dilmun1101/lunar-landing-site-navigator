interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  label: string;
  options: Option<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
}

export default function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex rounded-lg border border-white/10 bg-white/5 p-0.5 text-xs"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className="rounded-md px-2.5 py-1 font-medium text-slate-400 transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-earth aria-pressed:bg-white/15 aria-pressed:text-accent"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
