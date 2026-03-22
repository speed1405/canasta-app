import { Link } from 'react-router-dom'

interface PageLayoutProps {
  title: string
  children: React.ReactNode
  backTo?: string
  backLabel?: string
}

export function PageLayout({ title, children, backTo = '/', backLabel = 'Home' }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
      {/* Top bar */}
      <header className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-4 py-3 flex items-center gap-3 shadow-md">
        <Link
          to={backTo}
          className="flex items-center gap-1 text-slate-300 hover:text-white text-sm font-medium transition-colors shrink-0 rounded-lg px-2 py-1 hover:bg-white/10"
          aria-label={`Back to ${backLabel}`}
        >
          <span aria-hidden="true">←</span>
          <span>{backLabel}</span>
        </Link>
        <h1 className="text-lg font-bold flex-1 text-center pr-16 truncate">{title}</h1>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
