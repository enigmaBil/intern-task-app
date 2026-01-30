"use client"

import * as React from "react"
import { cn } from "@/shared/utils"

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal"
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, orientation = "vertical", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden",
        className
      )}
      {...props}
    >
      <div 
        className={cn(
          "h-full w-full rounded-[inherit]",
          orientation === "vertical" 
            ? "overflow-y-auto overflow-x-hidden" 
            : "overflow-x-auto overflow-y-hidden"
        )}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgb(203 213 225) transparent',
        }}
      >
        {children}
      </div>
    </div>
  )
)
ScrollArea.displayName = "ScrollArea"

export { ScrollArea }
