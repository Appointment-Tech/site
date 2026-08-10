// Nota: o Lovable referenciava o logo via um asset gerenciado por ele
// (`@/assets/a-logo-final.png.asset.json`, servido em /__l5e/assets-v1/...).
// Fora do sandbox do Lovable esse path não existe, então servimos o PNG
// diretamente de /public.
export function Logo({
  className = "",
  showWordmark = true,
  inverted = false,
}: {
  className?: string;
  showWordmark?: boolean;
  inverted?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src="/a-logo-final.png"
        alt="Appointment"
        className="h-9 w-9 rounded-[10px] object-contain"
        width={36}
        height={36}
      />
      {showWordmark && (
        <span
          className={`font-display text-lg font-bold tracking-tight ${
            inverted ? "text-ink-foreground" : "text-foreground"
          }`}
        >
          Appointment
        </span>
      )}
    </span>
  );
}
