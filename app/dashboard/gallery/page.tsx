'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Plus, Edit, Trash2, Image as ImageIcon, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { getMediaItems, createMediaItem, updateMediaItem, deleteMediaItem } from '@/lib/actions/media'
import type { MediaItem } from '@/lib/actions/media'

export default function GalleryPage() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file_url: '',
    alt_text: '',
    is_active: true,
    sort_order: 0
  })

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      const data = await getMediaItems('gallery')
      setItems(data)
    } catch (error) {
      toast.error('Failed to load gallery items')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      file_url: '',
      alt_text: '',
      is_active: true,
      sort_order: 0
    })
    setEditingItem(null)
    setPreviewUrl(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const itemData = {
        ...formData,
        type: 'gallery' as const,
        category_id: null
      }

      if (editingItem) {
        await updateMediaItem(editingItem.id!, itemData)
        toast.success('Gallery item updated successfully')
      } else {
        await createMediaItem(itemData)
        toast.success('Gallery item created successfully')
      }

      setDialogOpen(false)
      resetForm()
      loadItems()
    } catch (error) {
      toast.error('Failed to save gallery item')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (item: MediaItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description || '',
      file_url: item.file_url,
      alt_text: item.alt_text || '',
      is_active: item.is_active ?? true,
      sort_order: item.sort_order ?? 0
    })
    setPreviewUrl(item.file_url)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gallery item?')) return

    try {
      await deleteMediaItem(id)
      toast.success('Gallery item deleted successfully')
      loadItems()
    } catch (error) {
      toast.error('Failed to delete gallery item')
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateMediaItem(id, { is_active: isActive })
      toast.success(`Gallery item ${isActive ? 'activated' : 'deactivated'}`)
      loadItems()
    } catch (error) {
      toast.error('Failed to update gallery item')
    }
  }

  const handleUrlChange = (url: string) => {
    setFormData({ ...formData, file_url: url })
    setPreviewUrl(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gallery Management</h1>
          <p className="text-muted-foreground">
            Manage photo gallery images
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Gallery Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Gallery Item' : 'Add New Gallery Item'}
              </DialogTitle>
              <DialogDescription>
                {editingItem
                  ? 'Update the gallery item details below.'
                  : 'Add a new image to the photo gallery.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="file_url">Image URL</Label>
                  <Input
                    id="file_url"
                    type="url"
                    value={formData.file_url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>
                {previewUrl && (
                  <div>
                    <Label>Preview</Label>
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                        onError={() => setPreviewUrl(null)}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <Label htmlFor="alt_text">Alt Text</Label>
                  <Input
                    id="alt_text"
                    value={formData.alt_text}
                    onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                    placeholder="Description for screen readers"
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingItem ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-48">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No gallery items found. Create your first gallery item to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Gallery Items ({items.length})</CardTitle>
              <CardDescription>
                These images will appear in the public photo gallery. Active items are visible to visitors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map((item) => (
                  <div key={item.id} className="border rounded-lg overflow-hidden group">
                    <div className="aspect-square bg-gray-100 relative">
                      {item.file_url ? (
                        <img
                          src={item.file_url}
                          alt={item.alt_text || item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = ''
                            e.currentTarget.className = 'w-full h-full object-cover flex items-center justify-center bg-gray-200'
                            e.currentTarget.innerHTML = '<div class="text-gray-400"><svg class="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge variant={item.is_active ? 'default' : 'secondary'}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium truncate">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <Switch
                          checked={item.is_active ?? false}
                          onCheckedChange={(checked) => handleToggleActive(item.id!, checked)}
                        />
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(item.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}