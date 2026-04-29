import Link from "next/link"

import { AppCard, AppPill, KanvasIcons } from "@/components/kanvas"
import { formatRupiah } from "@/lib/format/currency"

import { dashboardData } from "@/features/admin-dashboard/lib/dashboard-data"

const quickActions = [
  { href: "/admin/kas-masuk", label: "Tambah Kas Masuk", icon: KanvasIcons.in },
  { href: "/admin/kas-keluar", label: "Catat Kas Keluar", icon: KanvasIcons.out },
  { href: "/admin/warga", label: "Tambah Warga", icon: KanvasIcons.users },
  { href: "/admin/laporan", label: "Lihat Laporan", icon: KanvasIcons.doc },
]

export function AdminReminders() {
  return (
    <section className="grid grid-cols-1 gap-3.5 xl:grid-cols-3">
      <AppCard className="p-5 xl:col-span-1">
        <p className="text-[11px] font-semibold tracking-[0.6px] text-kanvas-ink-4 uppercase">Tunggakan</p>
        <p className="mt-1 text-2xl leading-none font-semibold text-kanvas-ink">{formatRupiah(dashboardData.totalTunggakanNominal)}</p>
        <p className="mt-1.5 text-[11.5px] text-kanvas-ink-3">{dashboardData.totalWargaMenunggak} warga belum lunas</p>
        <div className="mt-3.5 space-y-2 border-t border-kanvas-line-2 pt-3">
          {dashboardData.tunggakanTerbesar.slice(0, 2).map((item) => (
            <div key={`${item.warga}-${item.blok}`} className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
              <div>
                <p className="font-semibold text-kanvas-ink">{item.warga}</p>
                <p className="text-[10.5px] text-kanvas-ink-4">Blok {item.blok}</p>
              </div>
              <AppPill tone="danger">{formatRupiah(item.total).replace("Rp ", "")}</AppPill>
            </div>
          ))}
        </div>
        <Link
          href="/admin/tunggakan"
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-kanvas-terra"
        >
          Buka rekap tunggakan
          <KanvasIcons.arrowR size={12} />
        </Link>
      </AppCard>

      <AppCard className="p-5 xl:col-span-1">
        <p className="text-[11px] font-semibold tracking-[0.6px] text-kanvas-ink-4 uppercase">Aksi Cepat</p>
        <p className="mt-0.5 text-lg text-kanvas-ink">Operasi harian pengurus</p>
        <div className="mt-3 grid grid-cols-1 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.href}
                href={action.href}
                className="inline-flex items-center gap-2 rounded-lg border border-kanvas-line bg-white px-3 py-2 text-[13px] font-semibold text-kanvas-ink-2 transition hover:bg-kanvas-paper"
              >
                <Icon size={13} />
                <span>{action.label}</span>
                <KanvasIcons.chevronR size={13} className="ml-auto" />
              </Link>
            )
          })}
        </div>
      </AppCard>

      <AppCard className="p-5 xl:col-span-1">
        <p className="text-[11px] font-semibold tracking-[0.6px] text-kanvas-ink-4 uppercase">Pengingat</p>
        <p className="mt-0.5 text-lg text-kanvas-ink">Perlu ditindaklanjuti</p>

        <div className="mt-3 space-y-2.5">
          <div className="rounded-lg border border-kanvas-line-2 bg-kanvas-paper-2 p-2.5">
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1.5">
              <p className="text-[12px] font-semibold text-kanvas-ink">Kontrak hampir habis</p>
              <AppPill tone="olive" style={{ fontSize: 9.5, padding: "1px 6px" }}>
                {dashboardData.kontrakAkanHabis.length} rumah
              </AppPill>
            </div>
            {dashboardData.kontrakAkanHabis.slice(0, 2).map((item) => (
              <p key={`${item.warga}-${item.pindah}`} className="text-[11px] text-kanvas-ink-3">
                {item.warga} ({item.blok}) · {item.sisaHari} hari lagi
              </p>
            ))}
          </div>

          <div className="rounded-lg border border-kanvas-line-2 bg-kanvas-paper-2 p-2.5">
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1.5">
              <p className="text-[12px] font-semibold text-kanvas-ink">Kategori belum ditagih</p>
              <AppPill tone="terra" style={{ fontSize: 9.5, padding: "1px 6px" }}>
                {dashboardData.kategoriBelumDitagih.length} kategori
              </AppPill>
            </div>
            {dashboardData.kategoriBelumDitagih.slice(0, 2).map((kategori) => (
              <p key={kategori.id} className="text-[11px] text-kanvas-ink-3">
                {kategori.nama}
              </p>
            ))}
          </div>
        </div>
      </AppCard>
    </section>
  )
}
