import { hasAvailability, profile } from "@/data/profile";

/**
 * Published availability, rendered as a status badge. Nothing is shown when
 * availability is unpublished, so the title bar never implies a status.
 */
export function AvailabilityBadge({ compact = false }: { compact?: boolean }) {
  const label = profile.availability.label;
  if (!hasAvailability() || !label) return null;

  return (
    <span
      className="inline-flex min-h-8 items-center gap-1.5 rounded border border-green/30 bg-green/5 px-2 text-[11px] leading-none text-green"
      title={`Availability: ${label}`}
      aria-label={`Availability: ${label}`}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-green" />
      {compact ? (
        <>
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">open</span>
        </>
      ) : (
        <span>{label}</span>
      )}
    </span>
  );
}
