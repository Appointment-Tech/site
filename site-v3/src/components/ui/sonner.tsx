import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Toaster com as cores do design system da v3 (ver ADR 0004): sem tema escuro,
 * porque o site é claro por definição — o fundo quente é a marca.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-[var(--shadow-lift)] group-[.toaster]:rounded-[var(--radius-lg)]",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
