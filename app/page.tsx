import type { ReactNode } from "react"
import Link from "next/link"
import {
  Activity,
  ArrowUpRight,
  Database,
  Ship,
  Waves,
} from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { GOOGLE_SHEET_ID, getDataRekonEntries } from "@/lib/googleSheets"
import { cn } from "@/lib/utils"

const integerFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
})

const decimalFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 1,
})

export default async function Home() {
  const dataRekon = await getDataRekonEntries()

  const totalEntries = dataRekon.length
  const completedRekon = dataRekon.filter((entry) =>
    includes(entry.statusData, ["completed", "selesai"]),
  ).length
  const pendingRekon = totalEntries - completedRekon
  const siakangReady = dataRekon.filter((entry) =>
    includes(entry.statusSiakang, ["sudah"]),
  ).length
  const siakangPending = dataRekon.filter((entry) =>
    includes(entry.statusSiakang, ["belum"]),
  ).length
  const totalRekonVolume = sumNumeric(dataRekon.map((entry) => entry.volume))
  const averageRekonVolume =
    totalEntries > 0 ? totalRekonVolume / totalEntries : 0
  const petugasCount = countUnique(dataRekon.map((entry) => entry.petugas))
  const gudangCount = countUnique(dataRekon.map((entry) => entry.gudang))

  const recentRekon = sortByDate(dataRekon, (entry) => entry.arrivalDate.iso)
    .slice(0, 8)
    .map((entry) => ({
      ...entry,
      arrivalDisplay: entry.arrivalDate.display ?? "Tidak tersedia",
    }))

  const latestTimestamp = latestDate([
    ...dataRekon.map((entry) => entry.arrivalDate.iso),
  ])
  const lastUpdated = latestTimestamp
    ? formatDateTime(latestTimestamp)
    : "Tidak tersedia"

  const sheetUrl = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(
    GOOGLE_SHEET_ID,
  )}/edit?usp=sharing`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-12 pt-10 sm:px-6 lg:pb-16 lg:pt-16">
        <header className="flex flex-col gap-6 rounded-3xl border border-slate-200/70 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Responsive Media Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
              Monitoring Aktivitas Pelabuhan Perikanan Belawan
            </h1>
            <p className="mt-3 max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Data disinkronkan langsung dari Google Sheets (sheet{" "}
              <strong>DataRekon</strong>) untuk memberikan gambaran terbaru
              mengenai kedatangan kapal, proses bongkar, dan status perizinan.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Badge variant="secondary" className="bg-sky-500/10 text-sky-700 dark:text-sky-200">
                Terakhir diperbarui {lastUpdated}
              </Badge>
              <span>|</span>
              <span>Refresh otomatis setiap 5 menit</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link
                href={sheetUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium"
              >
                Buka Spreadsheet
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Ship className="h-5 w-5 text-sky-500" />}
            label="Total Entri"
            value={formatInteger(totalEntries)}
            subLabel={`${completedRekon} selesai / ${pendingRekon} proses`}
          />
          <StatCard
            icon={<Waves className="h-5 w-5 text-cyan-500" />}
            label="Volume Rekap"
            value={`${formatDecimal(totalRekonVolume)} ton`}
            subLabel={`Rata-rata ${formatDecimal(averageRekonVolume)} ton/kapal`}
          />
          <StatCard
            icon={<Activity className="h-5 w-5 text-emerald-500" />}
            label="Status Siakang"
            value={`${formatInteger(siakangReady)} kapal`}
            subLabel={`${formatInteger(siakangPending)} menunggu proses`}
          />
          <StatCard
            icon={<Database className="h-5 w-5 text-indigo-500" />}
            label="Petugas Aktif"
            value={`${formatInteger(petugasCount)} petugas`}
            subLabel={`${formatInteger(gudangCount)} gudang terlapor`}
          />
        </section>

        <section className="grid gap-6">
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Ship className="h-5 w-5 text-sky-500" />
                  Data Rekonsiliasi Kedatangan
                </CardTitle>
                <CardDescription>
                  Status kedatangan kapal dan kelengkapan dokumen siakang untuk
                  {` `}
                  {dataRekon.length} entri terbaru.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-200">
                  {siakangReady} kapal siap siakang
                </Badge>
                <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-200">
                  {siakangPending} kapal menunggu siakang
                </Badge>
                <Badge className="bg-slate-500/10 text-slate-600 dark:text-slate-200">
                  {formatDecimal(totalRekonVolume)} ton tercatat
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      <th className="pb-2">Kapal</th>
                      <th className="pb-2">Gudang</th>
                      <th className="pb-2">Volume</th>
                      <th className="pb-2">Status Data</th>
                      <th className="pb-2">Status Siakang</th>
                      <th className="pb-2">Petugas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {recentRekon.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60">
                        <td className="py-3">
                          <div className="font-medium text-slate-900 dark:text-white">
                            {entry.vessel}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Datang {entry.arrivalDisplay}
                          </p>
                        </td>
                        <td className="py-3">{entry.gudang ?? "â€”"}</td>
                        <td className="py-3 font-semibold">
                          {entry.volume ? `${formatDecimal(entry.volume)} ton` : "â€”"}
                        </td>
                        <td className="py-3">
                          <Badge
                            variant="outline"
                            className={cn(
                              "border px-2",
                              statusBadgeClass(entry.statusData),
                            )}
                          >
                            {entry.statusData ?? "Tidak tersedia"}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Badge
                            variant="outline"
                            className={cn(
                              "border px-2",
                              statusBadgeClass(entry.statusSiakang),
                            )}
                          >
                            {entry.statusSiakang ?? "Tidak tersedia"}
                          </Badge>
                        </td>
                        <td className="py-3">{entry.petugas ?? "â€”"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  Menampilkan {recentRekon.length} entri terbaru dari DataRekon.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  subLabel,
}: {
  icon: ReactNode
  label: string
  value: string
  subLabel: string
}) {
  return (
    <Card className="border-slate-200/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardDescription>{label}</CardDescription>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold text-slate-900 dark:text-white">
          {value}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{subLabel}</p>
      </CardContent>
    </Card>
  )
}

function includes(value: string | null, needles: string[]) {
  if (!value) {
    return false
  }
  const compare = value.toLowerCase()
  return needles.some((needle) => compare.includes(needle))
}

function sumNumeric(values: Array<number | null>): number {
  return values.reduce((acc, value) => acc + (value ?? 0), 0)
}

function countUnique(values: Array<string | null | undefined>): number {
  const normalized = values
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter((value) => value.length > 0)
  return new Set(normalized).size
}

function sortByDate<T>(
  items: T[],
  getter: (item: T) => string | null,
): T[] {
  return [...items].sort((a, b) => {
    const aTime = getter(a) ? new Date(getter(a) as string).getTime() : 0
    const bTime = getter(b) ? new Date(getter(b) as string).getTime() : 0
    return bTime - aTime
  })
}

function latestDate(values: Array<string | null>): number | null {
  const timestamps = values
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value as string).getTime())
    .filter((value) => Number.isFinite(value))
  if (!timestamps.length) {
    return null
  }
  return Math.max(...timestamps)
}

function formatDateTime(timestamp: number) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp))
}

function formatInteger(value: number) {
  return integerFormatter.format(value)
}

function formatDecimal(value: number) {
  return decimalFormatter.format(value)
}

const STATUS_STYLES = {
  success:
    "border-emerald-400/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-200",
  warning:
    "border-amber-400/40 bg-amber-500/15 text-amber-600 dark:text-amber-200",
  danger: "border-rose-400/40 bg-rose-500/10 text-rose-600 dark:text-rose-200",
  info: "border-blue-400/40 bg-blue-500/10 text-blue-600 dark:text-blue-200",
  neutral:
    "border-slate-400/40 bg-slate-500/10 text-slate-600 dark:text-slate-200",
}

function statusBadgeClass(value: string | null) {
  if (!value) {
    return STATUS_STYLES.neutral
  }

  const status = value.toLowerCase()
  if (
    status.includes("completed") ||
    status.includes("selesai") ||
    status.includes("sudah") ||
    status.includes("aktif")
  ) {
    return STATUS_STYLES.success
  }
  if (
    status.includes("proses") ||
    status.includes("pending") ||
    status.includes("uncompleted")
  ) {
    return STATUS_STYLES.warning
  }
  if (
    status.includes("belum") ||
    status.includes("expired") ||
    status.includes("kadaluarsa") ||
    status.includes("rusak")
  ) {
    return STATUS_STYLES.danger
  }
  return STATUS_STYLES.info
}

