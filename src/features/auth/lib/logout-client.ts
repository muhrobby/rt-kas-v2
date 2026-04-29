interface LogoutResult {
  success: boolean
  error?: string
}

export async function logoutClient(): Promise<LogoutResult> {

  try {
    const response = await fetch("/api/auth/sign-out", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: "{}",
    })

    if (!response.ok) {
      return { success: false, error: "Gagal keluar. Coba lagi." }
    }

    return { success: true }
  } catch {
    return { success: false, error: "Gagal keluar. Coba lagi." }
  }
}
