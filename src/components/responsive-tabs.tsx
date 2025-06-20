
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface ResponsiveTabsProps {
  defaultValue: string
  children: React.ReactNode
  tabs: Array<{
    value: string
    label: string
    icon?: React.ComponentType<{ className?: string }>
    mobileLabel?: string
  }>
  className?: string
}

export function ResponsiveTabs({ defaultValue, children, tabs, className }: ResponsiveTabsProps) {
  const isMobile = useIsMobile()

  return (
    <Tabs defaultValue={defaultValue} className={cn("w-full", className)}>
      <div className="border-b">
        <ScrollArea className="w-full whitespace-nowrap">
          <TabsList className="inline-flex h-12 items-center justify-start rounded-none bg-transparent p-0 w-full">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value} 
                className="inline-flex items-center gap-2 border-b-2 border-transparent px-3 sm:px-4 py-3 text-sm font-medium transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground min-w-0"
              >
                {tab.icon && <tab.icon className="h-4 w-4 flex-shrink-0" />}
                <span className={cn(
                  "truncate",
                  isMobile && tab.mobileLabel ? "hidden sm:inline" : ""
                )}>
                  {tab.label}
                </span>
                {isMobile && tab.mobileLabel && (
                  <span className="sm:hidden truncate">{tab.mobileLabel}</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      <div className="mt-6">
        {children}
      </div>
    </Tabs>
  )
}
