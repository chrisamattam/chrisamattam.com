import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Chris Mattam — Product manager and builder in fintech and AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F2ECDA",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: "#2B2926", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M5.5 17.5 L5.5 7 L12 13.5 L18.5 7 L18.5 17.5" stroke="#F2ECDA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="18.5" cy="17.6" r="1.7" fill="#0071E3" />
            </svg>
          </div>
          <div style={{ fontSize: 26, color: "#57544D", letterSpacing: "0.06em" }}>
            PRODUCT · BUILDER · FINTECH · AI
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 88,
              fontWeight: 600,
              color: "#2B2926",
              lineHeight: 1.05,
              letterSpacing: "-0.035em",
            }}
          >
            Hi, I&apos;m Chris.
          </div>
          <div
            style={{
              fontSize: 34,
              color: "#57544D",
              lineHeight: 1.3,
              maxWidth: 900,
            }}
          >
            Product manager and builder, working on AI-native fintech products.
          </div>
        </div>

        <div style={{ fontSize: 28, color: "#57544D" }}>chrisamattam.com</div>
      </div>
    ),
    { ...size }
  );
}
