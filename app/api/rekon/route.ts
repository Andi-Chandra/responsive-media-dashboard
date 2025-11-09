import { NextResponse, type NextRequest } from "next/server"

import {
  createDataRekonRow,
  listDataRekonRows,
  type DataRekonMutationInput,
} from "@/lib/googleSheetsAdmin"
import { isAdmin } from "@/lib/supabase/server"

const editableFields = [
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

type EditableField = (typeof editableFields)[number]

function sanitizePayload(body: unknown): DataRekonMutationInput {
  if (!body || typeof body !== "object") {
    return {}
  }

  const payload: Record<string, string> = {}
  for (const field of editableFields) {
    const value = (body as Record<EditableField, unknown>)[field]
    if (typeof value === "string" && value.trim().length > 0) {
      payload[field] = value.trim()
    } else if (typeof value === "number") {
      payload[field] = String(value)
    }
  }

  return payload
}

async function ensureAdmin() {
  const admin = await isAdmin()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return null
}

export async function GET() {
  const unauthorized = await ensureAdmin()
  if (unauthorized) return unauthorized

  try {
    const rows = await listDataRekonRows()
    return NextResponse.json({ rows })
  } catch (error) {
    console.error("Failed to fetch DataRekon rows", error)
    return NextResponse.json(
      { error: "Failed to load DataRekon data" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await ensureAdmin()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json().catch(() => ({}))
    const payload = sanitizePayload(body)

    if (!payload.vesselName || !payload.arrivalDate) {
      return NextResponse.json(
        { error: "Vessel name and arrival date are required" },
        { status: 400 },
      )
    }

    const created = await createDataRekonRow(payload)
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("Failed to create DataRekon row", error)
    return NextResponse.json(
      { error: "Failed to create DataRekon entry" },
      { status: 500 },
    )
  }
}
