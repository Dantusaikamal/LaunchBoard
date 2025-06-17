import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter, StickyNote, Lightbulb, Bug, Code, Trash2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { format } from "date-fns"

interface Note {
  id: string
  app_id: string
  title: string
  content: string
  type: 'idea' | 'log' | 'insight' | 'bug' | 'feature' | 'feedback'
  tags: string[]
  priority: 'low' | 'medium' | 'high'
  status: 'active' | 'resolved' | 'archived'
  created_at: string
}

interface AdvancedNotesProps {
  appId: string
  appName: string
}

const noteTypes = [
  { value: 'idea', label: 'Idea', icon: Lightbulb, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'log', label: 'Log', icon: StickyNote, color: 'bg-blue-100 text-blue-800' },
  { value: 'insight', label: 'Insight', icon: Lightbulb, color: 'bg-purple-100 text-purple-800' },
  { value: 'bug', label: 'Bug', icon: Bug, color: 'bg-red-100 text-red-800' },
  { value: 'feature', label: 'Feature', icon: Code, color: 'bg-green-100 text-green-800' },
  { value: 'feedback', label: 'Feedback', icon: StickyNote, color: 'bg-orange-100 text-orange-800' },
]

export function AdvancedNotes({ appId, appName }: AdvancedNotesProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'log' as const,
    tags: '',
    priority: 'medium' as const,
    status: 'active' as const
  })

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('app_id', appId)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const typedNotes: Note[] = (data || []).map(note => ({
        ...note,
        type: note.type as 'idea' | 'log' | 'insight' | 'bug' | 'feature' | 'feedback',
        tags: Array.isArray(note.tags) ? note.tags : [],
        priority: (note.priority as 'low' | 'medium' | 'high') || 'medium',
        status: (note.status as 'active' | 'resolved' | 'archived') || 'active'
      }))
      
      setNotes(typedNotes)
    } catch (error) {
      console.error('Error fetching notes:', error)
      toast.error('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  const createNote = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in title and content')
      return
    }

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          app_id: appId,
          title: formData.title,
          content: formData.content,
          type: formData.type,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          priority: formData.priority,
          status: formData.status
        }])
        .select()
        .single()

      if (error) throw error

      const newNote: Note = {
        ...data,
        type: data.type as 'idea' | 'log' | 'insight' | 'bug' | 'feature' | 'feedback',
        tags: Array.isArray(data.tags) ? data.tags : [],
        priority: (data.priority as 'low' | 'medium' | 'high') || 'medium',
        status: (data.status as 'active' | 'resolved' | 'archived') || 'active'
      }

      setNotes(prev => [newNote, ...prev])
      setShowDialog(false)
      setFormData({
        title: '',
        content: '',
        type: 'log',
        tags: '',
        priority: 'medium',
        status: 'active'
      })
      toast.success('Note created successfully!')
    } catch (error) {
      console.error('Error creating note:', error)
      toast.error('Failed to create note')
    }
  }

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)

      if (error) throw error

      setNotes(prev => prev.filter(note => note.id !== noteId))
      toast.success('Note deleted successfully!')
    } catch (error) {
      console.error('Error deleting note:', error)
      toast.error('Failed to delete note')
    }
  }

  const updateNoteStatus = async (noteId: string, status: 'active' | 'resolved' | 'archived') => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ status })
        .eq('id', noteId)

      if (error) throw error

      setNotes(prev => prev.map(note => 
        note.id === noteId ? { ...note, status } : note
      ))
      toast.success('Note status updated!')
    } catch (error) {
      console.error('Error updating note:', error)
      toast.error('Failed to update note')
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [appId])

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = typeFilter === "all" || note.type === typeFilter
    const matchesStatus = statusFilter === "all" || note.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const getTypeInfo = (type: string) => {
    return noteTypes.find(t => t.value === type) || noteTypes[0]
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  if (loading) {
    return <div className="animate-pulse bg-card rounded-lg p-6 h-64"></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Notes & Ideas</h3>
          <p className="text-sm text-muted-foreground">Track thoughts, bugs, and insights for {appName}</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Note</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Note title..."
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
                      {noteTypes.map(type => (
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
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData({...formData, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  placeholder="ui, bug, enhancement"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Describe your note in detail..."
                  rows={6}
                />
              </div>
              <Button onClick={createNote} className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                Create Note
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {noteTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <StickyNote className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="text-lg font-semibold mb-2">No notes found</h4>
            <p className="text-muted-foreground text-center">
              {searchTerm || typeFilter !== "all" || statusFilter !== "all" 
                ? "Try adjusting your search or filters" 
                : "Create your first note to start tracking ideas and insights"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map(note => {
            const typeInfo = getTypeInfo(note.type)
            const TypeIcon = typeInfo.icon
            return (
              <Card key={note.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <TypeIcon className="h-4 w-4" />
                      <Badge className={typeInfo.color} variant="secondary">
                        {typeInfo.label}
                      </Badge>
                      <Badge className={getPriorityColor(note.priority)} variant="secondary">
                        {note.priority}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNote(note.id)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <CardTitle className="text-base line-clamp-2">{note.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {note.content}
                  </p>
                  
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{note.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(note.created_at), "MMM d, yyyy")}
                    </span>
                    <Select value={note.status} onValueChange={(value: any) => updateNoteStatus(note.id, value)}>
                      <SelectTrigger className="w-24 h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
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
