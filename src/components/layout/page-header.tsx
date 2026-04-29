interface PageHeaderProps {
  subtitle: string
  title: string
}

export function PageHeader({ subtitle, title }: PageHeaderProps) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold tracking-[1px] text-[var(--kanvas-ink-4)] uppercase">{subtitle}</p>
      <h1 className="mt-0.5 text-2xl leading-tight text-[var(--kanvas-ink)]">{title}</h1>
    </div>
  )
}
