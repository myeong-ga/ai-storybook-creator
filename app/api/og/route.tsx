import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Get params
    const title = searchParams.get("title") || "StoryMaker"
    const subtitle = searchParams.get("subtitle") || "AI-generated alphabet stories for children"
    const imageUrl = searchParams.get("image") || ""
    const type = searchParams.get("type") || "story" // story, home, etc.

    // Make sure image URLs are absolute
    const absoluteImageUrl =
      imageUrl && !imageUrl.startsWith("http") && !imageUrl.startsWith("/placeholder")
        ? `https://v0-story-maker.vercel.app${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`
        : imageUrl

    // Font
    const interBold = await fetch(
      new URL(
        "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZFhjQ.ttf",
        import.meta.url,
      ),
    ).then((res) => res.arrayBuffer())

    const interRegular = await fetch(
      new URL(
        "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZFhjQ.ttf",
        import.meta.url,
      ),
    ).then((res) => res.arrayBuffer())

    // Determine background gradient based on type
    let bgGradient = "linear-gradient(to bottom right, #f0f4ff, #e0e7ff, #fae8ff)"
    if (type === "home") {
      bgGradient = "linear-gradient(to bottom right, #ede9fe, #ddd6fe, #c4b5fd)"
    }

    // Determine subtitle text based on type
    let finalSubtitle = subtitle
    if (type === "story") {
      finalSubtitle = `An AI-generated alphabet story ${subtitle}`
    }

    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: bgGradient,
          padding: "40px",
        }}
      >
        {/* Logo and branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            position: "absolute",
            top: "40px",
            left: "40px",
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9333ea"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
          <span
            style={{
              marginLeft: "10px",
              fontSize: "24px",
              fontWeight: "bold",
              fontFamily: "Inter",
              color: "#9333ea",
            }}
          >
            StoryMaker
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            gap: "20px",
          }}
        >
          {absoluteImageUrl && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "300px",
                height: "300px",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
                border: "4px solid white",
              }}
            >
              <img
                src={absoluteImageUrl || "/placeholder.svg"}
                alt={title}
                width={300}
                height={300}
                style={{ objectFit: "cover" }}
              />
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              maxWidth: "80%",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                fontFamily: "Inter",
                margin: "0",
                background: "linear-gradient(to right, #9333ea, #d946ef)",
                backgroundClip: "text",
                color: "transparent",
                padding: "10px",
              }}
            >
              {title}
            </h1>

            <p
              style={{
                fontSize: "24px",
                fontFamily: "Inter",
                color: "#6b7280",
                margin: "10px 0 0 0",
              }}
            >
              {finalSubtitle}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "1120px", // Fixed width (1200px - 40px padding on each side)
            borderTop: "1px solid rgba(147, 51, 234, 0.2)",
            paddingTop: "20px",
          }}
        >
          <p
            style={{
              fontSize: "18px",
              fontFamily: "Inter",
              color: "#9333ea",
              margin: "0",
            }}
          >
            v0-story-maker.vercel.app
          </p>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Inter",
            data: interBold,
            style: "normal",
            weight: 700,
          },
          {
            name: "Inter",
            data: interRegular,
            style: "normal",
            weight: 400,
          },
        ],
      },
    )
  } catch (error) {
    console.error("Error generating OG image:", error)
    return new Response("Failed to generate image", { status: 500 })
  }
}

