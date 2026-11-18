import { useId } from "react";

export function PanelFrame({
  label,
  meta,
  id,
  children,
  footer,
  tone = "default",
}: {
  label: string;
  meta?: string;
  id?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  tone?: "default" | "accent" | "ai";
}) {
  const headingId = useId();
  const accent =
    tone === "ai" ? "text-purple" : tone === "accent" ? "text-cyan" : "text-green";

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      tabIndex={-1}
      className="panel my-3 scroll-mt-4 outline-none focus-visible:ring-2 focus-visible:ring-green/60"
    >
      <div className="panel-head">
        <span aria-hidden className={`${accent} select-none`}>
          ┌─
        </span>
        <h2
          id={headingId}
          className="text-[11.5px] font-medium uppercase tracking-[0.18em] text-ink/90"
        >
          {label}
        </h2>
        <span
          aria-hidden
          className="mx-1 hidden h-px flex-1 border-t border-dashed border-line sm:block"
        />
        {meta ? (
          <span className="ml-auto text-[11px] tracking-wide text-faint sm:ml-0">
            {meta}
          </span>
        ) : null}
        <span aria-hidden className={`${accent} select-none`}>
          ─┐
        </span>
      </div>
      <div className="px-3 py-3 sm:px-4 sm:py-4">{children}</div>
      {footer ? (
        <div className="border-t border-line px-3 py-2 text-[11.5px] text-faint sm:px-4">
          {footer}
        </div>
      ) : null}
    </section>
  );
}
