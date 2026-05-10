"use client"

import { AppCard } from "@/components/kanvas"
import type { AppSettingsView } from "@/lib/branding/format-branding"

interface SettingsPreviewCardProps {
  settings: AppSettingsView
}

export function SettingsPreviewCard({ settings }: SettingsPreviewCardProps) {
  return (
    <AppCard className="overflow-hidden">
      <div
        className="px-4 py-3"
        style={{ backgroundColor: settings.primaryColor }}
      >
        <p className="text-sm font-semibold text-white">{settings.appName}</p>
        <p className="mt-0.5 text-xs text-white/80">{settings.rtRwLabel}</p>
      </div>

      <div className="p-4">
        <p className="text-[11px] font-semibold tracking-[0.7px] text-kanvas-ink-4 uppercase">
          Preview Kuitansi
        </p>

        <div
          className="mt-3 rounded-lg border p-3"
          style={{ borderColor: settings.primaryColor }}
        >
          <div
            className="mb-3 pb-3 text-center"
            style={{ borderBottomColor: settings.accentColor }}
          >
            <p
              className="text-sm font-semibold"
              style={{ color: settings.primaryColor }}
            >
              {settings.receiptTitle || "Kuitansi Pembayaran"}
            </p>
            <p className="mt-0.5 text-xs text-kanvas-ink-3">
              {settings.rtRwLabel}
            </p>
          </div>

          <div className="space-y-1.5 text-xs text-kanvas-ink">
            <div className="flex justify-between">
              <span className="text-kanvas-ink-3">No. Transaksi</span>
              <span>TRX-001</span>
            </div>
            <div className="flex justify-between">
              <span className="text-kanvas-ink-3">Warga</span>
              <span>Budi Santoso</span>
            </div>
            <div className="flex justify-between">
              <span className="text-kanvas-ink-3">Kategori</span>
              <span>Iuran Lingkungan</span>
            </div>
            <div className="flex justify-between">
              <span className="text-kanvas-ink-3">Periode</span>
              <span>Januari 2025</span>
            </div>
            <div
              className="mt-2 flex justify-between font-semibold"
              style={{ color: settings.primaryColor }}
            >
              <span>Total</span>
              <span>Rp 50.000</span>
            </div>
          </div>

          {settings.receiptFooter && (
            <p className="mt-3 border-t pt-2 text-center text-[10px] text-kanvas-ink-3">
              {settings.receiptFooter}
            </p>
          )}
        </div>

        {settings.address && (
          <p className="mt-3 text-[11px] text-kanvas-ink-3">{settings.address}</p>
        )}
        {(settings.phone || settings.email) && (
          <p className="mt-1 text-[11px] text-kanvas-ink-3">
            {settings.phone && `${settings.phone}`}
            {settings.phone && settings.email && " • "}
            {settings.email && settings.email}
          </p>
        )}
      </div>
    </AppCard>
  )
}
