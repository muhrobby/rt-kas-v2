"use client"

import { AppButton, KanvasIcons, useToast } from "@/components/kanvas"

interface ExportButtonsProps {
  contextLabel: string
  onExportPDF?: () => void
  onExportExcel?: () => void
  pdfDisabled?: boolean
  excelDisabled?: boolean
  hidePdf?: boolean
}

export function ExportButtons({
  contextLabel,
  onExportPDF,
  onExportExcel,
  pdfDisabled = false,
  excelDisabled = false,
  hidePdf = false,
}: ExportButtonsProps) {
  const { pushToast } = useToast()

  const handleExportPDF = () => {
    if (pdfDisabled) {
      pushToast(`Export PDF ${contextLabel} akan aktif setelah template selesai`, "warn")
    } else {
      onExportPDF?.()
    }
  }

  const handleExportExcel = () => {
    if (excelDisabled || !onExportExcel) {
      pushToast(`Export Excel ${contextLabel} akan aktif setelah backend selesai`, "warn")
    } else {
      onExportExcel()
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!hidePdf && (
        <AppButton
          variant="outline"
          size="sm"
          leading={<KanvasIcons.print size={12} />}
          onClick={handleExportPDF}
        >
          Export PDF
        </AppButton>
      )}
      <AppButton
        variant="outline"
        size="sm"
        leading={<KanvasIcons.download size={12} />}
        onClick={handleExportExcel}
      >
        Export Excel
      </AppButton>
    </div>
  )
}
