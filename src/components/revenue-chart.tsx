
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Plus, DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface Revenue {
  id: string
  app_id: string
  month: string
  total_revenue: number
  refunds: number
  subscribers: number
  source: string | null
  created_at: string
}

interface RevenueChartProps {
  appId: string
}

export function RevenueChart({ appId }: RevenueChartProps) {
  const [revenues, setRevenues] = useState<Revenue[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newRevenue, setNewRevenue] = useState({
    month: new Date().toISOString().slice(0, 7),
    total_revenue: 0,
    refunds: 0,
    subscribers: 0,
    source: ''
  })

  const fetchRevenues = async () => {
    try {
      const { data, error } = await supabase
        .from('revenues')
        .select('*')
        .eq('app_id', appId)
        .order('month', { ascending: true })

      if (error) throw error
      
      const typedRevenues = data?.map(revenue => ({
        ...revenue,
        total_revenue: Number(revenue.total_revenue) || 0,
        refunds: Number(revenue.refunds) || 0,
        subscribers: Number(revenue.subscribers) || 0
      })) || []
      
      setRevenues(typedRevenues)
    } catch (error) {
      console.error('Error fetching revenues:', error)
      toast.error('Failed to load revenue data')
    } finally {
      setLoading(false)
    }
  }

  const addRevenue = async () => {
    if (!newRevenue.month) {
      toast.error('Please select a month')
      return
    }

    try {
      const { data, error } = await supabase
        .from('revenues')
        .insert([{
          app_id: appId,
          month: newRevenue.month + '-01',
          total_revenue: newRevenue.total_revenue,
          refunds: newRevenue.refunds,
          subscribers: newRevenue.subscribers,
          source: newRevenue.source || null
        }])
        .select()
        .single()

      if (error) throw error

      const typedRevenue = {
        ...data,
        total_revenue: Number(data.total_revenue) || 0,
        refunds: Number(data.refunds) || 0,
        subscribers: Number(data.subscribers) || 0
      }

      setRevenues(prev => [...prev, typedRevenue].sort((a, b) => a.month.localeCompare(b.month)))
      setNewRevenue({
        month: new Date().toISOString().slice(0, 7),
        total_revenue: 0,
        refunds: 0,
        subscribers: 0,
        source: ''
      })
      setShowAddDialog(false)
      toast.success('Revenue data added!')
    } catch (error) {
      console.error('Error adding revenue:', error)
      toast.error('Failed to add revenue data')
    }
  }

  useEffect(() => {
    fetchRevenues()
  }, [appId])

  if (loading) {
    return <div className="animate-pulse bg-card rounded-lg p-6 h-96"></div>
  }

  const chartData = revenues.map(revenue => ({
    month: new Date(revenue.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    revenue: revenue.total_revenue,
    refunds: revenue.refunds,
    subscribers: revenue.subscribers,
    net: revenue.total_revenue - revenue.refunds
  }))

  const totalRevenue = revenues.reduce((sum, r) => sum + r.total_revenue, 0)
  const totalRefunds = revenues.reduce((sum, r) => sum + r.refunds, 0)
  const totalSubscribers = revenues[revenues.length - 1]?.subscribers || 0
  const growth = revenues.length >= 2 
    ? ((revenues[revenues.length - 1].total_revenue - revenues[revenues.length - 2].total_revenue) / revenues[revenues.length - 2].total_revenue) * 100
    : 0

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalRevenue - totalRefunds).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscribers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            {growth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Revenue Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Revenue Analytics</h3>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Revenue Data
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Revenue Data</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Input
                  id="month"
                  type="month"
                  value={newRevenue.month}
                  onChange={(e) => setNewRevenue({ ...newRevenue, month: e.target.value })}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="total_revenue">Total Revenue ($)</Label>
                  <Input
                    id="total_revenue"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newRevenue.total_revenue}
                    onChange={(e) => setNewRevenue({ ...newRevenue, total_revenue: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="refunds">Refunds ($)</Label>
                  <Input
                    id="refunds"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newRevenue.refunds}
                    onChange={(e) => setNewRevenue({ ...newRevenue, refunds: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="subscribers">Subscribers</Label>
                  <Input
                    id="subscribers"
                    type="number"
                    min="0"
                    value={newRevenue.subscribers}
                    onChange={(e) => setNewRevenue({ ...newRevenue, subscribers: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Input
                    id="source"
                    placeholder="e.g., Stripe, Gumroad"
                    value={newRevenue.source}
                    onChange={(e) => setNewRevenue({ ...newRevenue, source: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={addRevenue} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Add Revenue
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Charts */}
      {chartData.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, '']} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="Revenue"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="net" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Net Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscriber Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'Subscribers']} />
                  <Bar dataKey="subscribers" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="text-lg font-semibold mb-2">No revenue data yet</h4>
            <p className="text-muted-foreground text-center mb-4">
              Add your first revenue entry to start tracking your app's financial performance.
            </p>
            <Button onClick={() => setShowAddDialog(true)} className="bg-purple-600 hover:bg-purple-700">
              Add Revenue Data
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
