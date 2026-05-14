"use client"

import { AppButton, KanvasIcons } from "@/components/kanvas"

interface ExportButtonsProps {
  contextLabel?: string
  onExportPDF?: () => void
  onExportExcel?: () => void
  hidePdf?: boolean
}

export function ExportButtons({
  onExportPDF,
  onExportExcel,
  hidePdf = false,
}: ExportButtonsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {!hidePdf && (
        <AppButton
          variant="outline"
          size="sm"
          leading={<KanvasIcons.print size={12} />}
          onClick={onExportPDF}
          disabled={!onExportPDF}
        >
          Export PDF
        </AppButton>
      )}
      <AppButton
        variant="outline"
        size="sm"
        leading={<KanvasIcons.download size={12} />}
        onClick={onExportExcel}
        disabled={!onExportExcel}
      >
        Export Excel
      </AppButton>
    </div>
  )
}
