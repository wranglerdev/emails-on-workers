import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { authClient } from '../lib/auth-client'
import { ThemeToggle } from './theme-toggle'

interface Props {
  name: string
  email: string
}

function HamburgerIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function NavLink({ to, children, onClick }: { to: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="px-3 py-1.5 text-sm rounded-lg transition-colors"
      activeProps={{ className: 'text-base-content font-medium' }}
      inactiveProps={{ className: 'text-base-content/45 hover:text-base-content' }}
    >
      {children}
    </Link>
  )
}

function closeDropdown() {
  ;(document.activeElement as HTMLElement)?.blur()
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
        {/* hamburger — mobile only */}
        <div className="dropdown lg:hidden">
          <button tabIndex={0} className="btn btn-ghost btn-circle" aria-label="Open menu">
            <HamburgerIcon />
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content bg-base-100 border border-base-200 rounded-box shadow-xl w-44 p-1 mt-1 z-50"
          >
            <li>
              <NavLink to="/" onClick={closeDropdown}>Dashboard</NavLink>
            </li>
            <li>
              <NavLink to="/logs" onClick={closeDropdown}>Logs</NavLink>
            </li>
          </ul>
        </div>

        <span className="text-lg font-bold px-4">Cloudflare Emails</span>
      </div>

      {/* nav links — desktop only */}
      <div className="navbar-center hidden lg:flex gap-0.5">
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/logs">Logs</NavLink>
      </div>

      <div className="navbar-end gap-1 pr-2">
        <ThemeToggle />

        <div className="dropdown dropdown-end">
          <button tabIndex={0} className="btn btn-ghost btn-circle" aria-label="Profile menu">
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
