"use client"

import { useEffect } from "react"

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[GLOBAL_ERROR]", error.digest ?? "no-digest")
  }, [error])

  return (
    <html lang="id">
      <body style={{ margin: 0, fontFamily: "sans-serif", background: "#f5f5f0" }}>
        <main
          style={{
            display: "flex",
            minHeight: "100svh",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "32rem",
              background: "#fff",
              borderRadius: "0.75rem",
              padding: "1.75rem",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}
          >
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "1.4px",
                textTransform: "uppercase",
                color: "#9ca3af",
                margin: 0,
              }}
            >
              Error
            </p>
            <h1 style={{ marginTop: "0.5rem", fontSize: "1.875rem", lineHeight: 1.25, color: "#111" }}>
              Terjadi kesalahan
            </h1>
            <p style={{ marginTop: "0.75rem", fontSize: "0.875rem", lineHeight: 1.6, color: "#6b7280" }}>
              Aplikasi mengalami masalah yang tidak terduga. Silakan muat ulang halaman.
            </p>
            <div style={{ marginTop: "1.5rem" }}>
              <button
                onClick={reset}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0.5rem 1rem",
                  background: "#111",
                  color: "#fff",
                  border: "none",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Muat Ulang
              </button>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
