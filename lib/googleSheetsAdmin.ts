import { JWT } from "google-auth-library"

const DATA_REKON_SHEET = "DataRekon"
const DATA_REKON_RANGE = `${DATA_REKON_SHEET}!A1:S`

const DATA_REKON_COLUMNS = [
  "no",
  "idRekon",
  "arrivalDate",
  "arrivalTime",
  "vesselName",
  "gt",
  "tandaSelar",
  "api",
  "skema",
  "gudang",
  "pengurus",
  "statusSiakang",
  "tanggalBongkar",
  "selesaiBongkar",
  "selesaiInput",
  "petugas",
  "volume",
  "statusData",
  "infoKedatangan",
] as const

export type DataRekonSheetRow = {
  rowNumber: number
} & Record<(typeof DATA_REKON_COLUMNS)[number], string>

export type DataRekonMutationInput = Partial<
  Omit<DataRekonSheetRow, "rowNumber" | "no">
>

const sheetsScopes = ["https://www.googleapis.com/auth/spreadsheets"]
const spreadsheetId =
  process.env.GOOGLE_SHEET_ID ||
  process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID ||
  process.env.GOOGLE_SHEET_REKON_ID

if (!spreadsheetId) {
  throw new Error("Missing Google Sheet ID for DataRekon operations")
}

const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(
  /\\n/g,
  "\n",
)

if (!serviceAccountEmail || !serviceAccountKey) {
  throw new Error("Missing Google service account credentials")
}

const authClient = new JWT({
  email: serviceAccountEmail,
  key: serviceAccountKey,
  scopes: sheetsScopes,
})

const SHEETS_BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`

type SheetsFetchOptions = RequestInit & {
  searchParams?: Record<string, string>
}

async function sheetsFetch<T>(
  path: string,
  { searchParams, headers, ...init }: SheetsFetchOptions = {},
): Promise<T> {
  const url = new URL(`${SHEETS_BASE_URL}${path}`)
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value)
    }
  }

  const { access_token } = await authClient.authorize()
  if (!access_token) {
    throw new Error("Unable to acquire Google Sheets access token")
  }

  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
      ...headers,
    },
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(
      `Google Sheets request failed (${response.status}): ${message}`,
    )
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json() as Promise<T>
}

let cachedDataRekonSheetId: number | null = null

async function getDataRekonSheetId(): Promise<number> {
  if (cachedDataRekonSheetId) return cachedDataRekonSheetId

  const data = await sheetsFetch<{
    sheets: Array<{ properties?: { sheetId?: number; title?: string } }>
  }>("", {
    searchParams: {
      fields: "sheets(properties(sheetId,title))",
    },
  })

  const targetSheet = data.sheets?.find(
    (sheet) => sheet.properties?.title === DATA_REKON_SHEET,
  )

  if (!targetSheet?.properties?.sheetId) {
    throw new Error("Failed to locate DataRekon sheet metadata")
  }

  cachedDataRekonSheetId = targetSheet.properties.sheetId
  return cachedDataRekonSheetId
}

function parseRow(row: Array<string | number | null>, rowIndex: number) {
  const values = DATA_REKON_COLUMNS.reduce<Record<string, string>>(
    (acc, key, columnIndex) => {
      const value = row[columnIndex]
      acc[key] =
        typeof value === "number"
          ? String(value)
          : typeof value === "string"
            ? value
            : ""
      return acc
    },
    {},
  )

  return {
    rowNumber: rowIndex,
    ...values,
  } as DataRekonSheetRow
}

function generateRekonId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()
}

function composeRowValues(
  input: DataRekonMutationInput,
  existing?: DataRekonSheetRow,
) {
  const merged = {
    ...existing,
    ...input,
  }

  return [
    existing?.no || "=ROW()-1",
    merged.idRekon || generateRekonId(),
    merged.arrivalDate || "",
    merged.arrivalTime || "",
    merged.vesselName,
    merged.gt || "",
    merged.tandaSelar || "",
    merged.api || "",
    merged.skema || "",
    merged.gudang || "",
    merged.pengurus || "",
    merged.statusSiakang || "",
    merged.tanggalBongkar || "",
    merged.selesaiBongkar || "",
    merged.selesaiInput || "",
    merged.petugas || "",
    merged.volume || "",
    merged.statusData || "",
    merged.infoKedatangan || "",
  ]
}

export async function listDataRekonRows(): Promise<DataRekonSheetRow[]> {
  const data = await sheetsFetch<{ values?: Array<Array<string | number>> }>(
    `/values/${encodeURIComponent(DATA_REKON_RANGE)}`,
    {
      searchParams: {
        valueRenderOption: "UNFORMATTED_VALUE",
        dateTimeRenderOption: "FORMATTED_STRING",
      },
    },
  )

  const values = data.values ?? []
  const rows = values.slice(1)

  return rows.map((row, index) => parseRow(row, index + 2))
}

export async function getDataRekonRow(
  rowNumber: number,
): Promise<DataRekonSheetRow | null> {
  if (rowNumber < 2) return null
  const range = `${DATA_REKON_SHEET}!A${rowNumber}:S${rowNumber}`
  const data = await sheetsFetch<{ values?: Array<Array<string | number>> }>(
    `/values/${encodeURIComponent(range)}`,
  )

  const row = data.values?.[0]
  if (!row) return null
  return parseRow(row, rowNumber)
}

export async function createDataRekonRow(
  payload: DataRekonMutationInput,
): Promise<DataRekonSheetRow> {
  if (!payload.vesselName || !payload.arrivalDate) {
    throw new Error("Vessel name and arrival date are required")
  }

  await sheetsFetch(
    `/values/${encodeURIComponent(`${DATA_REKON_SHEET}!A:S`)}:append`,
    {
      method: "POST",
      searchParams: {
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
      },
      body: JSON.stringify({
        values: [composeRowValues(payload)],
      }),
    },
  )

  const rows = await listDataRekonRows()
  return rows[rows.length - 1]
}

export async function updateDataRekonRow(
  rowNumber: number,
  payload: DataRekonMutationInput,
): Promise<DataRekonSheetRow> {
  if (rowNumber < 2) {
    throw new Error("Cannot modify header row")
  }

  const existing = await getDataRekonRow(rowNumber)
  if (!existing) {
    throw new Error("Row not found")
  }

  const range = `${DATA_REKON_SHEET}!A${rowNumber}:S${rowNumber}`
  await sheetsFetch(`/values/${encodeURIComponent(range)}`, {
    method: "PUT",
    searchParams: {
      valueInputOption: "USER_ENTERED",
    },
    body: JSON.stringify({
      values: [composeRowValues(payload, existing)],
    }),
  })

  return (await getDataRekonRow(rowNumber))!
}

export async function deleteDataRekonRow(rowNumber: number) {
  if (rowNumber < 2) {
    throw new Error("Cannot delete header row")
  }

  const sheetId = await getDataRekonSheetId()
  await sheetsFetch(":batchUpdate", {
    method: "POST",
    body: JSON.stringify({
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowNumber - 1,
              endIndex: rowNumber,
            },
          },
        },
      ],
    }),
  })
}
