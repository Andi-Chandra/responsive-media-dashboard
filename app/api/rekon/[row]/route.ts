import { NextResponse, type NextRequest } from "next/server"

import {
  deleteDataRekonRow,
  getDataRekonRow,
  updateDataRekonRow,
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

function parseRowNumber(value: string) {
  const rowNumber = Number.parseInt(value, 10)
  if (Number.isNaN(rowNumber) || rowNumber < 2) {
    throw new Error("Invalid row number")
  }
  return rowNumber
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { row: string } },
) {
  const unauthorized = await ensureAdmin()
  if (unauthorized) return unauthorized

  try {
    const rowNumber = parseRowNumber(params.row)
    const existing = await getDataRekonRow(rowNumber)
    if (!existing) {
      return NextResponse.json({ error: "Row not found" }, { status: 404 })
    }

    const body = await request.json().catch(() => ({}))
    const payload = sanitizePayload(body)

    if (!Object.keys(payload).length) {
      return NextResponse.json(
        { error: "No fields provided for update" },
        { status: 400 },
      )
    }

    const updated = await updateDataRekonRow(rowNumber, payload)
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update DataRekon row", error)
    if ((error as Error).message === "Invalid row number") {
      return NextResponse.json({ error: "Invalid row" }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to update DataRekon entry" },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { row: string } },
) {
  const unauthorized = await ensureAdmin()
  if (unauthorized) return unauthorized

  try {
    const rowNumber = parseRowNumber(params.row)
    await deleteDataRekonRow(rowNumber)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete DataRekon row", error)
    if ((error as Error).message === "Invalid row number") {
      return NextResponse.json({ error: "Invalid row" }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to delete DataRekon entry" },
      { status: 500 },
    )
  }
}
