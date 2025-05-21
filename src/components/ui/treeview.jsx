"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const TreeView = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("h-full w-full overflow-auto", className)} {...props} />
))
TreeView.displayName = "TreeView"

const TreeViewNode = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("min-h-8 flex flex-col", className)} {...props}>
    {children}
  </div>
))
TreeViewNode.displayName = "TreeViewNode"

const TreeViewNodeToggle = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "h-8 w-8 rounded-sm p-px hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <ChevronRight className="h-4 w-4 transition duration-200 [&[data-state=open]>svg]:rotate-90" />
    <span className="sr-only">Toggle</span>
  </button>
))
TreeViewNodeToggle.displayName = "TreeViewNodeToggle"

const TreeViewNodeContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-8 items-center gap-2 rounded-sm px-2 hover:bg-accent hover:text-accent-foreground",
      className,
    )}
    {...props}
  />
))
TreeViewNodeContent.displayName = "TreeViewNodeContent"

const TreeViewNodeLabel = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex-1 truncate text-sm", className)} {...props} />
))
TreeViewNodeLabel.displayName = "TreeViewNodeLabel"

const TreeViewNodeGroup = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pl-6", className)} {...props} />
))
TreeViewNodeGroup.displayName = "TreeViewNodeGroup"

export { TreeView, TreeViewNode, TreeViewNodeToggle, TreeViewNodeContent, TreeViewNodeLabel, TreeViewNodeGroup }
