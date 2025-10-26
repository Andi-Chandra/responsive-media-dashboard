import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Images, Video, Users, BarChart3 } from 'lucide-react'
import { getMediaItems } from '@/lib/actions/media'
import { getUsers } from '@/lib/actions/users'

async function DashboardStats() {
  try {
    const [sliderItems, galleryItems, videoItems, users] = await Promise.all([
      getMediaItems('slider'),
      getMediaItems('gallery'),
      getMediaItems('video'),
      getUsers()
    ])

    const activeSliderItems = sliderItems.filter(item => item.is_active).length
    const activeGalleryItems = galleryItems.filter(item => item.is_active).length
    const activeVideoItems = videoItems.filter(item => item.is_active).length
    const adminUsers = users.filter(user => user.role === 'admin').length

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Slider Items</CardTitle>
            <Images className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSliderItems}</div>
            <p className="text-xs text-muted-foreground">
              {sliderItems.length - activeSliderItems} inactive
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gallery Items</CardTitle>
            <Images className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeGalleryItems}</div>
            <p className="text-xs text-muted-foreground">
              {galleryItems.length - activeGalleryItems} inactive
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeVideoItems}</div>
            <p className="text-xs text-muted-foreground">
              {videoItems.length - activeVideoItems} inactive
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {adminUsers} administrators
            </p>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Error loading dashboard stats</p>
        </CardContent>
      </Card>
    )
  }
}

async function RecentActivity() {
  try {
    const [sliderItems, galleryItems, videoItems] = await Promise.all([
      getMediaItems('slider'),
      getMediaItems('gallery'),
      getMediaItems('video')
    ])

    const allItems = [
      ...sliderItems.map(item => ({ ...item, mediaType: 'Slider' as const })),
      ...galleryItems.map(item => ({ ...item, mediaType: 'Gallery' as const })),
      ...videoItems.map(item => ({ ...item, mediaType: 'Video' as const }))
    ]

    const recentItems = allItems
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest media items added to the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No recent activity
            </p>
          ) : (
            <div className="space-y-4">
              {recentItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                      {item.type === 'video' ? (
                        <Video className="h-4 w-4 text-gray-600" />
                      ) : (
                        <Images className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.mediaType} • {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={item.is_active ? 'default' : 'secondary'}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  } catch (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Error loading recent activity</p>
        </CardContent>
      </Card>
    )
  }
}

export default function Page() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the media management dashboard
          </p>
        </div>

        <Suspense fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="flex items-center justify-center h-24">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </CardContent>
              </Card>
            ))}
          </div>
        }>
          <DashboardStats />
        </Suspense>

        <Suspense fallback={
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
            </CardContent>
          </Card>
        }>
          <RecentActivity />
        </Suspense>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you might want to perform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <a
                href="/dashboard/slider"
                className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Images className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Manage Slider</p>
                  <p className="text-sm text-muted-foreground">Homepage images</p>
                </div>
              </a>
              <a
                href="/dashboard/gallery"
                className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Images className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Manage Gallery</p>
                  <p className="text-sm text-muted-foreground">Photo collection</p>
                </div>
              </a>
              <a
                href="/dashboard/videos"
                className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Video className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium">Manage Videos</p>
                  <p className="text-sm text-muted-foreground">Video content</p>
                </div>
              </a>
              <a
                href="/dashboard/users"
                className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Manage Users</p>
                  <p className="text-sm text-muted-foreground">User accounts</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}