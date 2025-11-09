import { cache } from "react"

const FALLBACK_SHEET_ID = "1op7Xox8ZNi3WoIX4zfn88O_HR8yHbZXQ4iih5HfL7Yo"
const SHEET_ID =
  process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID ??
  process.env.GOOGLE_SHEET_ID ??
  FALLBACK_SHEET_ID
export const GOOGLE_SHEET_ID = SHEET_ID

type GoogleVisualizationResponse = {
  table: {
    cols: { id: string; label: string; type: string }[]
    rows: { c: { v?: string | number | boolean | null; f?: string | null }[] }[]
  }
}

type SheetCell = {
  value: string | number | boolean | null
  formatted: string | null
}

export type SheetRow = Record<string, SheetCell>

export type SheetDateValue = {
  iso: string | null
  display: string | null
}

export type DataRekonEntry = {
  id: string
  vessel: string
  scheme: string | null
  arrivalDate: SheetDateValue
  gudang: string | null
  pengurus: string | null
  statusSiakang: string | null
  statusData: string | null
  petugas: string | null
  volume: number | null
  infoKedatangan: string | null
}

export type SipariEntry = {
  vessel: string
  tandaSelar: string | null
  alatTangkap: string | null
  grossTonage: number | null
  volume: number | null
  skema: string | null
  statusKedatangan: string | null
  statusBongkar: string | null
  petugas: string | null
  tanggalBongkar: SheetDateValue
}

export type DbaseEntry = {
  vessel: string
  tandaSelar: string | null
  noReg: string | null
  api: string | null
  pemilik: string | null
  gudang: string | null
  grossTonase: number | null
  statusPerizinan: string | null
  izinExpiry: SheetDateValue
}

const fetchSheetRows = cache(async (sheetName: string): Promise<SheetRow[]> => {
  if (!SHEET_ID) {
    throw new Error("Google Sheet ID is not configured")
  }

  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(
    sheetName,
  )}`

  const response = await fetch(url, { next: { revalidate: 300 } })
  if (!response.ok) {
    throw new Error(
      `Failed to fetch sheet "${sheetName}" (${response.statusText})`,
    )
  }

  const body = await response.text()
  const payload = extractPayload(body)
  return normaliseRows(payload)
})

export const getDataRekonEntries = cache(
  async (): Promise<DataRekonEntry[]> => {
    const rows = await fetchSheetRows("DataRekon")
    return rows
      .filter((row) => !!textValue(row, "NAMA KAPAL"))
      .map((row) => ({
        id: textValue(row, "IDRekon") ?? crypto.randomUUID(),
        vessel: textValue(row, "NAMA KAPAL") ?? "Tidak diketahui",
        scheme: textValue(row, "SKEMA"),
        arrivalDate: dateValue(row, "HARI/ TANGGAL KEDATANGAN"),
        gudang: textValue(row, "GUDANG"),
        pengurus: textValue(row, "PENGURUS"),
        statusSiakang: textValue(row, "STATUS SIAKANG"),
        statusData: textValue(row, "STATUS DATA"),
        petugas: textValue(row, "PETUGAS"),
        volume: numberValue(row, "VOLUME"),
        infoKedatangan: textValue(row, "INFO KEDATANGAN"),
      }))
  },
)

export const getSipariEntries = cache(async (): Promise<SipariEntry[]> => {
  const rows = await fetchSheetRows("SIPARI")
  return rows
    .filter((row) => !!textValue(row, "Nama Kapal Perikanan"))
    .map((row) => ({
      vessel: textValue(row, "Nama Kapal Perikanan") ?? "Tidak diketahui",
      tandaSelar: textValue(row, "Tanda Selar"),
      alatTangkap: textValue(row, "Alat Tangkap"),
      grossTonage: numberValue(row, "Gross Tonage"),
      volume: numberValue(row, "Volume"),
      skema: textValue(row, "Skema"),
      statusKedatangan: textValue(row, "Status Kedatangan"),
      statusBongkar: textValue(row, "Status Bongkar"),
      petugas: textValue(row, "Petugas Pendataan"),
      tanggalBongkar: dateValue(row, "Tanggal Bongkar"),
    }))
})

export const getDbaseEntries = cache(async (): Promise<DbaseEntry[]> => {
  const rows = await fetchSheetRows("Dbase")
  return rows
    .filter((row) => !!textValue(row, "NAMA KAPAL"))
    .map((row) => ({
      vessel: textValue(row, "NAMA KAPAL") ?? "Tidak diketahui",
      tandaSelar: textValue(row, "TANDA SELAR"),
      noReg: textValue(row, "No Reg Kapal"),
      api: textValue(row, "API"),
      pemilik: textValue(row, "PEMILIK"),
      gudang: textValue(row, "GUDANG"),
      grossTonase: numberValue(row, "GROSS TONASE"),
      statusPerizinan: textValue(row, "Status Perizinan"),
      izinExpiry: dateValue(row, "Masa Berlaku Izin Kapal/SIPI"),
    }))
})

function extractPayload(body: string): GoogleVisualizationResponse {
  const start = body.indexOf("{")
  const end = body.lastIndexOf("}")
  if (start === -1 || end === -1) {
    throw new Error("Unexpected Google Sheets response format")
  }

  return JSON.parse(body.slice(start, end + 1)) as GoogleVisualizationResponse
}

function normaliseRows(payload: GoogleVisualizationResponse): SheetRow[] {
  const cols = payload.table?.cols ?? []
  const rows = payload.table?.rows ?? []

  return rows
    .map((row) => {
      const record: SheetRow = {}

      cols.forEach((column, index) => {
        const key = columnKey(column, index)
        record[key] = normaliseCell(row.c?.[index] ?? null, column.type)
      })

      return record
    })
    .filter((row) =>
      Object.values(row).some(
        (cell) =>
          cell.value !== null &&
          (typeof cell.value === "string" ? cell.value.trim().length : true),
      ),
    )
}

function columnKey(
  column: GoogleVisualizationResponse["table"]["cols"][number],
  index: number,
) {
  if (column.label && column.label.trim().length > 0) {
    return column.label.trim()
  }
  if (column.id && column.id.trim().length > 0) {
    return column.id.trim()
  }
  return `Column_${index}`
}

function normaliseCell(
  cell: { v?: string | number | boolean | null; f?: string | null } | null,
  type: string,
): SheetCell {
  if (!cell || typeof cell.v === "undefined" || cell.v === null) {
    return { value: null, formatted: cell?.f ?? null }
  }

  if (type === "number") {
    return {
      value: typeof cell.v === "number" ? cell.v : Number(cell.v),
      formatted: cell.f ?? (cell.v !== null ? String(cell.v) : null),
    }
  }

  if (type === "boolean") {
    return {
      value: Boolean(cell.v),
      formatted:
        cell.f ?? (cell.v ? "Ya" : cell.v === false ? "Tidak" : null),
    }
  }

  if (type === "date" || type === "datetime") {
    const iso =
      typeof cell.v === "string" ? parseGoogleDate(cell.v) : String(cell.v)
    return {
      value: iso,
      formatted: cell.f ?? (iso ? formatDisplayDate(iso) : null),
    }
  }

  return {
    value: typeof cell.v === "string" ? cell.v.trim() : (cell.v as string),
    formatted: cell.f ?? (cell.v !== null ? String(cell.v) : null),
  }
}

function parseGoogleDate(value: string): string | null {
  const dateMatch =
    /Date\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+),\s*(\d+),\s*(\d+))?\)/.exec(
      value,
    )
  if (!dateMatch) {
    return null
  }

  const [, year, month, day, hours = "0", minutes = "0", seconds = "0"] =
    dateMatch
  const date = new Date(
    Date.UTC(
      Number(year),
      Number(month),
      Number(day),
      Number(hours),
      Number(minutes),
      Number(seconds),
    ),
  )
  return date.toISOString()
}

function formatDisplayDate(iso: string | null) {
  if (!iso) {
    return null
  }

  const formatter = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
  return formatter.format(new Date(iso))
}

function textValue(row: SheetRow, key: string): string | null {
  const cell = row[key]
  if (!cell) {
    return null
  }

  if (typeof cell.value === "string" && cell.value.trim().length > 0) {
    return cell.value.trim()
  }

  if (typeof cell.value === "number") {
    return cell.formatted ?? String(cell.value)
  }

  if (typeof cell.value === "boolean") {
    return cell.value ? "Ya" : "Tidak"
  }

  if (cell.formatted && cell.formatted.trim().length > 0) {
    return cell.formatted.trim()
  }

  return null
}

function numberValue(row: SheetRow, key: string): number | null {
  const cell = row[key]
  if (!cell) {
    return null
  }

  if (typeof cell.value === "number" && Number.isFinite(cell.value)) {
    return cell.value
  }

  if (typeof cell.value === "string") {
    const parsed = Number(cell.value.replace(/[^\d.-]/g, ""))
    return Number.isFinite(parsed) ? parsed : null
  }

  if (cell.formatted) {
    const parsed = Number(cell.formatted.replace(/[^\d.-]/g, ""))
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function dateValue(row: SheetRow, key: string): SheetDateValue {
  const cell = row[key]
  if (!cell) {
    return { iso: null, display: null }
  }

  const iso =
    typeof cell.value === "string" && cell.value.includes("T")
      ? cell.value
      : null

  return {
    iso,
    display: cell.formatted ?? (iso ? formatDisplayDate(iso) : null),
  }
}
