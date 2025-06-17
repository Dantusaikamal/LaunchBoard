
import { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Calendar as CalendarIcon, Target, Megaphone } from 'lucide-react'
import { format, isSameDay, addDays } from 'date-fns'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface MarketingEvent {
  id: string
  title: string
  description: string
  date: Date
  type: 'launch' | 'campaign' | 'content' | 'pr'
  status: 'planned' | 'in_progress' | 'completed'
  app_id?: string
}

export function FunctionalMarketingCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [events, setEvents] = useState<MarketingEvent[]>([])
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [editingEvent, setEditingEvent] = useState<MarketingEvent | null>(null)
  const [loading, setLoading] = useState(true)

  // Form state
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    type: 'campaign' as MarketingEvent['type'],
    status: 'planned' as MarketingEvent['status']
  })

  const fetchEvents = async () => {
    try {
      // For now, we'll use local storage since we don't have a marketing_events table
      const savedEvents = localStorage.getItem('marketing_events')
      if (savedEvents) {
        const parsedEvents = JSON.parse(savedEvents).map((event: any) => ({
          ...event,
          date: new Date(event.date)
        }))
        setEvents(parsedEvents)
      } else {
        // Create some sample events
        const sampleEvents: MarketingEvent[] = [
          {
            id: '1',
            title: 'Product Hunt Launch',
            description: 'Launch on Product Hunt for maximum visibility',
            date: addDays(new Date(), 3),
            type: 'launch',
            status: 'planned'
          },
          {
            id: '2',
            title: 'Twitter Campaign',
            description: 'Tweet series about app features',
            date: addDays(new Date(), 1),
            type: 'campaign',
            status: 'in_progress'
          },
          {
            id: '3',
            title: 'Blog Post: How We Built This',
            description: 'Technical blog post about development process',
            date: addDays(new Date(), 7),
            type: 'content',
            status: 'planned'
          }
        ]
        setEvents(sampleEvents)
        localStorage.setItem('marketing_events', JSON.stringify(sampleEvents))
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveEvents = (newEvents: MarketingEvent[]) => {
    localStorage.setItem('marketing_events', JSON.stringify(newEvents))
    setEvents(newEvents)
  }

  const handleCreateEvent = () => {
    if (!selectedDate || !eventForm.title.trim()) {
      toast.error('Please fill in required fields')
      return
    }

    const newEvent: MarketingEvent = {
      id: Date.now().toString(),
      ...eventForm,
      date: selectedDate
    }

    const updatedEvents = [...events, newEvent]
    saveEvents(updatedEvents)
    toast.success('Event created successfully!')
    
    setEventForm({
      title: '',
      description: '',
      type: 'campaign',
      status: 'planned'
    })
    setShowEventDialog(false)
  }

  const handleEditEvent = (event: MarketingEvent) => {
    setEditingEvent(event)
    setEventForm({
      title: event.title,
      description: event.description,
      type: event.type,
      status: event.status
    })
    setSelectedDate(event.date)
    setShowEventDialog(true)
  }

  const handleUpdateEvent = () => {
    if (!editingEvent || !selectedDate) return

    const updatedEvents = events.map(event =>
      event.id === editingEvent.id
        ? { ...event, ...eventForm, date: selectedDate }
        : event
    )
    
    saveEvents(updatedEvents)
    toast.success('Event updated successfully!')
    
    setEditingEvent(null)
    setEventForm({
      title: '',
      description: '',
      type: 'campaign',
      status: 'planned'
    })
    setShowEventDialog(false)
  }

  const getEventTypeColor = (type: MarketingEvent['type']) => {
    switch (type) {
      case 'launch': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'campaign': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'content': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pr': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getEventStatusColor = (status: MarketingEvent['status']) => {
    switch (status) {
      case 'planned': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const selectedDateEvents = selectedDate 
    ? events.filter(event => isSameDay(event.date, selectedDate))
    : []

  const eventDates = events.map(event => event.date)

  useEffect(() => {
    fetchEvents()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Marketing Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{
              hasEvent: eventDates
            }}
            modifiersStyles={{
              hasEvent: {
                backgroundColor: 'rgb(59 130 246 / 0.1)',
                color: 'rgb(59 130 246)',
                fontWeight: 'bold'
              }
            }}
            className="rounded-md border animate-fade-in"
          />
          
          <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
            <DialogTrigger asChild>
              <Button className="w-full mt-4 animate-scale-in" onClick={() => {
                setEditingEvent(null)
                setEventForm({
                  title: '',
                  description: '',
                  type: 'campaign',
                  status: 'planned'
                })
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Marketing Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingEvent ? 'Edit Marketing Event' : 'Create Marketing Event'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={eventForm.title}
                    onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Event title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Event description"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={eventForm.type}
                    onValueChange={(value) => setEventForm(prev => ({ ...prev, type: value as MarketingEvent['type'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="launch">Launch</SelectItem>
                      <SelectItem value="campaign">Campaign</SelectItem>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="pr">PR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={eventForm.status}
                    onValueChange={(value) => setEventForm(prev => ({ ...prev, status: value as MarketingEvent['status'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={editingEvent ? handleUpdateEvent : handleCreateEvent}
                  className="w-full"
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Events for Selected Date */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDateEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No events scheduled for this date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateEvents.map(event => (
                <div
                  key={event.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer animate-fade-in"
                  onClick={() => handleEditEvent(event)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{event.title}</h4>
                    <div className="flex gap-2">
                      <Badge className={getEventTypeColor(event.type)}>
                        {event.type}
                      </Badge>
                      <Badge className={getEventStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
