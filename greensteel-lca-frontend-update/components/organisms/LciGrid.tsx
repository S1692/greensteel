"use client"

import { useState, useEffect } from "react"
import { Table, TableRow, TableCell } from "../atoms/Table"
import { Input } from "../atoms/Input"
import { Select } from "../atoms/Select"
import { Button } from "../atoms/Button"
import type { LciItem } from "@/lib/types"

interface LciGridProps {
  items: LciItem[]
  onChange: (items: LciItem[]) => void
}

export function LciGrid({ items, onChange }: LciGridProps) {
  const [editingItems, setEditingItems] = useState<LciItem[]>(items)

  // ✅ props 변경 시 내부 상태도 동기화
  useEffect(() => {
    setEditingItems(items)
  }, [items])

  const directionOptions = [
    { value: "in", label: "Input" },
    { value: "out", label: "Output" },
  ]

  const unitOptions = [
    { value: "kg", label: "kg" },
    { value: "g", label: "g" },
    { value: "L", label: "L" },
    { value: "kWh", label: "kWh" },
    { value: "MJ", label: "MJ" },
    { value: "piece", label: "piece" },
  ]

  const updateItem = (index: number, field: keyof LciItem, value: any) => {
    const updated = [...editingItems]
    updated[index] = { ...updated[index], [field]: value }
    setEditingItems(updated)
    onChange(updated)
  }

  const addItem = () => {
    const newItem: LciItem = {
      id: crypto.randomUUID(), // ✅ 더 안전한 고유 ID
      process: "",
      flow: "",
      direction: "in",
      qty: 0,
      unit: "kg",
    }
    const updated = [...editingItems, newItem]
    setEditingItems(updated)
    onChange(updated)
  }

  const removeItem = (index: number) => {
    const updated = editingItems.filter((_, i) => i !== index)
    setEditingItems(updated)
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">LCI 데이터 입력</h3>
        <Button onClick={addItem} size="sm" className="btn-primary">
          항목 추가
        </Button>
      </div>

      <Table headers={["공정", "흐름", "방향", "수량", "단위", "작업"]}>
        {editingItems.map((item, index) => (
          <TableRow key={item.id}>
            <TableCell>
              <Input
                value={item.process}
                onChange={(e) => updateItem(index, "process", e.target.value)}
                placeholder="공정명"
              />
            </TableCell>
            <TableCell>
              <Input
                value={item.flow}
                onChange={(e) => updateItem(index, "flow", e.target.value)}
                placeholder="물질/에너지 흐름"
              />
            </TableCell>
            <TableCell>
              <Select
                value={item.direction}
                onChange={(value) => updateItem(index, "direction", value)}
                options={directionOptions}
              />
            </TableCell>
            <TableCell>
              <Input
                type="number"
                value={item.qty}
                onChange={(e) => updateItem(index, "qty", Number(e.target.value) || 0)}
                placeholder="0"
              />
            </TableCell>
            <TableCell>
              <Select
                value={item.unit}
                onChange={(value) => updateItem(index, "unit", value)}
                options={unitOptions}
              />
            </TableCell>
            <TableCell>
              <Button variant="outline" size="sm" onClick={() => removeItem(index)}>
                삭제
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </Table>

      {editingItems.length === 0 && (
        <div className="text-center py-8 text-gray-300">LCI 데이터를 추가하세요</div>
      )}
    </div>
  )
}
