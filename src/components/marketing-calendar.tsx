
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react"

interface MarketingEvent {
  id: string
  title: string
  date: Date
  type: 'launch' | 'campaign' | 'content' | 'social'
  status: 'planned' | 'active' | 'completed'
}

const eventColors = {
  launch: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  campaign: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  content: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  social: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
}

// Sample marketing events for demonstration
const sampleEvents: MarketingEvent[] = [
  {
    id: '1',
    title: 'Product Hunt Launch',
    date: new Date(2024, 11, 25),
    type: 'launch',
    status: 'planned'
  },
  {
    id: '2',
    title: 'Social Media Campaign',
    date: new Date(2024, 11, 20),
    type: 'social',
    status: 'active'
  },
  {
    id: '3',
    title: 'Blog Post: "Building SaaS"',
    date: new Date(2024, 11, 22),
    type: 'content',
    status: 'planned'
  },
  {
    id: '4',
    title: 'Email Newsletter',
    date: new Date(2024, 11, 28),
    type: 'campaign',
    status: 'planned'
  }
]

export function MarketingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events] = useState<MarketingEvent[]>(sampleEvents)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getEventsForDate = (day: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.getDate() === day &&
             eventDate.getMonth() === currentMonth &&
             eventDate.getFullYear() === currentYear
    })
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Marketing Calendar</h2>
          <p className="text-muted-foreground">Plan and schedule your marketing activities</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {monthNames[currentMonth]} {currentYear}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {emptyDays.map(day => (
                <div key={`empty-${day}`} className="h-20 p-1"></div>
              ))}
              {daysArray.map(day => {
                const dayEvents = getEventsForDate(day)
                const isToday = new Date().getDate() === day &&
                               new Date().getMonth() === currentMonth &&
                               new Date().getFullYear() === currentYear

                return (
                  <div
                    key={day}
                    className={`h-20 p-1 border rounded-lg hover:bg-muted/50 transition-colors ${
                      isToday ? 'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800' : ''
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-purple-600' : ''}`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className={`text-xs px-1 py-0.5 rounded truncate ${eventColors[event.type]}`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {events
              .filter(event => event.date >= new Date())
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .slice(0, 5)
              .map(event => (
                <div key={event.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    <Badge className={eventColors[event.type]} variant="secondary">
                      {event.type}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{event.date.toLocaleDateString()}</span>
                    <Badge variant="outline" className="text-xs">
                      {event.status}
                    </Badge>
                  </div>
                </div>
              ))}
            {events.filter(event => event.date >= new Date()).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming events
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Types Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Event Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {Object.entries(eventColors).map(([type, colorClass]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${colorClass.split(' ')[0]}`}></div>
                <span className="text-sm capitalize">{type}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
