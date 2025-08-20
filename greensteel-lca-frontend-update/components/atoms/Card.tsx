"use client"

import type React from "react"
import { forwardRef } from "react"
import { Card as UICard, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CardProps extends React.ComponentProps<typeof UICard> {
  children: React.ReactNode
  hover?: boolean
  clickable?: boolean
  padding?: "none" | "sm" | "md" | "lg"
  elevation?: "none" | "sm" | "md" | "lg"
  title?: string
  description?: string
  footer?: React.ReactNode
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className = "",
      onClick,
      hover = true,
      clickable = false,
      padding = "md",
      elevation = "sm",
      title,
      description,
      footer,
      ...props
    },
    ref
  ) => {
    const paddingClasses: Record<NonNullable<CardProps["padding"]>, string> = {
      none: "",
      sm: "p-3",
      md: "p-5",
      lg: "p-6",
    }

    const elevationClasses: Record<NonNullable<CardProps["elevation"]>, string> = {
      none: "",
      sm: "shadow-sm",
      md: "shadow-md",
      lg: "shadow-lg",
    }

    return (
      <UICard
        ref={ref}
        role={clickable || onClick ? "button" : "region"}
        tabIndex={clickable || onClick ? 0 : -1}
        onClick={onClick}
        className={cn(
          "gs-card transition-colors",
          paddingClasses[padding],
          elevationClasses[elevation],
          hover && "hover:shadow-lg hover:bg-accent/50",
          (clickable || onClick) && "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          className
        )}
        {...props}
      >
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        
        <CardContent className={cn(padding === "none" && "p-0")}>
          {children}
        </CardContent>

        {footer && <CardFooter>{footer}</CardFooter>}
      </UICard>
    )
  }
)

Card.displayName = "Card"
