"use client";

import Link from "next/link";
import Badge from "./Badge";
import type { Project } from "contentlayer/generated";

function GitHubGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6 0-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8 0 3.2.9.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.9 1 .9 2.2v3.3c0 .3.1.7.8.6A12 12 0 0 0 12 .3z" />
    </svg>
  );
}

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        color: "var(--text-tertiary)",
        textDecoration: "none",
        transition: "color 160ms ease",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-tertiary)")}
    >
      {label} ↗
    </a>
  );
}

export function ProjectRowCompact({ project }: { project: Project }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "2rem",
        padding: "1.25rem 0",
        borderTop: "1px solid var(--border-subtle)",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.35rem" }}>
          <Link
            href={`/work/${project.slug}`}
            style={{ fontSize: 15, fontWeight: 500, color: "var(--text-primary)", textDecoration: "none" }}
          >
            {project.title}
          </Link>
          <Badge label={project.status} tone={project.badgeTone as "accent" | "neutral" | "warning" | "danger" | "amber" | "green"} />
        </div>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
          {project.summary}
        </p>
      </div>
      <div style={{ display: "flex", gap: "1rem", flexShrink: 0, paddingTop: "0.2rem" }}>
        {project.liveUrl   && <ExternalLink href={project.liveUrl}   label="Live"   />}
        {project.githubUrl && <ExternalLink href={project.githubUrl} label="GitHub" />}
        {project.prdUrl    && <ExternalLink href={project.prdUrl}    label="PRD"    />}
      </div>
    </div>
  );
}

export function ProjectRowFull({ project }: { project: Project }) {
  return (
    <div
      style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: "1.75rem 0",
      }}
    >
      {/* Eyebrow */}
      {(project.company || project.period) && (
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--text-muted)",
            letterSpacing: "0.08em",
            margin: "0 0 0.6rem",
          }}
        >
          {[project.company, project.period].filter(Boolean).join(" · ")}
        </p>
      )}

      {/* Title row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
            <h2 style={{ fontSize: 18, fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>
              {project.title}
            </h2>
            <Badge label={project.status} tone={project.badgeTone as "accent" | "neutral" | "warning" | "danger" | "amber" | "green"} />
            {project.role && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
                {project.role}
              </span>
            )}
          </div>

          <p style={{ fontSize: 15, color: "var(--text-secondary)", margin: "0 0 0.75rem", lineHeight: 1.65, maxWidth: 600 }}>
            {project.summary}
          </p>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--text-muted)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-chip)",
                    padding: "0.15rem 0.5rem",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Action row */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
        {Array.isArray(project.links) &&
          (project.links as { label: string; url: string }[]).map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                background: "var(--accent-subtle)",
                color: "var(--accent)",
                fontSize: 13,
                fontWeight: 500,
                padding: "0.5rem 1rem",
                borderRadius: "var(--radius-control)",
                textDecoration: "none",
              }}
            >
              {l.label} ↗
            </a>
          ))}

        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              background: "var(--accent)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 500,
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius-control)",
              textDecoration: "none",
            }}
          >
            Live ↗
          </a>
        )}

        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.title} on GitHub`}
            title="GitHub"
            className="icon-link"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 34,
              height: 34,
              color: "var(--text-primary)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-control)",
            }}
          >
            <GitHubGlyph />
          </a>
        )}

        {project.prdUrl && (
          <a
            href={project.prdUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover-link"
            style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
          >
            PRD ↗
          </a>
        )}

        <Link
          href={`/work/${project.slug}`}
          className="hover-link-secondary"
          style={{ fontSize: 13, fontWeight: 500 }}
        >
          Read more →
        </Link>
      </div>
    </div>
  );
}
