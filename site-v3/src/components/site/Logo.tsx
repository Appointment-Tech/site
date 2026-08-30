export function Logo({ invert = false }: { invert?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className="brand-gradient flex h-8 w-8 items-center justify-center rounded-[10px] text-[0.95rem] font-bold text-primary-foreground"
      >
        A
      </span>
      <span
        className={`font-display text-lg font-semibold tracking-tight ${
          invert ? "text-primary-foreground" : "text-foreground"
        }`}
      >
        Appointment
      </span>
    </span>
  );
}
