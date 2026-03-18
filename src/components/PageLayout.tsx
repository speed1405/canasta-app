import { Link } from 'react-router-dom'

interface PageLayoutProps {
  title: string
  children: React.ReactNode
  backTo?: string
  backLabel?: string
}

export function PageLayout({ title, children, backTo = '/', backLabel = '← Home' }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
      {/* Top bar */}
      <header className="bg-slate-800 text-white px-4 py-3 flex items-center gap-4">
        <Link
          to={backTo}
          className="text-slate-300 hover:text-white text-sm transition-colors"
          aria-label={backLabel}
        >
          {backLabel}
        </Link>
        <h1 className="text-lg font-bold flex-1 text-center pr-16">{title}</h1>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
