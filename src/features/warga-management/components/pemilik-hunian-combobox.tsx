"use client"

import { useEffect, useId, useRef, useState } from "react"
import type { KeyboardEvent } from "react"

import { KanvasIcons } from "@/components/kanvas/icons"
import { listPemilikHunianAction } from "@/lib/actions/pemilik-hunian"
import type { PemilikHunianOption } from "@/lib/services/pemilik-hunian-service"

export interface PemilikHunianComboboxProps {
  value: string | null
  onChange: (value: string | null) => void
  disabled?: boolean
  error?: string
  onCreateNew?: () => void
}

export function PemilikHunianCombobox({ value, onChange, disabled, error, onCreateNew }: PemilikHunianComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [options, setOptions] = useState<PemilikHunianOption[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const listboxId = useId()

  const selected = options.find((o) => o.value === value)

  const fetchOptions = async (q: string) => {
    setLoading(true)
    try {
      const res = await listPemilikHunianAction({ query: q })
      if (res.ok) {
        setOptions(res.data)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = () => {
    setOpen(true)
    setQuery("")
    setActiveIndex(0)
    fetchOptions("")
  }

  const handleClose = () => {
    setOpen(false)
    setQuery("")
    setActiveIndex(0)
  }

  const handleQueryChange = (q: string) => {
    setQuery(q)
    setActiveIndex(0)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchOptions(q), 300)
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        handleClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  useEffect(() => {
    if (open && listRef.current) {
      const el = listRef.current.querySelector<HTMLElement>("[data-active='true']")
      if (el) el.scrollIntoView({ block: "nearest" })
    }
  }, [activeIndex, open])

  const handleSelect = (opt: PemilikHunianOption) => {
    onChange(opt.value)
    handleClose()
  }

  const handleClear = () => {
    onChange(null)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!open) return

    if (options.length === 0) {
      if (event.key === "Escape") {
        event.preventDefault()
        handleClose()
      }
      return
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        setActiveIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        event.preventDefault()
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev))
        break
      case "Enter":
        event.preventDefault()
        if (activeIndex >= 0 && options[activeIndex]) {
          handleSelect(options[activeIndex])
        }
        break
      case "Escape":
        event.preventDefault()
        handleClose()
        break
    }
  }

  const showClear = value !== null && !disabled

  return (
    <div className="relative w-full" ref={rootRef}>
      <div
        className={`flex items-center gap-1.5 rounded-lg border bg-white px-3 py-2.5 text-[13px] ${disabled ? "opacity-50" : ""} ${error ? "border-kanvas-danger" : "border-kanvas-line"} ${!disabled ? "cursor-pointer" : ""}`}
        onClick={() => {
          if (!disabled) handleOpen()
        }}
      >
        <KanvasIcons.search size={13} />
        <span className={`min-w-0 flex-1 truncate ${selected ? "text-kanvas-ink" : "text-kanvas-ink-4"}`}>
          {selected ? selected.label : "Cari pemilik kontrakan/kos..."}
        </span>
        {showClear ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleClear() }}
            className="rounded p-0.5 text-kanvas-ink-3 hover:text-kanvas-ink"
            aria-label="Hapus pilihan"
          >
            <KanvasIcons.x size={14} />
          </button>
        ) : null}
        <KanvasIcons.chevronD size={14} className="shrink-0 text-kanvas-ink-3" />
      </div>

      {open ? (
        <div
          id={listboxId}
          ref={listRef}
          className="absolute top-[calc(100%+4px)] right-0 left-0 z-30 max-h-60 overflow-auto rounded-[10px] border border-kanvas-line bg-white p-1.5 shadow-[0_12px_28px_rgba(16,33,61,0.14)]"
          role="listbox"
        >
          <div className="mb-1 flex items-center gap-1.5 border-b border-kanvas-line-2 px-2 py-1">
            <KanvasIcons.search size={13} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Cari..."
              className="flex-1 bg-transparent py-1 text-[13px] outline-none"
              role="combobox"
              aria-expanded={open}
              aria-autocomplete="list"
              aria-controls={listboxId}
              aria-activedescendant={activeIndex >= 0 && options[activeIndex] ? `ph-option-${options[activeIndex].value}` : undefined}
            />
            {loading ? <span className="size-3 animate-spin rounded-full border-2 border-kanvas-terra border-t-transparent" /> : null}
          </div>

          {!loading && options.length === 0 ? (
            <div className="px-3 py-2.5">
              <div className="text-[12.5px] text-kanvas-ink-4">Pemilik tidak ditemukan</div>
              {onCreateNew ? (
                <button
                  type="button"
                  onClick={onCreateNew}
                  className="mt-1.5 w-full rounded-md bg-kanvas-paper px-3 py-2 text-left text-[12.5px] font-semibold text-kanvas-terra hover:bg-kanvas-line-2"
                >
                  + Tambah Pemilik Baru
                </button>
              ) : null}
            </div>
          ) : null}

          {options.map((opt, index) => {
            const isActive = opt.value === value
            const isHighlighted = index === activeIndex
            const isWarga = opt.source === "warga"

            return (
              <button
                type="button"
                id={`ph-option-${opt.value}`}
                key={opt.value}
                data-active={isHighlighted}
                className="flex w-full items-start gap-2 rounded-md px-2.5 py-2 text-left text-[13px]"
                style={{
                  background: isActive || isHighlighted ? "var(--kanvas-paper)" : "transparent",
                }}
                onClick={() => handleSelect(opt)}
                onMouseEnter={() => setActiveIndex(index)}
                role="option"
                aria-selected={isActive}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-kanvas-ink">{opt.label}</div>
                  {opt.description ? (
                    <div className="truncate text-[11px] text-kanvas-ink-4">{opt.description}</div>
                  ) : null}
                </div>
                <span
                  className="mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                  style={{
                    background: isWarga ? "var(--kanvas-terra-soft)" : "var(--kanvas-paper)",
                    color: isWarga ? "var(--kanvas-terra)" : "var(--kanvas-ink-3)",
                  }}
                >
                  {isWarga ? "Warga" : "External"}
                </span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
