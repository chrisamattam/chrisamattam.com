import Image from "next/image";
import { useMDXComponent } from "next-contentlayer2/hooks";
import { REGION_LABEL, type Hike, type Region } from "@/lib/hikes";

// Inline, captioned photo for use *within* the MDX narrative — this is how a
// photo gets "anchored" to a section: you place it where it belongs in the story.
function Figure({ src, caption, alt }: { src: string; caption?: string; alt?: string }) {
  return (
    <figure style={{ margin: "1.75rem 0" }}>
      <div style={{ position: "relative", width: "100%", aspectRatio: "3 / 2", borderRadius: "var(--radius-lg, 16px)", overflow: "hidden" }}>
        <Image src={src} alt={alt ?? caption ?? ""} fill style={{ objectFit: "cover" }} sizes="(max-width: 800px) 100vw, 800px" />
      </div>
      {caption && (
        <figcaption style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", marginTop: "0.5rem" }}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

const mdxComponents = { Figure };

function MDXBody({ code }: { code: string }) {
  const Component = useMDXComponent(code);
  return (
    <div className="prose" style={{ marginTop: "1.5rem" }}>
      <Component components={mdxComponents} />
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: "0.5rem 0.85rem",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-control, 10px)",
        background: "var(--surface-subtle)",
      }}
    >
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)" }}>
        {label}
      </span>
      <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{value}</span>
    </div>
  );
}

const REGION_TINT: Record<Region, string> = {
  himalaya: "linear-gradient(135deg, #3B82F6 0%, #1E3A5F 100%)",
  sahyadri: "linear-gradient(135deg, #4E8A5E 0%, #2C4A34 100%)",
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function HikeDetail({
  hike,
  heroImage,
  photos: photosProp,
}: {
  hike: Hike;
  heroImage?: string | null;
  photos?: string[];
}) {
  const region = hike.region as Region;

  // Dates: range if multi-day, else single.
  const dateLabel = hike.endDate ? `${hike.startDate} – ${hike.endDate}` : hike.startDate;
  // Duration: prefer days for multi-day treks, else hours.
  const durationLabel = hike.durationDays
    ? `${hike.durationDays} day${hike.durationDays === 1 ? "" : "s"}`
    : hike.durationHours
      ? `${hike.durationHours}h`
      : null;

  const visitLabel = hike.visitsLabel ?? String(hike.visits);
  const stats: { label: string; value: string }[] = [];
  if (hike.difficulty) stats.push({ label: "Difficulty", value: cap(hike.difficulty) });
  if (hike.distanceKm) stats.push({ label: "Distance", value: `${hike.distanceKm} km` });
  if (hike.elevationGainMeters) stats.push({ label: "Elevation gain", value: `${hike.elevationGainMeters} m` });
  if (durationLabel) stats.push({ label: "Duration", value: durationLabel });
  if (dateLabel) stats.push({ label: "When", value: dateLabel });
  if (hike.companions) stats.push({ label: "Company", value: hike.companions });
  if (hike.visits > 1) stats.push({ label: "Visits", value: `${visitLabel}×` });

  // Prefer folder-derived images; fall back to frontmatter.
  const hero = heroImage ?? hike.heroImage;
  const photos = photosProp && photosProp.length ? photosProp : [];

  const notes = hike.practicalNotes;
  const noteRows = notes
    ? ([
        ["Best season", notes.bestSeason],
        ["Gear notes", notes.gearNotes],
        ["Warnings", notes.warnings],
        ["What I'd do differently", notes.whatIdDoDifferently],
      ] as const).filter(([, v]) => Boolean(v))
    : [];

  return (
    <article>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", margin: "0 0 0.5rem" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", color: "var(--text-muted)" }}>
          {REGION_LABEL[region]} · {hike.location.area}, {hike.location.state}
        </span>
        {hike.draft && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "#B45309", background: "color-mix(in srgb, #D97706 16%, transparent)", padding: "1px 7px", borderRadius: 999 }}>
            Draft
          </span>
        )}
      </div>
      <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.08, color: "var(--text-primary)", margin: "0 0 0.75rem" }}>
        {hike.name}
      </h1>
      <p style={{ fontSize: 17, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 1.5rem", maxWidth: 620 }}>
        {hike.hook}
      </p>

      {/* Stats */}
      {stats.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginBottom: "1.75rem" }}>
          {stats.map((s) => (
            <StatChip key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      )}

      {/* Hero */}
      {hero ? (
        <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", borderRadius: "var(--radius-lg, 16px)", overflow: "hidden", marginBottom: "1.5rem" }}>
          <Image src={hero} alt={hike.name} fill style={{ objectFit: "cover" }} sizes="(max-width: 800px) 100vw, 800px" priority />
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            aspectRatio: "16 / 6",
            borderRadius: "var(--radius-lg, 16px)",
            background: REGION_TINT[region] ?? "var(--surface-subtle)",
            display: "flex",
            alignItems: "flex-end",
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
          }}
        >
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(255,255,255,0.85)" }}>
            Photos coming soon
          </span>
        </div>
      )}

      {/* Written account */}
      <MDXBody code={hike.body.code} />

      {/* Practical notes */}
      {noteRows.length > 0 && (
        <section style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-subtle)" }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 1rem" }}>Practical notes</h2>
          <dl style={{ margin: 0, display: "grid", gap: "0.85rem" }}>
            {noteRows.map(([label, value]) => (
              <div key={label}>
                <dt style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 3 }}>
                  {label}
                </dt>
                <dd style={{ margin: 0, fontSize: 14.5, color: "var(--text-secondary)", lineHeight: 1.6 }}>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Gallery — folder photos not placed inline */}
      {photos.length > 0 && (
        <section style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-subtle)" }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 1rem" }}>Gallery</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.75rem" }}>
            {photos.map((src, i) => (
              <div key={src} style={{ position: "relative", aspectRatio: "1 / 1", borderRadius: "var(--radius-md, 12px)", overflow: "hidden" }}>
                <Image src={src} alt={`${hike.name} photo ${i + 1}`} fill style={{ objectFit: "cover" }} sizes="200px" />
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
