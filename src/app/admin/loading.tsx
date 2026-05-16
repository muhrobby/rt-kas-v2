export default function AdminLoading() {
  return (
    <div className="flex min-h-svh min-w-0 bg-kanvas-paper">
      {/* Sidebar skeleton — desktop only */}
      <div className="hidden lg:flex">
        <div className="flex h-screen w-[220px] shrink-0 flex-col border-r border-kanvas-line bg-white p-4">
          {/* Logo area */}
          <div className="mb-6 space-y-2">
            <div className="h-5 w-32 animate-pulse rounded-md bg-kanvas-line" />
            <div className="h-3.5 w-20 animate-pulse rounded-md bg-kanvas-line-2" />
          </div>

          {/* Saldo card skeleton */}
          <div className="mb-4 rounded-xl border border-kanvas-line bg-kanvas-paper p-3 space-y-2">
            <div className="h-3 w-16 animate-pulse rounded bg-kanvas-line-2" />
            <div className="h-5 w-28 animate-pulse rounded bg-kanvas-line" />
          </div>

          {/* Nav items */}
          <nav className="space-y-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-9 w-full animate-pulse rounded-lg bg-kanvas-line-2"
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </nav>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar skeleton */}
        <div className="flex h-[52px] shrink-0 items-center justify-between border-b border-kanvas-line bg-white px-4 md:px-6">
          <div className="h-4 w-36 animate-pulse rounded-md bg-kanvas-line" />
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 animate-pulse rounded-full bg-kanvas-line" />
            <div className="h-4 w-20 animate-pulse rounded-md bg-kanvas-line-2" />
          </div>
        </div>

        {/* Page content skeleton */}
        <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6">
          {/* Page header */}
          <div className="space-y-2">
            <div className="h-6 w-48 animate-pulse rounded-md bg-kanvas-line" />
            <div className="h-4 w-72 animate-pulse rounded-md bg-kanvas-line-2" />
          </div>

          {/* Stat cards row */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-kanvas-line bg-white p-4 space-y-2"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="h-3 w-20 animate-pulse rounded bg-kanvas-line-2" />
                <div className="h-6 w-28 animate-pulse rounded bg-kanvas-line" />
              </div>
            ))}
          </div>

          {/* Main content card */}
          <div className="rounded-xl border border-kanvas-line bg-white p-4 space-y-3">
            <div className="h-4 w-32 animate-pulse rounded bg-kanvas-line" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
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
