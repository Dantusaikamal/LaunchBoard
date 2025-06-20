
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format, startOfYear, endOfYear, eachDayOfInterval, getDay, getWeek, isSameDay } from "date-fns"

interface HeatmapData {
  date: string
  value: number
  launches?: string[]
}

interface CalendarHeatmapProps {
  data: HeatmapData[]
  year?: number
}

export function CalendarHeatmap({ data, year = new Date().getFullYear() }: CalendarHeatmapProps) {
  const [selectedDay, setSelectedDay] = useState<HeatmapData | null>(null)
  
  const yearStart = startOfYear(new Date(year, 0, 1))
  const yearEnd = endOfYear(new Date(year, 0, 1))
  const days = eachDayOfInterval({ start: yearStart, end: yearEnd })
  
  // Create a map for quick lookup
  const dataMap = new Map(data.map(item => [item.date, item]))
  
  // Get max value for color intensity
  const maxValue = Math.max(...data.map(item => item.value), 1)
  
  const getIntensity = (value: number) => {
    if (value === 0) return 0
    const intensity = Math.ceil((value / maxValue) * 4)
    return Math.min(intensity, 4)
  }
  
  const getColorClass = (intensity: number) => {
    switch (intensity) {
      case 0: return 'bg-gray-100 dark:bg-gray-800'
      case 1: return 'bg-green-200 dark:bg-green-900'
      case 2: return 'bg-green-300 dark:bg-green-800'
      case 3: return 'bg-green-400 dark:bg-green-700'
      case 4: return 'bg-green-500 dark:bg-green-600'
      default: return 'bg-gray-100 dark:bg-gray-800'
    }
  }
  
  // Group days by week
  const weeks: Date[][] = []
  let currentWeek: Date[] = []
  
  days.forEach((day, index) => {
    if (index === 0) {
      // Add empty cells for the first week if it doesn't start on Sunday
      const dayOfWeek = getDay(day)
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push(new Date(''))
      }
    }
    
    currentWeek.push(day)
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })
  
  // Add the last partial week if it exists
  if (currentWeek.length > 0) {
    // Fill the rest of the week with empty cells
    while (currentWeek.length < 7) {
      currentWeek.push(new Date(''))
    }
    weeks.push(currentWeek)
  }
  
  const monthLabels = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]
  
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Activity in {year}</h4>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(intensity => (
              <div 
                key={intensity}
                className={`w-3 h-3 rounded-sm ${getColorClass(intensity)}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
      
      <div className="relative">
        {/* Month labels */}
        <div className="flex text-xs text-muted-foreground mb-2 ml-8">
          {monthLabels.map((month, index) => (
            <div key={month} className="flex-1 text-left" style={{ marginLeft: index === 0 ? '0' : '-10px' }}>
              {month}
            </div>
          ))}
        </div>
        
        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col text-xs text-muted-foreground mr-2 mt-1">
            {dayLabels.map((day, index) => (
              <div key={day} className="h-3 mb-1 flex items-center" style={{ height: '12px' }}>
                {index % 2 === 1 ? day : ''}
              </div>
            ))}
          </div>
          
          {/* Heatmap grid */}
          <TooltipProvider>
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => {
                    if (!day || isNaN(day.getTime())) {
                      return <div key={dayIndex} className="w-3 h-3" />
                    }
                    
                    const dateStr = format(day, 'yyyy-MM-dd')
                    const dayData = dataMap.get(dateStr)
                    const value = dayData?.value || 0
                    const intensity = getIntensity(value)
                    
                    return (
                      <Tooltip key={dayIndex}>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-3 h-3 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all ${getColorClass(intensity)}`}
                            onClick={() => setSelectedDay(dayData || { date: dateStr, value: 0 })}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-center">
                            <div className="font-medium">{format(day, 'MMM d, yyyy')}</div>
                            <div className="text-sm">
                              {value > 0 ? `$${value.toFixed(2)} revenue` : 'No revenue'}
                            </div>
                            {dayData?.launches && dayData.launches.length > 0 && (
                              <div className="text-xs mt-1">
                                {dayData.launches.length} launch{dayData.launches.length > 1 ? 'es' : ''}
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              ))}
            </div>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Selected day details */}
      {selectedDay && (
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-medium">{format(new Date(selectedDay.date), 'MMMM d, yyyy')}</h5>
              <p className="text-sm text-muted-foreground">
                {selectedDay.value > 0 ? `$${selectedDay.value.toFixed(2)} revenue` : 'No revenue recorded'}
              </p>
            </div>
            {selectedDay.launches && selectedDay.launches.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedDay.launches.map((launch, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {launch}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
