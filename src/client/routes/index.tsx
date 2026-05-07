import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

function Dashboard() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow">
        <span className="text-xl font-bold px-4">Cloudflare Emails</span>
      </div>
      <main className="p-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </main>
    </div>
  )
}
