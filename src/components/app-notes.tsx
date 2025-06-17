import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, FileText, Lightbulb, Bug, MessageSquare, Trash2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface Note {
  id: string
  type: 'log' | 'insight' | 'bug' | 'idea'
  title: string | null
  content: string
  created_at: string
}

interface AppNotesProps {
  appId: string
}

const noteTypes = [
  { value: 'log', label: 'Log', icon: FileText },
  { value: 'insight', label: 'Insight', icon: Lightbulb },
  { value: 'bug', label: 'Bug', icon: Bug },
  { value: 'idea', label: 'Idea', icon: Lightbulb }
]

const typeColors = {
  log: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  insight: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  bug: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  idea: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
}

export function AppNotes({ appId }: AppNotesProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')
  const [newNote, setNewNote] = useState({
    type: 'log' as Note['type'],
    title: '',
    content: ''
  })

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('app_id', appId)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Type cast the data to match our Note interface
      const typedNotes = data?.map(note => ({
        ...note,
        type: note.type as Note['type']
      })) || []
      
      setNotes(typedNotes)
    } catch (error) {
      console.error('Error fetching notes:', error)
      toast.error('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  const createNote = async () => {
    if (!newNote.content.trim()) return

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          app_id: appId,
          type: newNote.type,
          title: newNote.title || null,
          content: newNote.content
        }])
        .select()
        .single()

      if (error) throw error

      // Type cast the returned data
      const typedNote = {
        ...data,
        type: data.type as Note['type']
      }

      setNotes(prev => [typedNote, ...prev])
      setNewNote({
        type: 'log',
        title: '',
        content: ''
      })
      setShowCreateDialog(false)
      toast.success('Note created successfully!')
    } catch (error) {
      console.error('Error creating note:', error)
      toast.error('Failed to create note')
    }
  }

  const deleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

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

  useEffect(() => {
    fetchNotes()
  }, [appId])

  const filteredNotes = filterType === 'all' 
    ? notes 
    : notes.filter(note => note.type === filterType)

  const noteCounts = {
    all: notes.length,
    log: notes.filter(n => n.type === 'log').length,
    insight: notes.filter(n => n.type === 'insight').length,
    bug: notes.filter(n => n.type === 'bug').length,
    idea: notes.filter(n => n.type === 'idea').length
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-card rounded-lg p-6 h-32"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Notes & Documentation</h2>
          <p className="text-muted-foreground">Keep track of important information about your app</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newNote.type} onValueChange={(value: Note['type']) => setNewNote({ ...newNote, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {noteTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  placeholder="Note title..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Write your note here..."
                  rows={6}
                />
              </div>
              <div className="flex space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={createNote} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Create Note
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filterType === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('all')}
          className={filterType === 'all' ? 'bg-purple-600 hover:bg-purple-700' : ''}
        >
          All ({noteCounts.all})
        </Button>
        {noteTypes.map((type) => (
          <Button
            key={type.value}
            variant={filterType === type.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType(type.value)}
            className={filterType === type.value ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            <type.icon className="h-4 w-4 mr-1" />
            {type.label} ({noteCounts[type.value as keyof typeof noteCounts]})
          </Button>
        ))}
      </div>

      {/* Notes List */}
      {filteredNotes.length > 0 ? (
        <div className="space-y-4">
          {filteredNotes.map((note) => {
            const TypeIcon = noteTypes.find(t => t.value === note.type)?.icon || FileText
            return (
              <Card key={note.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <TypeIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        {note.title && (
                          <CardTitle className="text-lg">{note.title}</CardTitle>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={typeColors[note.type]} variant="secondary">
                            {note.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(note.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNote(note.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {note.content}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No notes yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              {filterType === 'all'
                ? "Start documenting your app's journey by creating your first note."
                : `No ${filterType} notes found. Try a different filter or create a new note.`}
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-purple-600 hover:bg-purple-700">
              Create First Note
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
