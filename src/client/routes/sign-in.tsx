import { useState } from 'react'
import { createFileRoute, redirect, Link, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { authClient } from '../lib/auth-client'
import { FieldErrors } from '../components/field-errors'

export const Route = createFileRoute('/sign-in')({
  beforeLoad: ({ context }) => {
    if (context.session) {
      throw redirect({ to: '/' })
    }
  },
  component: SignIn,
})

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

function SignIn() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [authError, setAuthError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onSubmit: signInSchema },
    onSubmit: async ({ value }) => {
      setAuthError(null)
      await authClient.signIn.email(value, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['session'] })
          navigate({ to: '/' })
        },
        onError: ({ error }) => {
          setAuthError(error.message ?? 'Sign in failed')
        },
      })
    },
  })

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-base-content/60 text-sm mt-1">Sign in to your account</p>
          </div>

          {authError && (
            <div role="alert" className="alert alert-error text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{authError}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="flex flex-col gap-3"
          >
            <form.Field name="email">
              {(field) => (
                <div className="form-control">
                  <label className="label" htmlFor="email">
                    <span className="label-text font-medium">Email</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={`input input-bordered w-full${field.state.meta.errors.length ? ' input-error' : ''}`}
                    placeholder="you@example.com"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    autoComplete="email"
                  />
                  <FieldErrors field={field} />
                </div>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <div className="form-control">
                  <label className="label" htmlFor="password">
                    <span className="label-text font-medium">Password</span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    className={`input input-bordered w-full${field.state.meta.errors.length ? ' input-error' : ''}`}
                    placeholder="••••••••"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    autoComplete="current-password"
                  />
                  <FieldErrors field={field} />
                </div>
              )}
            </form.Field>

            <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
              {([canSubmit, isSubmitting]) => (
                <button
                  type="submit"
                  className="btn btn-primary w-full mt-2"
                  disabled={!canSubmit}
                >
                  {isSubmitting && <span className="loading loading-spinner loading-sm" />}
                  Sign in
                </button>
              )}
            </form.Subscribe>
          </form>

          <p className="text-center text-sm text-base-content/60">
            Don't have an account?{' '}
            <Link to="/sign-up" className="font-medium underline underline-offset-2">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
