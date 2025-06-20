
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { 
  Eye, 
  Users, 
  MousePointer, 
  Target, 
  TrendingUp,
  Settings,
  RefreshCw,
  Calendar,
  BarChart3,
  Plus
} from "lucide-react"

const analyticsSchema = z.object({
  visitors: z.number().min(0),
  sessions: z.number().min(0),
  bounceRate: z.number().min(0).max(100),
  conversionRate: z.number().min(0).max(100),
  avgSessionDuration: z.string(),
  source: z.enum(['manual', 'plausible', 'google-analytics', 'other']),
  date: z.string()
})

type AnalyticsData = z.infer<typeof analyticsSchema>

interface AnalyticsDashboardProps {
  appId: string
}

export function AnalyticsDashboard({ appId }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)

  const form = useForm<AnalyticsData>({
    resolver: zodResolver(analyticsSchema),
    defaultValues: {
      visitors: 0,
      sessions: 0,
      bounceRate: 0,
      conversionRate: 0,
      avgSessionDuration: "0:00",
      source: 'manual',
      date: new Date().toISOString().split('T')[0]
    }
  })

  useEffect(() => {
    loadAnalytics()
  }, [appId])

  const loadAnalytics = async () => {
    try {
      // Load from localStorage first (for demo purposes)
      const stored = localStorage.getItem(`analytics-${appId}`)
      if (stored) {
        setAnalytics(JSON.parse(stored))
      }
      
      // TODO: Load from Supabase
      // const { data, error } = await supabase
      //   .from('analytics')
      //   .select('*')
      //   .eq('app_id', appId)
      //   .order('date', { ascending: true })
      
      setLoading(false)
    } catch (error) {
      console.error('Error loading analytics:', error)
      toast.error('Failed to load analytics data')
      setLoading(false)
    }
  }

  const onSubmit = async (data: AnalyticsData) => {
    try {
      const newAnalytics = [...analytics, { ...data, id: Date.now().toString() }]
      setAnalytics(newAnalytics)
      
      // Store in localStorage for now
      localStorage.setItem(`analytics-${appId}`, JSON.stringify(newAnalytics))
      
      // TODO: Store in Supabase
      // const { error } = await supabase
      //   .from('analytics')
      //   .insert([{ ...data, app_id: appId }])
      
      toast.success('Analytics data added successfully!')
      setShowAddDialog(false)
      form.reset()
    } catch (error) {
      console.error('Error saving analytics:', error)
      toast.error('Failed to save analytics data')
    }
  }

  const latestData = analytics[analytics.length - 1] || {
    visitors: 0,
    sessions: 0,
    bounceRate: 0,
    conversionRate: 0,
    avgSessionDuration: "0:00"
  }

  const chartData = analytics.map((item, index) => ({
    date: item.date,
    visitors: item.visitors,
    sessions: item.sessions,
    conversionRate: item.conversionRate
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Analytics Dashboard</h3>
          <p className="text-muted-foreground">Track your app's performance with real data</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadAnalytics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Data
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Analytics Data</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="visitors"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Visitors</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="sessions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sessions</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bounceRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bounce Rate (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1"
                              max="100"
                              {...field} 
                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="conversionRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conversion (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1"
                              max="100"
                              {...field} 
                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="avgSessionDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avg Session Duration (e.g., "3:42")</FormLabel>
                        <FormControl>
                          <Input placeholder="2:30" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Source</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="manual">Manual Entry</SelectItem>
                            <SelectItem value="plausible">Plausible Analytics</SelectItem>
                            <SelectItem value="google-analytics">Google Analytics</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full">
                    Add Analytics Data
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{latestData.visitors.toLocaleString()}</div>
            <p className="text-xs text-blue-600 mt-1">
              {analytics.length > 1 ? 
                `${((latestData.visitors - analytics[analytics.length - 2]?.visitors || 0) / (analytics[analytics.length - 2]?.visitors || 1) * 100).toFixed(1)}% from previous` 
                : 'No previous data'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{latestData.sessions.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1">
              Avg session: {latestData.avgSessionDuration}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{latestData.bounceRate}%</div>
            <p className="text-xs text-orange-600 mt-1">
              {latestData.bounceRate < 40 ? 'Excellent' : latestData.bounceRate < 60 ? 'Good' : 'Needs improvement'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{latestData.conversionRate}%</div>
            <p className="text-xs text-purple-600 mt-1">
              {latestData.conversionRate > 5 ? 'Outstanding' : latestData.conversionRate > 2 ? 'Good' : 'Optimize funnel'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {analytics.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Traffic Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    name="Visitors"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sessions" 
                    stroke="#16a34a" 
                    strokeWidth={2}
                    name="Sessions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Conversion Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="conversionRate" 
                    fill="#8b5cf6" 
                    name="Conversion Rate (%)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {analytics.length === 0 && !loading && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-sm">
              Start tracking your app's performance by adding your first analytics data point.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Data Point
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
