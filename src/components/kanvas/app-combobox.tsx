"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { ReactNode } from "react"

import { KanvasIcons } from "@/components/kanvas/icons"

export interface AppComboboxOption {
  id: string
  label: string
  subLabel?: string
}

interface AppComboboxProps {
  value?: string
  onChange: (value: string) => void
  options: AppComboboxOption[]
  placeholder?: string
  renderItem?: (option: AppComboboxOption) => ReactNode
}

export function AppCombobox({
  value,
  onChange,
  options,
  placeholder = "Pilih...",
  renderItem,
}: AppComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selected = options.find((option) => option.id === value)

  const filtered = useMemo(
    () => options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase())),
    [options, query],
  )

  return (
    <div className="relative w-full" ref={rootRef}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-kanvas-line bg-white px-3 py-2.5 text-left text-[13px]"
        onClick={() => setOpen((state) => !state)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className={selected ? "min-w-0 flex-1 truncate text-kanvas-ink" : "min-w-0 flex-1 truncate text-kanvas-ink-4"}>
          {selected ? selected.label : placeholder}
        </span>
        <KanvasIcons.chevronD size={14} />
      </button>

      {open ? (
        <div className="absolute top-[calc(100%+4px)] right-0 left-0 z-30 max-h-60 overflow-auto rounded-[10px] border border-kanvas-line bg-white p-1.5 shadow-[0_12px_28px_rgba(16,33,61,0.14)]">
          <div className="mb-1 flex items-center gap-1.5 border-b border-kanvas-line-2 px-2 py-1">
            <KanvasIcons.search size={13} />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari..."
              className="flex-1 bg-transparent py-1 text-[13px] outline-none"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="px-3 py-2.5 text-[12.5px] text-kanvas-ink-4">Tidak ada hasil</div>
          ) : null}

          {filtered.map((option) => {
            const active = option.id === value

            return (
              <button
                type="button"
                key={option.id}
                className="block w-full rounded-md px-2.5 py-2 text-left text-[13px] hover:bg-kanvas-paper"
                style={{ background: active ? "var(--kanvas-paper)" : "transparent" }}
                onClick={() => {
                  onChange(option.id)
                  setOpen(false)
                  setQuery("")
                }}
              >
                {renderItem ? (
                  renderItem(option)
                ) : (
                  <div>
                    <div>{option.label}</div>
                    {option.subLabel ? <div className="text-[11px] text-kanvas-ink-4">{option.subLabel}</div> : null}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
