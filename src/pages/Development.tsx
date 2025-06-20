import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import { Navigate } from "react-router-dom"
import { 
  Code, 
  GitBranch, 
  Bug, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  Calendar,
  User,
  Tag
} from "lucide-react"
import { toast } from "sonner"

interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high'
  type: 'feature' | 'bug' | 'refactor' | 'docs'
  assignee?: string
  dueDate?: string
  createdAt: string
}

const statusColors = {
  'todo': 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  'review': 'bg-yellow-100 text-yellow-800',
  'done': 'bg-green-100 text-green-800'
}

const priorityColors = {
  'low': 'bg-green-100 text-green-800',
  'medium': 'bg-yellow-100 text-yellow-800',
  'high': 'bg-red-100 text-red-800'
}

const typeIcons = {
  'feature': Code,
  'bug': Bug,
  'refactor': GitBranch,
  'docs': AlertCircle
}

export default function Development() {
  const { user, loading: authLoading } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Implement user authentication',
      description: 'Add login/logout functionality with JWT tokens',
      status: 'in-progress',
      priority: 'high',
      type: 'feature',
      assignee: 'John Doe',
      dueDate: '2024-01-15',
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      title: 'Fix responsive design issues',
      description: 'Mobile layout breaks on small screens',
      status: 'todo',
      priority: 'medium',
      type: 'bug',
      dueDate: '2024-01-20',
      createdAt: '2024-01-05'
    }
  ])
  
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [newTask, setNewTask] = useState<{
    title: string
    description: string
    status: Task['status']
    priority: Task['priority']
    type: Task['type']
    assignee: string
    dueDate: string
  }>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    type: 'feature',
    assignee: '',
    dueDate: ''
  })

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  const handleNewApp = () => {
    console.log('New app action')
  }

  const handleCreateTask = () => {
    if (!newTask.title.trim()) {
      toast.error('Task title is required')
      return
    }

    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      createdAt: new Date().toISOString()
    }

    setTasks([...tasks, task])
    setNewTask({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      type: 'feature',
      assignee: '',
      dueDate: ''
    })
    setShowTaskForm(false)
    toast.success('Task created successfully!')
  }

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ))
    toast.success('Task status updated!')
  }

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status)
  }

  const TaskCard = ({ task }: { task: Task }) => {
    const TypeIcon = typeIcons[task.type]
    
    return (
      <Card className="mb-4 hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <TypeIcon className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
            </div>
            <Badge className={priorityColors[task.priority]} variant="secondary">
              {task.priority}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{task.description}</p>
          
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {task.assignee && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{task.assignee}</span>
              </div>
            )}
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              <span>{task.type}</span>
            </div>
          </div>

          <Select
            value={task.status}
            onValueChange={(value) => updateTaskStatus(task.id, value as Task['status'])}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">📋 To Do</SelectItem>
              <SelectItem value="in-progress">⚡ In Progress</SelectItem>
              <SelectItem value="review">👀 Review</SelectItem>
              <SelectItem value="done">✅ Done</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    )
  }

  return (
    <DashboardLayout onNewApp={handleNewApp}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Development</h1>
            <p className="text-muted-foreground">
              Track your development tasks and progress
            </p>
          </div>
          <Button onClick={() => setShowTaskForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">To Do</p>
                  <p className="text-2xl font-bold">{getTasksByStatus('todo').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">In Progress</p>
                  <p className="text-2xl font-bold">{getTasksByStatus('in-progress').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <GitBranch className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Review</p>
                  <p className="text-2xl font-bold">{getTasksByStatus('review').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Done</p>
                  <p className="text-2xl font-bold">{getTasksByStatus('done').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task Board */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {(['todo', 'in-progress', 'review', 'done'] as const).map(status => (
            <div key={status}>
              <div className="flex items-center gap-2 mb-4">
                <Badge className={statusColors[status]} variant="secondary">
                  {status.replace('-', ' ')} ({getTasksByStatus(status).length})
                </Badge>
              </div>
              <div className="space-y-2">
                {getTasksByStatus(status).map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Task Creation Form */}
        {showTaskForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>
                <div>
                  <Select
                    value={newTask.type}
                    onValueChange={(value) => setNewTask({ ...newTask, type: value as Task['type'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feature">🚀 Feature</SelectItem>
                      <SelectItem value="bug">🐛 Bug</SelectItem>
                      <SelectItem value="refactor">🔧 Refactor</SelectItem>
                      <SelectItem value="docs">📚 Documentation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Textarea
                placeholder="Task description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                rows={3}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({ ...newTask, priority: value as Task['priority'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 Low</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="high">🔴 High</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  placeholder="Assignee"
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                />
                
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleCreateTask}>Create Task</Button>
                <Button variant="outline" onClick={() => setShowTaskForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
