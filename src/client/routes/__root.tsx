import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { sessionQueryOptions } from '../lib/session-query'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context }) => {
    // fetchQuery (not ensureQueryData) so stale data after invalidation triggers a real refetch
    const session = await context.queryClient
      .fetchQuery(sessionQueryOptions)
      .catch(() => null)
    return { session }
  },
  component: () => <Outlet />,
})
