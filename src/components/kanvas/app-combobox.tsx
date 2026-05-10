"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import type { ReactNode, KeyboardEvent } from "react"

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
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()

  const selected = options.find((option) => option.id === value)

  const filtered = useMemo(
    () => options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase())),
    [options, query],
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (optionId: string) => {
    onChange(optionId)
    setOpen(false)
    setQuery("")
  }

  const handleOpen = () => {
    setOpen(true)
    setActiveIndex(filtered.length > 0 ? 0 : -1)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
        handleOpen()
        event.preventDefault()
      }
      return
    }

    if (filtered.length === 0) {
      if (event.key === "Escape") {
        event.preventDefault()
        setOpen(false)
      }
      return
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        setActiveIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        event.preventDefault()
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev))
        break
      case "Home":
        event.preventDefault()
        setActiveIndex(0)
        break
      case "End":
        event.preventDefault()
        setActiveIndex(filtered.length - 1)
        break
      case "Enter":
        event.preventDefault()
        if (activeIndex >= 0 && filtered[activeIndex]) {
          handleSelect(filtered[activeIndex].id)
        }
        break
      case "Escape":
        event.preventDefault()
        setOpen(false)
        break
    }
  }

  useEffect(() => {
    if (open && listRef.current) {
      const activeElement = listRef.current.querySelector<HTMLElement>("[data-active='true']")
      if (activeElement) {
        activeElement.scrollIntoView({ block: "nearest" })
      }
    }
  }, [activeIndex, open])

  return (
    <div className="relative w-full" ref={rootRef}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-kanvas-line bg-white px-3 py-2.5 text-left text-[13px]"
        onClick={() => setOpen((state) => !state)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listboxId : undefined}
      >
        <span className={selected ? "min-w-0 flex-1 truncate text-kanvas-ink" : "min-w-0 flex-1 truncate text-kanvas-ink-4"}>
          {selected ? selected.label : placeholder}
        </span>
        <KanvasIcons.chevronD size={14} />
      </button>

      {open ? (
        <div
          id={listboxId}
          ref={listRef}
          className="absolute top-[calc(100%+4px)] right-0 left-0 z-30 max-h-60 overflow-auto rounded-[10px] border border-kanvas-line bg-white p-1.5 shadow-[0_12px_28px_rgba(16,33,61,0.14)]"
          role="listbox"
          aria-label="Pilih opsi"
        >
          <div className="mb-1 flex items-center gap-1.5 border-b border-kanvas-line-2 px-2 py-1">
            <KanvasIcons.search size={13} />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Cari..."
              className="flex-1 bg-transparent py-1 text-[13px] outline-none"
              role="combobox"
              aria-expanded={open}
              aria-autocomplete="list"
              aria-controls={listboxId}
              aria-activedescendant={activeIndex >= 0 && filtered[activeIndex] ? `option-${filtered[activeIndex].id}` : undefined}
            />
          </div>

          {filtered.length === 0 ? (
            <div className="px-3 py-2.5 text-[12.5px] text-kanvas-ink-4">Tidak ada hasil</div>
          ) : null}

          {filtered.map((option, index) => {
            const isActive = option.id === value
            const isHighlighted = index === activeIndex

            return (
              <button
                type="button"
                id={`option-${option.id}`}
                key={option.id}
                data-active={isHighlighted}
                className="block w-full rounded-md px-2.5 py-2 text-left text-[13px]"
                style={{
                  background: isActive ? "var(--kanvas-paper)" : isHighlighted ? "var(--kanvas-paper)" : "transparent",
                }}
                onClick={() => handleSelect(option.id)}
                onMouseEnter={() => setActiveIndex(index)}
                role="option"
                aria-selected={isActive}
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
