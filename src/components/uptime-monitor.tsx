
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { 
  Globe,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  RefreshCw,
  Zap
} from "lucide-react"

const monitorSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
  name: z.string().min(1, 'Name is required'),
  interval: z.enum(['1', '5', '15', '30', '60']),
  timeout: z.number().min(1).max(30).default(10)
})

type MonitorData = z.infer<typeof monitorSchema> & {
  id: string
  status: 'up' | 'down' | 'checking'
  uptime: number
  responseTime: number
  lastCheck: string
  sslExpiry?: string
  sslValid: boolean
}

interface UptimeMonitorProps {
  appId: string
}

export function UptimeMonitor({ appId }: UptimeMonitorProps) {
  const [monitors, setMonitors] = useState<MonitorData[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [checking, setChecking] = useState<string | null>(null)

  const form = useForm<MonitorData>({
    resolver: zodResolver(monitorSchema),
    defaultValues: {
      name: '',
      url: '',
      interval: '5',
      timeout: 10
    }
  })

  useEffect(() => {
    loadMonitors()
    const interval = setInterval(checkAllMonitors, 5 * 60 * 1000) // Check every 5 minutes
    return () => clearInterval(interval)
  }, [appId])

  const loadMonitors = async () => {
    try {
      const stored = localStorage.getItem(`monitors-${appId}`)
      if (stored) {
        setMonitors(JSON.parse(stored))
      }
      setLoading(false)
    } catch (error) {
      console.error('Error loading monitors:', error)
      toast.error('Failed to load monitors')
      setLoading(false)
    }
  }

  const checkAllMonitors = async () => {
    for (const monitor of monitors) {
      await checkMonitor(monitor.id)
    }
  }

  const checkMonitor = async (monitorId: string) => {
    const monitor = monitors.find(m => m.id === monitorId)
    if (!monitor) return

    setChecking(monitorId)
    
    try {
      const startTime = Date.now()
      
      // Simulate API check (in real app, this would hit your backend)
      const response = await fetch(`https://httpbin.org/delay/1`, {
        method: 'GET',
        mode: 'cors',
        signal: AbortSignal.timeout(monitor.timeout * 1000)
      })
      
      const responseTime = Date.now() - startTime
      const isUp = response.ok
      
      // Simulate SSL check
      const sslValid = Math.random() > 0.1 // 90% chance SSL is valid
      const sslExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      
      const updatedMonitor = {
        ...monitor,
        status: isUp ? 'up' : 'down',
        responseTime,
        lastCheck: new Date().toISOString(),
        sslValid,
        sslExpiry,
        uptime: isUp ? Math.min(monitor.uptime + 0.1, 100) : Math.max(monitor.uptime - 1, 0)
      } as MonitorData

      const updatedMonitors = monitors.map(m => 
        m.id === monitorId ? updatedMonitor : m
      )
      
      setMonitors(updatedMonitors)
      localStorage.setItem(`monitors-${appId}`, JSON.stringify(updatedMonitors))
      
      if (!isUp) {
        toast.error(`${monitor.name} is down!`)
      }
      
    } catch (error) {
      console.error('Monitor check failed:', error)
      
      const updatedMonitor = {
        ...monitor,
        status: 'down',
        responseTime: monitor.timeout * 1000,
        lastCheck: new Date().toISOString(),
        uptime: Math.max(monitor.uptime - 2, 0)
      } as MonitorData

      const updatedMonitors = monitors.map(m => 
        m.id === monitorId ? updatedMonitor : m
      )
      
      setMonitors(updatedMonitors)
      localStorage.setItem(`monitors-${appId}`, JSON.stringify(updatedMonitors))
      
      toast.error(`${monitor.name} check failed!`)
    } finally {
      setChecking(null)
    }
  }

  const onSubmit = async (data: MonitorData) => {
    try {
      const newMonitor = {
        ...data,
        id: Date.now().toString(),
        status: 'checking' as const,
        uptime: 100,
        responseTime: 0,
        lastCheck: new Date().toISOString(),
        sslValid: true
      }
      
      const updatedMonitors = [...monitors, newMonitor]
      setMonitors(updatedMonitors)
      localStorage.setItem(`monitors-${appId}`, JSON.stringify(updatedMonitors))
      
      toast.success('Monitor added successfully!')
      setShowAddDialog(false)
      form.reset()
      
      // Check the new monitor immediately
      setTimeout(() => checkMonitor(newMonitor.id), 1000)
      
    } catch (error) {
      console.error('Error adding monitor:', error)
      toast.error('Failed to add monitor')
    }
  }

  const deleteMonitor = (monitorId: string) => {
    const updatedMonitors = monitors.filter(m => m.id !== monitorId)
    setMonitors(updatedMonitors)
    localStorage.setItem(`monitors-${appId}`, JSON.stringify(updatedMonitors))
    toast.success('Monitor deleted')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up': return CheckCircle
      case 'down': return XCircle
      case 'checking': return RefreshCw
      default: return AlertTriangle
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200'
      case 'down': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200'
      case 'checking': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const averageUptime = monitors.length > 0 
    ? monitors.reduce((sum, monitor) => sum + monitor.uptime, 0) / monitors.length 
    : 100

  const averageResponseTime = monitors.length > 0 
    ? monitors.reduce((sum, monitor) => sum + monitor.responseTime, 0) / monitors.length 
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Uptime Monitor</h3>
          <p className="text-muted-foreground">Monitor your app's availability and performance</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={checkAllMonitors} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Check All
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Monitor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Uptime Monitor</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monitor Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My App Homepage" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL to Monitor</FormLabel>
                        <FormControl>
                          <Input placeholder="https://myapp.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="interval"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check Interval (min)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">1 minute</SelectItem>
                              <SelectItem value="5">5 minutes</SelectItem>
                              <SelectItem value="15">15 minutes</SelectItem>
                              <SelectItem value="30">30 minutes</SelectItem>
                              <SelectItem value="60">1 hour</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="timeout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timeout (sec)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="30" 
                              {...field} 
                              onChange={e => field.onChange(parseInt(e.target.value) || 10)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Add Monitor
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Uptime</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{averageUptime.toFixed(2)}%</div>
            <Progress value={averageUptime} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-950 dark:to-cyan-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Zap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{averageResponseTime.toFixed(0)}ms</div>
            <p className="text-xs text-blue-600 mt-1">
              {averageResponseTime < 500 ? 'Excellent' : averageResponseTime < 1000 ? 'Good' : 'Needs optimization'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950 dark:to-violet-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SSL Status</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {monitors.filter(m => m.sslValid).length}/{monitors.length}
            </div>
            <p className="text-xs text-purple-600 mt-1">Valid certificates</p>
          </CardContent>
        </Card>
      </div>

      {/* Monitors List */}
      {monitors.length > 0 ? (
        <div className="space-y-4">
          {monitors.map((monitor) => {
            const StatusIcon = getStatusIcon(monitor.status)
            const isChecking = checking === monitor.id
            
            return (
              <Card key={monitor.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <StatusIcon 
                          className={`h-6 w-6 ${
                            monitor.status === 'up' ? 'text-green-600' : 
                            monitor.status === 'down' ? 'text-red-600' : 
                            'text-yellow-600'
                          } ${isChecking ? 'animate-spin' : ''}`} 
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold">{monitor.name}</h4>
                        <p className="text-sm text-muted-foreground">{monitor.url}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge className={getStatusColor(monitor.status)} variant="secondary">
                          {monitor.status.toUpperCase()}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {monitor.responseTime}ms • {monitor.uptime.toFixed(1)}% uptime
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => checkMonitor(monitor.id)}
                          disabled={isChecking}
                        >
                          <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => deleteMonitor(monitor.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uptime</span>
                      <span>{monitor.uptime.toFixed(2)}%</span>
                    </div>
                    <Progress value={monitor.uptime} className="h-2" />
                    
                    <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                      <span>Last checked: {new Date(monitor.lastCheck).toLocaleString()}</span>
                      {monitor.sslExpiry && (
                        <span className="flex items-center gap-1">
                          <Shield className={`h-3 w-3 ${monitor.sslValid ? 'text-green-600' : 'text-red-600'}`} />
                          SSL expires: {new Date(monitor.sslExpiry).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Globe className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Monitors</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-sm">
              Start monitoring your app's uptime and performance by adding your first monitor.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Monitor
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
