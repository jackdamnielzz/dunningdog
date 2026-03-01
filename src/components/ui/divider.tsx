interface DividerProps {
  label?: string;
}

export function Divider({ label = "Or continue with" }: DividerProps) {
  return (
    <div className="relative py-2">
      <div className="h-px w-full bg-zinc-200" />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-zinc-500">
        {label}
      </span>
    </div>
  );
}
