"use client"

import { useEffect, useState } from "react"

import { getTunggakanAction } from "@/lib/actions/tunggakan"

export function useTunggakanCount() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    async function fetchTunggakanCount() {
      const now = new Date()
      const tahun = now.getFullYear()
      const bulan = now.getMonth() + 1

      const result = await getTunggakanAction({
        bulanMulai: bulan,
        tahunMulai: tahun,
        bulanSelesai: bulan,
        tahunSelesai: tahun,
      })

      if (result.ok) {
        setCount(result.data.totalWarga)
      }
    }

    fetchTunggakanCount()
  }, [])

  return count
}