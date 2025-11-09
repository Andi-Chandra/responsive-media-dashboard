"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Loader2,
  Pencil,
  Plus,
  RefreshCcw,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

type DataRekonRow = {
  rowNumber: number
  idRekon: string
  arrivalDate: string
  arrivalTime: string
  vesselName: string
  skema: string
  gudang: string
  pengurus: string
  statusSiakang: string
  petugas: string
  volume: string
  statusData: string
  infoKedatangan: string
}

type FormState = {
  idRekon: string
  arrivalDate: string
  arrivalTime: string
  vesselName: string
  skema: string
  gudang: string
  pengurus: string
  statusSiakang: string
  petugas: string
  volume: string
  statusData: string
  infoKedatangan: string
}

const initialFormState: FormState = {
  idRekon: "",
  arrivalDate: "",
  arrivalTime: "",
  vesselName: "",
  skema: "",
  gudang: "",
  pengurus: "",
  statusSiakang: "",
  petugas: "",
  volume: "",
  statusData: "",
  infoKedatangan: "",
}

export default function DataRekonDashboard() {
  const [rows, setRows] = useState<DataRekonRow[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState<FormState>(initialFormState)
  const [editingRow, setEditingRow] = useState<DataRekonRow | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadRows()
  }, [])

  const summary = useMemo(() => {
    const total = rows.length
    const completed = rows.filter((row) =>
      row.statusData.toLowerCase().includes("completed") ||
      row.statusData.toLowerCase().includes("selesai"),
    ).length
    const awaiting = total - completed

    return {
      total,
      completed,
      awaiting,
    }
  }, [rows])

  async function loadRows(showToast = false) {
    setLoading(true)
    try {
      const response = await fetch("/api/rekon", { cache: "no-store" })
      if (!response.ok) {
        throw new Error("Failed to load DataRekon entries")
      }
      const data = await response.json()
      setRows(
        (data.rows ?? []).map((row: any) => ({
          rowNumber: row.rowNumber,
          idRekon: row.idRekon ?? "",
          arrivalDate: row.arrivalDate ?? "",
          arrivalTime: row.arrivalTime ?? "",
          vesselName: row.vesselName ?? "",
          skema: row.skema ?? "",
          gudang: row.gudang ?? "",
          pengurus: row.pengurus ?? "",
          statusSiakang: row.statusSiakang ?? "",
          petugas: row.petugas ?? "",
          volume: row.volume ?? "",
          statusData: row.statusData ?? "",
          infoKedatangan: row.infoKedatangan ?? "",
        })),
      )
      if (showToast) {
        toast.success("DataRekon refreshed")
      }
    } catch (error) {
      console.error(error)
      toast.error("Tidak dapat memuat data DataRekon")
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setFormData(initialFormState)
    setEditingRow(null)
  }

  function openCreateDialog() {
    resetForm()
    setDialogOpen(true)
  }

  function openEditDialog(row: DataRekonRow) {
    setEditingRow(row)
    setFormData({
      idRekon: row.idRekon,
      arrivalDate: parseDateForInput(row.arrivalDate),
      arrivalTime: row.arrivalTime,
      vesselName: row.vesselName,
      skema: row.skema,
      gudang: row.gudang,
      pengurus: row.pengurus,
      statusSiakang: row.statusSiakang,
      petugas: row.petugas,
      volume: row.volume,
      statusData: row.statusData,
      infoKedatangan: row.infoKedatangan,
    })
    setDialogOpen(true)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)

    const payload = {
      ...formData,
      arrivalDate: formData.arrivalDate,
      volume: formData.volume,
    }

    try {
      const endpoint = editingRow
        ? `/api/rekon/${editingRow.rowNumber}`
        : "/api/rekon"
      const method = editingRow ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || "Permintaan gagal")
      }

      toast.success(
        editingRow
          ? "Entri DataRekon berhasil diperbarui"
          : "Entri DataRekon berhasil dibuat",
      )
      setDialogOpen(false)
      resetForm()
      loadRows()
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(row: DataRekonRow) {
    const confirmed = window.confirm(
      `Hapus entri ${row.vesselName} (row ${row.rowNumber})?`,
    )
    if (!confirmed) return

    try {
      const response = await fetch(`/api/rekon/${row.rowNumber}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || "Gagal menghapus entri")
      }

      toast.success("Entri DataRekon dihapus")
      loadRows()
    } catch (error) {
      console.error(error)
      toast.error("Tidak dapat menghapus entri")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">DataRekon</h1>
          <p className="text-sm text-muted-foreground">
            Kelola entri DataRekon langsung dari Google Sheets (sheet DataRekon).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => loadRows(true)}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memuat
              </>
            ) : (
              <>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Entri
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Total Entri
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {summary.total}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Selesai
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-emerald-600">
            {summary.completed}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Menunggu Proses
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-amber-500">
            {summary.awaiting}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Entri</CardTitle>
          <CardDescription>
            {rows.length} entri DataRekon terhubung langsung dengan Google Sheets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead>Kapal</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Gudang</TableHead>
                  <TableHead>Petugas</TableHead>
                  <TableHead>Status Data</TableHead>
                  <TableHead>Status Siakang</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.rowNumber}>
                    <TableCell className="font-medium">
                      {row.rowNumber - 1}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">{row.vesselName || "-"}</div>
                      <p className="text-xs text-muted-foreground">
                        ID: {row.idRekon || "—"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div>{row.arrivalDate || "—"}</div>
                      <p className="text-xs text-muted-foreground">
                        {row.arrivalTime || "Tidak ada jam"}
                      </p>
                    </TableCell>
                    <TableCell>{row.gudang || "—"}</TableCell>
                    <TableCell>{row.petugas || "—"}</TableCell>
                    <TableCell>
                      <StatusBadge value={row.statusData} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={row.statusSiakang} />
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(row)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(row)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!rows.length && !loading && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-6">
                      Belum ada data DataRekon.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRow ? "Edit Entri DataRekon" : "Tambah Entri DataRekon"}
            </DialogTitle>
            <DialogDescription>
              Informasi akan disimpan langsung ke Google Sheets.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="vesselName">Nama Kapal</Label>
                <Input
                  id="vesselName"
                  required
                  value={formData.vesselName}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      vesselName: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="arrivalDate">Tanggal Kedatangan</Label>
                <Input
                  id="arrivalDate"
                  type="date"
                  required
                  value={formData.arrivalDate}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      arrivalDate: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="arrivalTime">Jam Kedatangan</Label>
                <Input
                  id="arrivalTime"
                  placeholder="08:30"
                  value={formData.arrivalTime}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      arrivalTime: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="skema">Skema</Label>
                <Input
                  id="skema"
                  value={formData.skema}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      skema: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="gudang">Gudang</Label>
                <Input
                  id="gudang"
                  value={formData.gudang}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      gudang: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="pengurus">Pengurus</Label>
                <Input
                  id="pengurus"
                  value={formData.pengurus}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      pengurus: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="petugas">Petugas</Label>
                <Input
                  id="petugas"
                  value={formData.petugas}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      petugas: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="volume">Volume (ton)</Label>
                <Input
                  id="volume"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.volume}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      volume: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="statusData">Status Data</Label>
                <Input
                  id="statusData"
                  value={formData.statusData}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      statusData: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="statusSiakang">Status Siakang</Label>
                <Input
                  id="statusSiakang"
                  value={formData.statusSiakang}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      statusSiakang: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="infoKedatangan">Catatan / Info Kedatangan</Label>
              <Textarea
                id="infoKedatangan"
                rows={3}
                value={formData.infoKedatangan}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    infoKedatangan: event.target.value,
                  }))
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false)
                  resetForm()
                }}
              >
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingRow ? "Simpan Perubahan" : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatusBadge({ value }: { value: string }) {
  if (!value) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Tidak ada data
      </Badge>
    )
  }

  const lower = value.toLowerCase()
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline"
  if (lower.includes("selesai") || lower.includes("sudah")) {
    variant = "default"
  } else if (lower.includes("pending") || lower.includes("proses")) {
    variant = "secondary"
  } else if (lower.includes("belum") || lower.includes("gagal")) {
    variant = "destructive"
  }

  return <Badge variant={variant}>{value}</Badge>
}

function parseDateForInput(value: string) {
  if (!value) return ""
  if (value.includes("-")) return value
  const parts = value.split("/")
  if (parts.length === 3) {
    const [day, month, year] = parts
    if (!day || !month || !year) return ""
    const normalizedYear =
      year.length === 2 ? `20${year}` : year.padStart(4, "0")
    return `${normalizedYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
  }
  return ""
}
