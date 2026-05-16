export default function WargaLoading() {
  return (
    <div className="min-h-svh bg-kanvas-paper">
      {/* Header skeleton */}
      <header className="sticky top-0 z-30 border-b border-kanvas-line bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-[1100px] items-center justify-between px-4 py-2.5 md:px-6 md:py-3">
          <div className="space-y-1.5">
            <div className="h-3 w-36 animate-pulse rounded bg-kanvas-line-2" />
            <div className="h-5 w-28 animate-pulse rounded bg-kanvas-line" />
          </div>
          <div className="flex items-center gap-2 rounded-full border border-kanvas-line bg-kanvas-paper-2 px-2 py-1">
            <div className="h-7 w-7 animate-pulse rounded-full bg-kanvas-line" />
            <div className="space-y-1 pr-0.5">
              <div className="h-3 w-20 animate-pulse rounded bg-kanvas-line" />
              <div className="h-2.5 w-12 animate-pulse rounded bg-kanvas-line-2" />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1100px] md:min-h-[calc(100svh-61px)]">
        {/* Sidebar skeleton — desktop only */}
        <aside className="hidden w-[188px] shrink-0 border-r border-kanvas-line bg-white p-3 md:block">
          <div className="mb-3 rounded-lg border border-kanvas-line bg-kanvas-paper-2 p-2.5 space-y-1.5">
            <div className="h-3.5 w-28 animate-pulse rounded bg-kanvas-line" />
            <div className="h-3 w-16 animate-pulse rounded bg-kanvas-line-2" />
            <div className="mt-1.5 h-5 w-14 animate-pulse rounded-full bg-kanvas-line-2" />
          </div>
          <nav className="space-y-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-9 w-full animate-pulse rounded-lg bg-kanvas-line-2"
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </nav>
        </aside>

        {/* Page content skeleton */}
        <div className="min-w-0 flex-1 p-4 pb-[88px] md:p-6 md:pb-6 space-y-5">
          {/* Page header */}
          <div className="space-y-1.5">
            <div className="h-6 w-44 animate-pulse rounded-md bg-kanvas-line" />
            <div className="h-4 w-64 animate-pulse rounded-md bg-kanvas-line-2" />
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-kanvas-line bg-white p-4 space-y-2"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="h-3 w-20 animate-pulse rounded bg-kanvas-line-2" />
                <div className="h-6 w-24 animate-pulse rounded bg-kanvas-line" />
              </div>
            ))}
          </div>

          {/* Content card */}
          <div className="rounded-xl border border-kanvas-line bg-white p-4 space-y-3">
            <div className="h-4 w-32 animate-pulse rounded bg-kanvas-line" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-full animate-pulse rounded-lg bg-kanvas-line-2"
                  style={{ animationDelay: `${i * 50}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
