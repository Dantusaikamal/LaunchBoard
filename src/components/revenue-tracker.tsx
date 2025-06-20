
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { CalendarHeatmap } from "@/components/calendar-heatmap"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  CreditCard,
  RefreshCw,
  Calendar
} from "lucide-react"

const revenueSchema = z.object({
  amount: z.number().min(0),
  refunds: z.number().min(0).default(0),
  source: z.enum(['stripe', 'gumroad', 'paypal', 'manual', 'other']),
  date: z.string(),
  description: z.string().optional()
})

type RevenueData = z.infer<typeof revenueSchema> & { id: string }

interface RevenueTrackerProps {
  appId: string
}

export function RevenueTracker({ appId }: RevenueTrackerProps) {
  const [revenues, setRevenues] = useState<RevenueData[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month')

  const form = useForm<RevenueData>({
    resolver: zodResolver(revenueSchema),
    defaultValues: {
      amount: 0,
      refunds: 0,
      source: 'manual',
      date: new Date().toISOString().split('T')[0],
      description: ''
    }
  })

  useEffect(() => {
    loadRevenues()
  }, [appId])

  const loadRevenues = async () => {
    try {
      const stored = localStorage.getItem(`revenues-${appId}`)
      if (stored) {
        setRevenues(JSON.parse(stored))
      }
      setLoading(false)
    } catch (error) {
      console.error('Error loading revenues:', error)
      toast.error('Failed to load revenue data')
      setLoading(false)
    }
  }

  const onSubmit = async (data: RevenueData) => {
    try {
      const newRevenue = { ...data, id: Date.now().toString() }
      const newRevenues = [...revenues, newRevenue]
      setRevenues(newRevenues)
      
      localStorage.setItem(`revenues-${appId}`, JSON.stringify(newRevenues))
      
      toast.success('Revenue data added successfully!')
      setShowAddDialog(false)
      form.reset()
    } catch (error) {
      console.error('Error saving revenue:', error)
      toast.error('Failed to save revenue data')
    }
  }

  const totalRevenue = revenues.reduce((sum, rev) => sum + rev.amount, 0)
  const totalRefunds = revenues.reduce((sum, rev) => sum + (rev.refunds || 0), 0)
  const netRevenue = totalRevenue - totalRefunds

  // Calculate month-over-month growth
  const currentMonth = new Date().getMonth()
  const thisMonthRevenue = revenues
    .filter(rev => new Date(rev.date).getMonth() === currentMonth)
    .reduce((sum, rev) => sum + rev.amount, 0)
  
  const lastMonthRevenue = revenues
    .filter(rev => new Date(rev.date).getMonth() === currentMonth - 1)
    .reduce((sum, rev) => sum + rev.amount, 0)
  
  const growth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0

  // Prepare chart data
  const chartData = revenues
    .reduce((acc, rev) => {
      const date = rev.date
      const existing = acc.find(item => item.date === date)
      if (existing) {
        existing.revenue += rev.amount
        existing.refunds += (rev.refunds || 0)
      } else {
        acc.push({
          date,
          revenue: rev.amount,
          refunds: rev.refunds || 0,
          net: rev.amount - (rev.refunds || 0)
        })
      }
      return acc
    }, [] as any[])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Prepare heatmap data
  const heatmapData = revenues.map(rev => ({
    date: rev.date,
    value: rev.amount,
    launches: [] // This would be populated with actual launch data
  }))

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'stripe': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'gumroad': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
      case 'paypal': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'manual': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Revenue Tracker</h3>
          <p className="text-muted-foreground">Monitor your app's financial performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadRevenues} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Revenue
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Revenue Entry</DialogTitle>
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
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Revenue ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="0.00"
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
                      name="refunds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Refunds ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="0.00"
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
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Revenue Source</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="stripe">Stripe</SelectItem>
                            <SelectItem value="gumroad">Gumroad</SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                            <SelectItem value="manual">Manual Entry</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Product sale, subscription, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full">
                    Add Revenue Entry
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-green-600 mt-1">
              {growth > 0 ? (
                <span className="flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{growth.toFixed(1)}% this month
                </span>
              ) : growth < 0 ? (
                <span className="flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {growth.toFixed(1)}% this month
                </span>
              ) : (
                'No previous month data'
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-950 dark:to-pink-900 border-red-200 dark:border-red-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
            <CreditCard className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">${totalRefunds.toFixed(2)}</div>
            <p className="text-xs text-red-600 mt-1">
              {totalRevenue > 0 ? `${((totalRefunds / totalRevenue) * 100).toFixed(1)}% refund rate` : 'No refunds'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-950 dark:to-cyan-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">${netRevenue.toFixed(2)}</div>
            <p className="text-xs text-blue-600 mt-1">
              After refunds & fees
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [`$${value}`, name]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="refunds" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Refunds"
                />
                <Line 
                  type="monotone" 
                  dataKey="net" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Net Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Revenue Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Revenue Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarHeatmap data={heatmapData} />
        </CardContent>
      </Card>

      {/* Recent Entries */}
      {revenues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Revenue Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {revenues.slice(-5).reverse().map((revenue) => (
                <div key={revenue.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">${revenue.amount.toFixed(2)}</span>
                      <Badge className={getSourceColor(revenue.source)} variant="secondary">
                        {revenue.source}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {revenue.description || 'No description'} • {revenue.date}
                    </p>
                  </div>
                  {revenue.refunds > 0 && (
                    <div className="text-right">
                      <div className="text-sm text-red-600">-${revenue.refunds.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">refund</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {revenues.length === 0 && !loading && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DollarSign className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Revenue Data</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-sm">
              Start tracking your revenue by adding your first revenue entry.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Revenue
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
