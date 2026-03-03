interface ChipToggleGroupProps<T extends string> {
  options: ReadonlyArray<{ value: T; label: string }>;
  selected: T[];
  onToggle: (value: T) => void;
}

export function ChipToggleGroup<T extends string>({
  options,
  selected,
  onToggle,
}: ChipToggleGroupProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onToggle(opt.value)}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            selected.includes(opt.value)
              ? "border-accent-500 bg-accent-50 text-accent-700"
              : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
