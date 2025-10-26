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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Plus, Edit, Trash2, Image as ImageIcon, MoveUp, MoveDown } from 'lucide-react'
import { toast } from 'sonner'
import { getMediaItems, createMediaItem, updateMediaItem, deleteMediaItem, updateMediaSortOrder } from '@/lib/actions/media'
import type { MediaItem } from '@/lib/actions/media'

export default function SliderPage() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null)
  const [submitting, setSubmitting] = useState(false)
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
      const data = await getMediaItems('slider')
      setItems(data)
    } catch (error) {
      toast.error('Failed to load slider items')
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
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const itemData = {
        ...formData,
        type: 'slider' as const,
        category_id: null
      }

      if (editingItem) {
        await updateMediaItem(editingItem.id!, itemData)
        toast.success('Slider item updated successfully')
      } else {
        await createMediaItem(itemData)
        toast.success('Slider item created successfully')
      }

      setDialogOpen(false)
      resetForm()
      loadItems()
    } catch (error) {
      toast.error('Failed to save slider item')
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
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slider item?')) return

    try {
      await deleteMediaItem(id)
      toast.success('Slider item deleted successfully')
      loadItems()
    } catch (error) {
      toast.error('Failed to delete slider item')
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateMediaItem(id, { is_active: isActive })
      toast.success(`Slider item ${isActive ? 'activated' : 'deactivated'}`)
      loadItems()
    } catch (error) {
      toast.error('Failed to update slider item')
    }
  }

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    const newItems = [...items]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= newItems.length) return

    // Swap items
    ;[newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]]

    // Update sort orders
    const updatedItems = newItems.map((item, idx) => ({
      id: item.id!,
      sort_order: idx
    }))

    try {
      await updateMediaSortOrder(updatedItems)
      setItems(newItems)
    } catch (error) {
      toast.error('Failed to reorder items')
    }
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
          <h1 className="text-3xl font-bold">Slider Management</h1>
          <p className="text-muted-foreground">
            Manage homepage slider images
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Slider Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Slider Item' : 'Add New Slider Item'}
              </DialogTitle>
              <DialogDescription>
                {editingItem
                  ? 'Update the slider item details below.'
                  : 'Add a new image to the homepage slider.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
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
                    onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="alt_text">Alt Text</Label>
                  <Input
                    id="alt_text"
                    value={formData.alt_text}
                    onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                    placeholder="Description for screen readers"
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
              No slider items found. Create your first slider item to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Slider Items ({items.length})</CardTitle>
            <CardDescription>
              These images will appear on the homepage slider. Active items are visible to the public.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="w-16 h-10 bg-gray-100 rounded flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.is_active ? 'default' : 'secondary'}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveItem(index, 'up')}
                          disabled={index === 0}
                        >
                          <MoveUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveItem(index, 'down')}
                          disabled={index === items.length - 1}
                        >
                          <MoveDown className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground ml-2">
                          {index + 1}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Switch
                          checked={item.is_active ?? false}
                          onCheckedChange={(checked) => handleToggleActive(item.id!, checked)}
                        />
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}