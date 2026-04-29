"use client"

import Link from "next/link"

import { AppCard, AppPill, KanvasIcons } from "@/components/kanvas"

function toneByModul(modul: string): "terra" | "plum" | "olive" {
  if (modul === "Kas Masuk") {
    return "terra"
  }
  if (modul === "Kas Keluar") {
    return "plum"
  }
  return "olive"
}

interface LogEntry {
  waktuLog: string
  petugas: string
  modul: string
  aksi: string
  detail: string
}

interface RecentActivityCardProps {
  logTerbaru: LogEntry[]
}

export function RecentActivityCard({ logTerbaru }: RecentActivityCardProps) {
  return (
    <AppCard className="p-5">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.6px] text-kanvas-ink-4 uppercase">Aktivitas Terbaru</p>
          <p className="mt-0.5 text-lg text-kanvas-ink">Catatan pengurus</p>
        </div>
        <Link href="/admin/log-aktivitas" className="inline-flex items-center gap-1 text-xs font-semibold text-kanvas-terra">
          Semua
          <KanvasIcons.arrowR size={12} />
        </Link>
      </div>

      <div>
        {logTerbaru.length === 0 ? (
          <p className="py-6 text-center text-[12px] text-kanvas-ink-3">Belum ada aktivitas</p>
        ) : (
          logTerbaru.map((entry) => (
            <div key={`${entry.waktuLog}-${entry.detail}`} className="flex gap-3 border-t border-kanvas-line-2 py-2.5 first:border-t-0 first:pt-1">
              <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full bg-kanvas-paper text-[11px] font-bold text-kanvas-ink-2">
                {entry.petugas
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="break-words text-[12.5px] leading-snug text-kanvas-ink">
                  <span className="font-semibold">{entry.petugas}</span>
                  <span className="text-kanvas-ink-3"> · {entry.detail}</span>
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10.5px] text-kanvas-ink-4">
                  <span>{entry.waktuLog ? new Date(entry.waktuLog).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "-"}</span>
                  <span>·</span>
                  <AppPill tone={toneByModul(entry.modul)} style={{ fontSize: 9.5, padding: "1px 6px" }}>
                    {entry.modul}
                  </AppPill>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AppCard>
  )
}
