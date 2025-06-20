
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  Download, 
  FileText, 
  Image, 
  Code, 
  BookOpen,
  Lightbulb,
  Archive,
  Search,
  Calendar,
  Trash2
} from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { format } from "date-fns"

interface ArchiveItem {
  id: string
  app_id: string
  title: string
  content: string
  type: 'journal' | 'marketing' | 'asset' | 'changelog' | 'learning' | 'retro'
  tags: string[]
  file_url: string | null
  created_at: string
  updated_at: string
}

interface LaunchArchiveProps {
  appId: string
}

const archiveTypes = [
  { value: 'journal', label: 'Build Journal', icon: BookOpen, color: 'bg-blue-100 text-blue-800' },
  { value: 'marketing', label: 'Marketing Copy', icon: FileText, color: 'bg-green-100 text-green-800' },
  { value: 'asset', label: 'Assets', icon: Image, color: 'bg-purple-100 text-purple-800' },
  { value: 'changelog', label: 'Changelog', icon: Code, color: 'bg-orange-100 text-orange-800' },
  { value: 'learning', label: 'Learning', icon: Lightbulb, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'retro', label: 'Retrospective', icon: Archive, color: 'bg-red-100 text-red-800' },
]

export function LaunchArchive({ appId }: LaunchArchiveProps) {
  const [items, setItems] = useState<ArchiveItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'journal' as const,
    tags: '',
    file_url: ''
  })

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('archive_items')
        .select('*')
        .eq('app_id', appId)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const typedItems: ArchiveItem[] = (data || []).map(item => ({
        ...item,
        type: item.type as 'journal' | 'marketing' | 'asset' | 'changelog' | 'learning' | 'retro',
        tags: Array.isArray(item.tags) ? item.tags : []
      }))
      
      setItems(typedItems)
    } catch (error) {
      console.error('Error fetching archive items:', error)
      toast.error('Failed to load archive items')
    } finally {
      setLoading(false)
    }
  }

  const createItem = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in title and content')
      return
    }

    try {
      const { data, error } = await supabase
        .from('archive_items')
        .insert([{
          app_id: appId,
          title: formData.title,
          content: formData.content,
          type: formData.type,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          file_url: formData.file_url || null
        }])
        .select()
        .single()

      if (error) throw error

      const newItem: ArchiveItem = {
        ...data,
        type: data.type as 'journal' | 'marketing' | 'asset' | 'changelog' | 'learning' | 'retro',
        tags: Array.isArray(data.tags) ? data.tags : []
      }

      setItems(prev => [newItem, ...prev])
      setShowDialog(false)
      setFormData({
        title: '',
        content: '',
        type: 'journal',
        tags: '',
        file_url: ''
      })
      toast.success('Archive item created successfully!')
    } catch (error) {
      console.error('Error creating archive item:', error)
      toast.error('Failed to create archive item')
    }
  }

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('archive_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      setItems(prev => prev.filter(item => item.id !== itemId))
      toast.success('Archive item deleted successfully!')
    } catch (error) {
      console.error('Error deleting archive item:', error)
      toast.error('Failed to delete archive item')
    }
  }

  const exportArchive = async () => {
    try {
      const exportData = {
        app_id: appId,
        exported_at: new Date().toISOString(),
        items: items.map(item => ({
          title: item.title,
          content: item.content,
          type: item.type,
          tags: item.tags,
          created_at: item.created_at
        }))
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `launch-archive-${appId}-${format(new Date(), 'yyyy-MM-dd')}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Archive exported successfully!')
    } catch (error) {
      console.error('Error exporting archive:', error)
      toast.error('Failed to export archive')
    }
  }

  useEffect(() => {
    fetchItems()
  }, [appId])

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = typeFilter === "all" || item.type === typeFilter
    return matchesSearch && matchesType
  })

  const getTypeInfo = (type: string) => {
    return archiveTypes.find(t => t.value === type) || archiveTypes[0]
  }

  if (loading) {
    return <div className="animate-pulse bg-card rounded-lg p-6 h-64"></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Launch Archive
          </h3>
          <p className="text-sm text-muted-foreground">Your second brain for this project's journey</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={exportArchive}
            disabled={items.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Archive
          </Button>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Archive Item</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Item title..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {archiveTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center">
                              <type.icon className="h-4 w-4 mr-2" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      placeholder="launch, feature, bug-fix"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file_url">File URL (Optional)</Label>
                  <Input
                    id="file_url"
                    value={formData.file_url}
                    onChange={(e) => setFormData({...formData, file_url: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Describe this archive item..."
                    rows={6}
                  />
                </div>
                <Button onClick={createItem} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                  Create Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search archive..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {archiveTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Archive Grid */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Archive className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="text-lg font-semibold mb-2">No archive items found</h4>
            <p className="text-muted-foreground text-center">
              {searchTerm || typeFilter !== "all" 
                ? "Try adjusting your search or filters" 
                : "Start building your launch archive with journals, learnings, and assets"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map(item => {
            const typeInfo = getTypeInfo(item.type)
            const TypeIcon = typeInfo.icon
            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <TypeIcon className="h-4 w-4" />
                      <Badge className={typeInfo.color} variant="secondary">
                        {typeInfo.label}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteItem(item.id)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <CardTitle className="text-base line-clamp-2">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {item.content}
                  </p>
                  
                  {item.file_url && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(item.file_url!, '_blank')}
                        className="text-xs"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        View File
                      </Button>
                    </div>
                  )}
                  
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{item.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(item.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
