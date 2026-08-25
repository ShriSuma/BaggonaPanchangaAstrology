import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

/** Hybrid shell: warm cream surface on soft page gradient */
export default function Card({ children, className = "", onClick }: Props): JSX.Element {
  return (
    <section
      onClick={onClick}
      className={`rounded-2xl border border-[color:var(--jk-card-border)] bg-[color:var(--jk-card-bg)] p-5 text-[color:var(--jk-card-fg)] shadow-[var(--jk-card-shadow)] sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}
