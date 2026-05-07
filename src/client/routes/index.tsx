import { createFileRoute, redirect } from '@tanstack/react-router'
import { AppHeader } from '../components/app-header'

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    if (!context.session) {
      throw redirect({ to: '/sign-in' })
    }
  },
  component: Dashboard,
})

function Dashboard() {
  const { session } = Route.useRouteContext()
  const { name, email } = session!.user

  return (
    <div className="min-h-screen bg-base-200">
      <AppHeader name={name} email={email} />
      <main className="p-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </main>
    </div>
  )
}
