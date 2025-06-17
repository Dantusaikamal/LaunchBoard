
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, Rocket, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { App } from "@/hooks/useApps"

interface Launch {
  id: string
  app_id: string
  launch_date: string | null
  channels: string[]
  completed: boolean
  assets: Record<string, any>
  created_at: string
}

const launchChannels = [
  { id: 'product-hunt', name: 'Product Hunt', url: 'https://producthunt.com' },
  { id: 'indie-hackers', name: 'Indie Hackers', url: 'https://indiehackers.com' },
  { id: 'reddit', name: 'Reddit', url: 'https://reddit.com' },
  { id: 'twitter', name: 'Twitter/X', url: 'https://twitter.com' },
  { id: 'linkedin', name: 'LinkedIn', url: 'https://linkedin.com' },
  { id: 'gumroad', name: 'Gumroad', url: 'https://gumroad.com' },
  { id: 'dev-to', name: 'Dev.to', url: 'https://dev.to' },
  { id: 'hacker-news', name: 'Hacker News', url: 'https://news.ycombinator.com' }
]

const launchChecklist = [
  'Meta tags added',
  'Analytics enabled',
  'Signup flow tested',
  'Payment system working',
  'Mobile responsive',
  'SEO optimized',
  'Loading performance tested',
  'Error handling implemented'
]

interface LaunchTrackerProps {
  apps: App[]
}

export function LaunchTracker({ apps }: LaunchTrackerProps) {
  const [launches, setLaunches] = useState<Launch[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})

  const fetchLaunches = async () => {
    try {
      const { data, error } = await supabase
        .from('launches')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Cast the data to match our Launch interface
      const typedLaunches: Launch[] = (data || []).map(launch => ({
        ...launch,
        assets: (launch.assets as Record<string, any>) || {},
        channels: launch.channels || []
      }))
      
      setLaunches(typedLaunches)
    } catch (error) {
      console.error('Error fetching launches:', error)
      toast.error('Failed to load launches')
    } finally {
      setLoading(false)
    }
  }

  const createLaunch = async () => {
    if (!selectedApp || !selectedDate) {
      toast.error('Please select an app and launch date')
      return
    }

    try {
      const { data, error } = await supabase
        .from('launches')
        .insert([{
          app_id: selectedApp,
          launch_date: selectedDate.toISOString().split('T')[0],
          channels: selectedChannels,
          completed: false,
          assets: { checklist }
        }])
        .select()
        .single()

      if (error) throw error

      // Cast the returned data to match our Launch interface
      const newLaunch: Launch = {
        ...data,
        assets: (data.assets as Record<string, any>) || {},
        channels: data.channels || []
      }

      setLaunches(prev => [newLaunch, ...prev])
      setSelectedApp('')
      setSelectedDate(undefined)
      setSelectedChannels([])
      setChecklist({})
      toast.success('Launch plan created!')
    } catch (error) {
      console.error('Error creating launch:', error)
      toast.error('Failed to create launch plan')
    }
  }

  const toggleLaunchComplete = async (launch: Launch) => {
    try {
      const { error } = await supabase
        .from('launches')
        .update({ completed: !launch.completed })
        .eq('id', launch.id)

      if (error) throw error

      setLaunches(prev => prev.map(l => 
        l.id === launch.id ? { ...l, completed: !l.completed } : l
      ))
      toast.success(`Launch marked as ${launch.completed ? 'incomplete' : 'complete'}`)
    } catch (error) {
      console.error('Error updating launch:', error)
      toast.error('Failed to update launch')
    }
  }

  useEffect(() => {
    fetchLaunches()
  }, [])

  if (loading) {
    return <div className="animate-pulse bg-card rounded-lg p-6 h-64"></div>
  }

  const getAppName = (appId: string) => {
    const app = apps.find(a => a.id === appId)
    return app?.name || 'Unknown App'
  }

  return (
    <div className="space-y-6">
      {/* Create New Launch */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Plan New Launch
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select App</label>
              <select
                value={selectedApp}
                onChange={(e) => setSelectedApp(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Choose an app...</option>
                {apps.map(app => (
                  <option key={app.id} value={app.id}>{app.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Launch Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Launch Channels</label>
            <div className="grid gap-2 md:grid-cols-2">
              {launchChannels.map(channel => (
                <div key={channel.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={channel.id}
                    checked={selectedChannels.includes(channel.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedChannels(prev => [...prev, channel.id])
                      } else {
                        setSelectedChannels(prev => prev.filter(c => c !== channel.id))
                      }
                    }}
                  />
                  <label htmlFor={channel.id} className="text-sm">{channel.name}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Pre-launch Checklist</label>
            <div className="grid gap-2 md:grid-cols-2">
              {launchChecklist.map(item => (
                <div key={item} className="flex items-center space-x-2">
                  <Checkbox
                    id={item}
                    checked={checklist[item] || false}
                    onCheckedChange={(checked) => {
                      setChecklist(prev => ({ ...prev, [item]: checked as boolean }))
                    }}
                  />
                  <label htmlFor={item} className="text-sm">{item}</label>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={createLaunch} className="w-full bg-purple-600 hover:bg-purple-700">
            Create Launch Plan
          </Button>
        </CardContent>
      </Card>

      {/* Existing Launches */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Launch Plans</h3>
        {launches.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Rocket className="h-12 w-12 text-muted-foreground mb-4" />
              <h4 className="text-lg font-semibold mb-2">No launches planned</h4>
              <p className="text-muted-foreground text-center">
                Create your first launch plan to track your app's go-to-market strategy.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {launches.map(launch => (
              <Card key={launch.id} className={launch.completed ? 'border-green-200 bg-green-50 dark:bg-green-950' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{getAppName(launch.app_id)}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {launch.launch_date ? format(new Date(launch.launch_date), "PPP") : 'No date set'}
                      </p>
                    </div>
                    <Badge variant={launch.completed ? 'default' : 'secondary'}>
                      {launch.completed ? 'Launched' : 'Planned'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2">Channels:</p>
                    <div className="flex flex-wrap gap-1">
                      {launch.channels.map(channelId => {
                        const channel = launchChannels.find(c => c.id === channelId)
                        return channel ? (
                          <Badge key={channelId} variant="outline" className="text-xs">
                            {channel.name}
                          </Badge>
                        ) : null
                      })}
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleLaunchComplete(launch)}
                    variant={launch.completed ? 'outline' : 'default'}
                    className="w-full"
                  >
                    {launch.completed ? 'Mark as Incomplete' : 'Mark as Launched'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
