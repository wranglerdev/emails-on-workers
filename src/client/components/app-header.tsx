import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { authClient } from '../lib/auth-client'

interface Props {
  name: string
  email: string
}

export function AppHeader({ name, email }: Props) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    await authClient.signOut()
    queryClient.removeQueries({ queryKey: ['session'] })
    navigate({ to: '/sign-in' })
  }

  const initial = name.charAt(0).toUpperCase()

  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="navbar-start">
        <span className="text-lg font-bold px-4">Cloudflare Emails</span>
      </div>

      <div className="navbar-end pr-2">
        <div className="dropdown dropdown-end">
          <button
            tabIndex={0}
            className="btn btn-ghost btn-circle"
            aria-label="Profile menu"
          >
            <div className="avatar avatar-placeholder">
              <div className="bg-primary text-primary-content rounded-full w-9 h-9 flex items-center justify-center">
                <span className="text-sm font-semibold select-none">{initial}</span>
              </div>
            </div>
          </button>

          <div
            tabIndex={0}
            className="dropdown-content bg-base-100 rounded-box shadow-xl border border-base-200 w-60 z-50 mt-1 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-base-200">
              <p className="text-sm font-semibold truncate">{name}</p>
              <p className="text-xs text-base-content/60 truncate">{email}</p>
            </div>
            <div className="p-1">
              <button
                className="btn btn-ghost btn-sm w-full justify-start text-error"
                onClick={handleSignOut}
                disabled={signingOut}
              >
                {signingOut && <span className="loading loading-spinner loading-xs" />}
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
