"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode
  headers?: string[]
  ariaLabel?: string
}

interface TableHeaderProps extends React.ThHTMLAttributes<HTMLTableHeaderCellElement> {
  children: React.ReactNode
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode
  clickable?: boolean
  onClick?: () => void
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableDataCellElement> {
  children: React.ReactNode
}

export function Table({ children, headers, ariaLabel = "데이터 테이블", className, ...props }: TableProps) {
  return (
    <div className="w-full overflow-auto">
      <table
        className={cn(
          "w-full caption-bottom text-sm",
          className
        )}
        aria-label={ariaLabel}
        {...props}
      >
        {headers && (
          <thead>
            <tr>
              {headers.map((header, index) => (
                <TableHeader key={index}>
                  {header}
                </TableHeader>
              ))}
            </tr>
          </thead>
        )}
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ children, className, ...props }: TableHeaderProps) {
  return (
    <th
      className={cn(
        "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    >
      {children}
    </th>
  )
}

export function TableRow({ children, className, clickable, onClick, ...props }: TableRowProps) {
  return (
    <tr
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        clickable && "cursor-pointer",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </tr>
  )
}

export function TableCell({ children, className, ...props }: TableCellProps) {
  return (
    <td
      className={cn(
        "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    >
      {children}
    </td>
  )
}
