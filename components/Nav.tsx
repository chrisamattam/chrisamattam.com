"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type NavChild = { href: string; label: string };
type NavItem = { href: string; label: string; children?: NavChild[] };

const navLinks: NavItem[] = [
  { href: "/",        label: "Home"    },
  { href: "/work",    label: "Work"    },
  { href: "/writing", label: "Writing" },
  {
    href: "/reading",
    label: "Hobbies",
    children: [
      { href: "/reading", label: "Reading" },
      { href: "/hiking",  label: "Hiking"  },
      { href: "/running", label: "Running" },
    ],
  },
];

function SunIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

function LogoMark() {
  return (
    <div
      style={{
        width: 30,
        height: 30,
        background: "var(--surface-inverse)",
        borderRadius: 7,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        {/* Geometric M monogram */}
        <path
          d="M5.5 17.5 L5.5 7 L12 13.5 L18.5 7 L18.5 17.5"
          stroke="var(--surface-page)"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Accent dot — a nod to Aarron's dotted mark */}
        <circle cx="18.5" cy="17.6" r="1.5" fill="var(--accent)" />
      </svg>
    </div>
  );
}

function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginTop: 1 }}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function BurgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6l-12 12" />
        </>
      ) : (
        <>
          <path d="M3.5 7h17" />
          <path d="M3.5 12h17" />
          <path d="M3.5 17h17" />
        </>
      )}
    </svg>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hobbiesOpen, setHobbiesOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  // Close menus whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
    setHobbiesOpen(false);
  }, [pathname]);

  const isItemActive = (item: NavItem) => {
    if (item.children) return item.children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  const isDark = theme === "dark";

  // Compact icon-only toggle for the mobile bar (kept outside the hamburger
  // so the theme is one tap away).
  const ThemeToggleCompact = mounted ? (
    <button
      className="nav-icon-btn"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  ) : null;

  const ThemeToggle = mounted ? (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        height: 32,
        color: "var(--text-secondary)",
        background: "transparent",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-sm)",
        padding: "0 0.6rem",
        cursor: "pointer",
        transition: "var(--transition-control)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-strong)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-default)";
      }}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.06em" }}>
        {isDark ? "Light" : "Dark"}
      </span>
    </button>
  ) : null;

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        background: "color-mix(in srgb, var(--surface-page) 82%, transparent)",
        borderBottom: "1px solid var(--border-subtle)",
        height: 58,
      }}
    >
      <div
        className="container-page"
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
          <LogoMark />
          <span
            className="nav-shorten-name"
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: "var(--text-primary)",
              fontFamily: "var(--font-sans)",
              whiteSpace: "nowrap",
            }}
          >
            Chris Mattam
          </span>
        </Link>

        {/* Desktop links + toggle */}
        <div className="nav-desktop">
          {navLinks.map((link) => {
            const isActive = isItemActive(link);

            // Dropdown item (Hobbies)
            if (link.children) {
              return (
                <div
                  key={link.label}
                  style={{ position: "relative" }}
                  onMouseEnter={() => setHobbiesOpen(true)}
                  onMouseLeave={() => setHobbiesOpen(false)}
                >
                  <button
                    aria-haspopup="true"
                    aria-expanded={hobbiesOpen}
                    onClick={() => setHobbiesOpen((v) => !v)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      fontSize: 14,
                      fontFamily: "inherit",
                      color: isActive || hobbiesOpen ? "var(--text-primary)" : "var(--text-secondary)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "0.375rem 0.75rem",
                      borderRadius: "var(--radius-sm)",
                      transition: "color 160ms ease",
                      fontWeight: isActive ? 500 : 400,
                    }}
                  >
                    {link.label}
                    <span style={{ transform: hobbiesOpen ? "rotate(180deg)" : "none", transition: "transform 180ms ease", display: "inline-flex" }}>
                      <ChevronDown />
                    </span>
                  </button>

                  {hobbiesOpen && (
                    <div
                      role="menu"
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        marginTop: 6,
                        minWidth: 168,
                        padding: "0.375rem",
                        display: "flex",
                        flexDirection: "column",
                        background: "color-mix(in srgb, var(--surface-page) 97%, transparent)",
                        backdropFilter: "saturate(180%) blur(20px)",
                        WebkitBackdropFilter: "saturate(180%) blur(20px)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md, 12px)",
                        boxShadow: "0 14px 32px -18px rgba(0,0,0,0.4)",
                        zIndex: 50,
                      }}
                    >
                      {link.children.map((child) => {
                        const childActive = pathname === child.href || pathname.startsWith(child.href + "/");
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            role="menuitem"
                            style={{
                              fontSize: 14,
                              color: childActive ? "var(--text-primary)" : "var(--text-secondary)",
                              textDecoration: "none",
                              padding: "0.5rem 0.65rem",
                              borderRadius: "var(--radius-sm)",
                              fontWeight: childActive ? 500 : 400,
                              transition: "background 140ms ease, color 140ms ease",
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface-subtle)";
                              (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                              if (!childActive) (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)";
                            }}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Simple link
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: 14,
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  textDecoration: "none",
                  padding: "0.375rem 0.75rem",
                  borderRadius: "var(--radius-sm)",
                  transition: "color 160ms ease",
                  fontWeight: isActive ? 500 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)";
                }}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Divider */}
          <div
            style={{
              width: 1,
              height: 18,
              background: "var(--border-default)",
              margin: "0 0.5rem",
              flexShrink: 0,
            }}
          />

          {ThemeToggle}
        </div>

        {/* Mobile: visible theme toggle + hamburger */}
        <div className="nav-mobile-actions">
          {ThemeToggleCompact}
          <button
            className="nav-burger"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <BurgerIcon open={menuOpen} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown panel */}
      <div className={`nav-panel${menuOpen ? " open" : ""}`}>
        {navLinks.map((link) => {
          if (link.children) {
            return (
              <div key={link.label}>
                <div
                  className="nav-panel-link"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                  }}
                >
                  {link.label}
                </div>
                {link.children.map((child) => {
                  const childActive = pathname === child.href || pathname.startsWith(child.href + "/");
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="nav-panel-link"
                      style={{
                        paddingLeft: "calc(var(--gutter) + 1rem)",
                        color: childActive ? "var(--text-primary)" : "var(--text-secondary)",
                        fontWeight: childActive ? 500 : 400,
                      }}
                    >
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            );
          }

          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className="nav-panel-link"
              style={{
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                fontWeight: isActive ? 500 : 400,
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
