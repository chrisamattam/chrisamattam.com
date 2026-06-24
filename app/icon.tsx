import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Mirrors the nav LogoMark: dark tile, geometric "M" monogram, accent dot.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2B2926",
          borderRadius: 6,
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path
            d="M5.5 17.5 L5.5 7 L12 13.5 L18.5 7 L18.5 17.5"
            stroke="#F2ECDA"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="18.5" cy="17.6" r="1.7" fill="#0071E3" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
