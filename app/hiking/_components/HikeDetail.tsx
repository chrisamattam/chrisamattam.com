import Image from "next/image";
import { useMDXComponent } from "next-contentlayer2/hooks";
import type { Hike } from "@/lib/hikes";

function MDXBody({ code }: { code: string }) {
  const Component = useMDXComponent(code);
  return (
    <div className="prose" style={{ marginTop: "1.5rem" }}>
      <Component />
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

const RANGE_TINT: Record<string, string> = {
  Himalaya: "linear-gradient(135deg, #3B82F6 0%, #1E3A5F 100%)",
  Sahyadri: "linear-gradient(135deg, #4E8A5E 0%, #2C4A34 100%)",
};

export default function HikeDetail({ hike }: { hike: Hike }) {
  const visitLabel = hike.visitsLabel ?? String(hike.visits);
  const stats: { label: string; value: string }[] = [];
  if (hike.distance) stats.push({ label: "Distance", value: hike.distance });
  if (hike.elevationGain) stats.push({ label: "Elevation gain", value: hike.elevationGain });
  if (hike.difficulty) stats.push({ label: "Difficulty", value: hike.difficulty });
  if (hike.year) stats.push({ label: "Year", value: String(hike.year) });
  if (hike.visits > 1) stats.push({ label: "Visits", value: `${visitLabel}×` });

  const photos = hike.photos ?? [];

  return (
    <article>
      {/* Header */}
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", color: "var(--text-muted)", margin: "0 0 0.5rem" }}>
        {hike.range} · {hike.subRegion}
      </p>
      <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.08, color: "var(--text-primary)", margin: "0 0 1.25rem" }}>
        {hike.name}
      </h1>

      {/* Stats */}
      {stats.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginBottom: "1.75rem" }}>
          {stats.map((s) => (
            <StatChip key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      )}

      {/* Hero */}
      {hike.heroImage ? (
        <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", borderRadius: "var(--radius-lg, 16px)", overflow: "hidden", marginBottom: "1.5rem" }}>
          <Image src={hike.heroImage} alt={hike.name} fill style={{ objectFit: "cover" }} sizes="(max-width: 800px) 100vw, 800px" />
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            aspectRatio: "16 / 6",
            borderRadius: "var(--radius-lg, 16px)",
            background: RANGE_TINT[hike.range] ?? "var(--surface-subtle)",
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

      {/* Photo grid */}
      {photos.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.75rem", marginBottom: "0.5rem" }}>
          {photos.map((src, i) => (
            <div key={src} style={{ position: "relative", aspectRatio: "1 / 1", borderRadius: "var(--radius-md, 12px)", overflow: "hidden" }}>
              <Image src={src} alt={`${hike.name} photo ${i + 1}`} fill style={{ objectFit: "cover" }} sizes="200px" />
            </div>
          ))}
        </div>
      )}

      {/* Written account */}
      <MDXBody code={hike.body.code} />
    </article>
  );
}
