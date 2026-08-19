import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 700,
            color: "#22c55e",
            letterSpacing: "-3px",
          }}
        >
          fp
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
