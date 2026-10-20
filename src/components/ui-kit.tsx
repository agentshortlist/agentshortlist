import Link from "next/link";
import { freshness, isOpenSource, type Agent } from "@/lib/data";

export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`eyebrow ${className}`}>{children}</p>;
}

const pill =
  "inline-flex h-11 items-center justify-center rounded-full px-[18px] text-sm font-medium whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function PillLink({
  href,
  variant = "primary",
  children,
  className = "",
}: {
  href: string;
  variant?: "primary" | "ghost" | "soft";
  children: React.ReactNode;
  className?: string;
}) {
  const v = {
    primary: "edge-btn edge-primary",
    soft: "edge-btn edge-soft",
    ghost: "text-foreground/80 hover:text-foreground",
  }[variant];
  return (
    <Link href={href} className={`${pill} ${v} ${className}`}>
      {children}
    </Link>
  );
}

// Etiquetas de estado al estilo de la leyenda BUILT / PLANNED / NOT VERIFIED:
// sólido = comprobado, contorno = parcial, discontinuo = sin dato.
const chip = "inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[0.6875rem] uppercase tracking-[0.12em] leading-5";

export function LicenseChip({ agent }: { agent: Agent }) {
  if (isOpenSource(agent)) {
    return <span className={`${chip} bg-ink/[0.09] text-foreground`}>{agent.license}</span>;
  }
  if (agent.license) {
    return <span className={`${chip} border border-ink/30 text-foreground/80`}>{agent.license}</span>;
  }
  return <span className={`${chip} border border-dashed border-ink/25 text-muted-foreground`}>Not stated</span>;
}

export function FreshChip({ agent }: { agent: Agent }) {
  return freshness(agent) === "fresh" ? (
    <span className={`${chip} bg-signal/20 text-foreground`}>Fresh · 30d</span>
  ) : (
    <span className={`${chip} border border-ink/30 text-foreground/80`}>Active · 90d</span>
  );
}
