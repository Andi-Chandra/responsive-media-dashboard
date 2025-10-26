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
import { Loader2, Plus, Edit, Trash2, Video, Play, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { getMediaItems, createMediaItem, updateMediaItem, deleteMediaItem } from '@/lib/actions/media'
import type { MediaItem } from '@/lib/actions/media'

export default function VideosPage() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    video_duration: 0,
    alt_text: '',
    is_active: true,
    sort_order: 0
  })

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      const data = await getMediaItems('video')
      setItems(data)
    } catch (error) {
      toast.error('Failed to load video items')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      video_url: '',
      thumbnail_url: '',
      video_duration: 0,
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
        type: 'video' as const,
        category_id: null,
        file_url: formData.thumbnail_url || formData.video_url
      }

      if (editingItem) {
        await updateMediaItem(editingItem.id!, itemData)
        toast.success('Video item updated successfully')
      } else {
        await createMediaItem(itemData)
        toast.success('Video item created successfully')
      }

      setDialogOpen(false)
      resetForm()
      loadItems()
    } catch (error) {
      toast.error('Failed to save video item')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (item: MediaItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description || '',
      video_url: item.video_url || '',
      thumbnail_url: item.thumbnail_url || '',
      video_duration: item.video_duration || 0,
      alt_text: item.alt_text || '',
      is_active: item.is_active ?? true,
      sort_order: item.sort_order ?? 0
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video item?')) return

    try {
      await deleteMediaItem(id)
      toast.success('Video item deleted successfully')
      loadItems()
    } catch (error) {
      toast.error('Failed to delete video item')
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateMediaItem(id, { is_active: isActive })
      toast.success(`Video item ${isActive ? 'activated' : 'deactivated'}`)
      loadItems()
    } catch (error) {
      toast.error('Failed to update video item')
    }
  }

  const formatDuration = (seconds: number) => {
    if (!seconds) return 'Unknown'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getVideoEmbedUrl = (url: string) => {
    // Handle YouTube URLs
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`
    }

    // Handle Vimeo URLs
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`
    }

    // Return original URL if no pattern matches
    return url
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
          <h1 className="text-3xl font-bold">Video Management</h1>
          <p className="text-muted-foreground">
            Manage video content for the video gallery
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Video' : 'Add New Video'}
              </DialogTitle>
              <DialogDescription>
                {editingItem
                  ? 'Update the video details below.'
                  : 'Add a new video to the video gallery.'
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
                  <Label htmlFor="video_url">Video URL</Label>
                  <Input
                    id="video_url"
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Supports YouTube and Vimeo URLs
                  </p>
                </div>
                <div>
                  <Label htmlFor="thumbnail_url">Thumbnail URL (optional)</Label>
                  <Input
                    id="thumbnail_url"
                    type="url"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="video_duration">Duration (seconds)</Label>
                    <Input
                      id="video_duration"
                      type="number"
                      value={formData.video_duration}
                      onChange={(e) => setFormData({ ...formData, video_duration: parseInt(e.target.value) || 0 })}
                      placeholder="120"
                    />
                  </div>
                  <div>
                    <Label htmlFor="alt_text">Alt Text</Label>
                    <Input
                      id="alt_text"
                      value={formData.alt_text}
                      onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                      placeholder="Description for accessibility"
                    />
                  </div>
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
            <Video className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No videos found. Add your first video to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Video Gallery ({items.length})</CardTitle>
            <CardDescription>
              These videos will appear in the public video gallery. Active items are visible to visitors.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div key={item.id} className="border rounded-lg overflow-hidden group">
                  <div className="aspect-video bg-gray-100 relative">
                    {item.thumbnail_url ? (
                      <img
                        src={item.thumbnail_url}
                        alt={item.alt_text || item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <Video className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-2">
                        {item.video_url && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => window.open(item.video_url, '_blank')}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Play
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant={item.is_active ? 'default' : 'secondary'}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {item.video_duration > 0 && (
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="secondary">
                          {formatDuration(item.video_duration)}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium truncate mb-1">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={item.is_active ?? false}
                          onCheckedChange={(checked) => handleToggleActive(item.id!, checked)}
                        />
                        <span className="text-sm text-muted-foreground">Active</span>
                      </div>
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
      )}
    </div>
  )
}