import { useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { AppHeader } from '../components/app-header'
import { FieldErrors } from '../components/field-errors'

// ── schema ─────────────────────────────────────────────────────────
// Mirrors src/schemas/email.ts constraints — same limits, same rules.

const optionalEmail = (msg: string) =>
  z.string().refine(
    (val) => !val || z.email().safeParse(val).success,
    msg,
  )

const sendFormSchema = z.object({
  to: z.email('Invalid recipient email'),
  fromEmail: z.email('Invalid sender email'),
  fromName: z.string(),
  subject: z
    .string()
    .min(1, 'Subject cannot be empty')
    .max(998, 'Subject exceeds RFC 5322 limit'),
  body: z.string().min(1, 'Email body cannot be empty'),
  cc: optionalEmail('Invalid CC email'),
  bcc: optionalEmail('Invalid BCC email'),
  replyToEmail: optionalEmail('Invalid reply-to email'),
  replyToName: z.string(),
})

// ── route ──────────────────────────────────────────────────────────

export const Route = createFileRoute('/send')({
  beforeLoad: ({ context }) => {
    if (!context.session) throw redirect({ to: '/sign-in' })
  },
  component: SendEmail,
})

// ── helpers ────────────────────────────────────────────────────────

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

// ── component ──────────────────────────────────────────────────────

function SendEmail() {
  const { session } = Route.useRouteContext()
  const { name, email } = session!.user

  const [bodyMode, setBodyMode] = useState<'html' | 'text'>('html')
  const [showPreview, setShowPreview] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [successId, setSuccessId] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      to: '',
      fromEmail: email,
      fromName: name,
      subject: '',
      body: '',
      cc: '',
      bcc: '',
      replyToEmail: '',
      replyToName: '',
    },
    validators: { onSubmit: sendFormSchema },
    onSubmit: async ({ value }) => {
      setApiError(null)
      setSuccessId(null)

      const from = value.fromName.trim()
        ? { email: value.fromEmail, name: value.fromName.trim() }
        : value.fromEmail

      const replyTo = value.replyToEmail
        ? value.replyToName.trim()
          ? { email: value.replyToEmail, name: value.replyToName.trim() }
          : value.replyToEmail
        : undefined

      const payload = {
        to: value.to,
        from,
        subject: value.subject,
        ...(bodyMode === 'html' ? { html: value.body } : { text: value.body }),
        ...(value.cc ? { cc: value.cc } : {}),
        ...(value.bcc ? { bcc: value.bcc } : {}),
        ...(replyTo !== undefined ? { replyTo } : {}),
      }

      try {
        const res = await fetch('/v1/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const data = await res.json()

        if (!res.ok) {
          setApiError(data.error ?? 'Failed to send email')
          return
        }

        setSuccessId(data.id)
      } catch {
        setApiError('Network error — please try again')
      }
    },
  })

  return (
    <div className="min-h-screen bg-base-100">
      <AppHeader name={name} email={email} />

      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-10">
        <section>
          <p className="text-[11px] text-base-content/40 uppercase tracking-widest font-medium mb-7">
            Compose
          </p>

          {successId && (
            <div role="alert" className="flex items-center gap-3 mb-6 py-3 px-4 bg-base-200 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
              <span className="text-sm flex-1">
                Email queued{' '}
                <span className="text-base-content/35 font-mono text-xs tabular-nums">
                  {successId}
                </span>
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-xs text-base-content/40"
                onClick={() => setSuccessId(null)}
              >
                Dismiss
              </button>
            </div>
          )}

          {apiError && (
            <div role="alert" className="alert alert-error mb-6">
              <svg
                className="w-4 h-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6M9 9l6 6" />
              </svg>
              <span className="text-sm">{apiError}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="flex flex-col gap-5"
          >
            {/* To */}
            <form.Field name="to">
              {(field) => (
                <div className="form-control">
                  <label className="label pb-1" htmlFor="to">
                    <span className="label-text font-medium">To</span>
                  </label>
                  <input
                    id="to"
                    type="email"
                    className={`input input-bordered w-full${field.state.meta.errors.length ? ' input-error' : ''}`}
                    placeholder="recipient@example.com"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldErrors field={field} />
                </div>
              )}
            </form.Field>

            {/* From */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <form.Field name="fromEmail">
                {(field) => (
                  <div className="form-control">
                    <label className="label pb-1" htmlFor="fromEmail">
                      <span className="label-text font-medium">From</span>
                    </label>
                    <input
                      id="fromEmail"
                      type="email"
                      className={`input input-bordered w-full${field.state.meta.errors.length ? ' input-error' : ''}`}
                      placeholder="sender@example.com"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldErrors field={field} />
                  </div>
                )}
              </form.Field>

              <form.Field name="fromName">
                {(field) => (
                  <div className="form-control">
                    <label className="label pb-1" htmlFor="fromName">
                      <span className="label-text font-medium">
                        Display name{' '}
                        <span className="text-base-content/35 font-normal">optional</span>
                      </span>
                    </label>
                    <input
                      id="fromName"
                      type="text"
                      className="input input-bordered w-full"
                      placeholder="Acme Inc"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.Field>
            </div>

            {/* Subject */}
            <form.Field name="subject">
              {(field) => (
                <div className="form-control">
                  <label className="label pb-1" htmlFor="subject">
                    <span className="label-text font-medium">Subject</span>
                  </label>
                  <input
                    id="subject"
                    type="text"
                    className={`input input-bordered w-full${field.state.meta.errors.length ? ' input-error' : ''}`}
                    placeholder="Your email subject"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldErrors field={field} />
                </div>
              )}
            </form.Field>

            <div className="border-t border-base-200" />

            {/* Body */}
            <form.Field name="body">
              {(field) => (
                <div className="form-control">
                  <div className="flex items-center justify-between mb-2">
                    <div role="tablist" className="tabs tabs-bordered tabs-sm">
                      <button
                        type="button"
                        role="tab"
                        className={`tab${bodyMode === 'html' ? ' tab-active' : ''}`}
                        onClick={() => {
                          setBodyMode('html')
                          setShowPreview(false)
                        }}
                      >
                        HTML
                      </button>
                      <button
                        type="button"
                        role="tab"
                        className={`tab${bodyMode === 'text' ? ' tab-active' : ''}`}
                        onClick={() => {
                          setBodyMode('text')
                          setShowPreview(false)
                        }}
                      >
                        Plain text
                      </button>
                    </div>

                    {bodyMode === 'html' && (
                      <button
                        type="button"
                        className="text-[11px] text-base-content/40 uppercase tracking-widest font-medium hover:text-base-content/60 transition-colors"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        {showPreview ? 'Edit' : 'Preview'}
                      </button>
                    )}
                  </div>

                  {showPreview && bodyMode === 'html' ? (
                    <iframe
                      srcDoc={field.state.value || '<p style="color:#999;font-family:sans-serif">Nothing to preview yet.</p>'}
                      sandbox=""
                      className={`w-full h-64 rounded-lg bg-white border${field.state.meta.errors.length ? ' border-error' : ' border-base-200'}`}
                      title="HTML preview"
                    />
                  ) : (
                    <textarea
                      id="body"
                      className={`textarea textarea-bordered w-full h-52 resize-y leading-relaxed${bodyMode === 'html' ? ' font-mono text-xs' : ''}${field.state.meta.errors.length ? ' textarea-error' : ''}`}
                      placeholder={
                        bodyMode === 'html'
                          ? '<p>Hello, world!</p>'
                          : 'Hello, world!'
                      }
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  )}
                  <FieldErrors field={field} />
                </div>
              )}
            </form.Field>

            <div className="border-t border-base-200" />

            {/* Advanced */}
            <div>
              <button
                type="button"
                className="text-[11px] text-base-content/40 uppercase tracking-widest font-medium hover:text-base-content/60 transition-colors inline-flex items-center gap-1.5"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <ChevronIcon
                  className={`w-3 h-3 transition-transform${showAdvanced ? ' rotate-90' : ''}`}
                />
                Advanced
              </button>

              {showAdvanced && (
                <div className="mt-5 flex flex-col gap-5">
                  {/* CC */}
                  <form.Field name="cc">
                    {(field) => (
                      <div className="form-control">
                        <label className="label pb-1" htmlFor="cc">
                          <span className="label-text font-medium">
                            CC{' '}
                            <span className="text-base-content/35 font-normal">optional</span>
                          </span>
                        </label>
                        <input
                          id="cc"
                          type="email"
                          className={`input input-bordered w-full${field.state.meta.errors.length ? ' input-error' : ''}`}
                          placeholder="cc@example.com"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        <FieldErrors field={field} />
                      </div>
                    )}
                  </form.Field>

                  {/* BCC */}
                  <form.Field name="bcc">
                    {(field) => (
                      <div className="form-control">
                        <label className="label pb-1" htmlFor="bcc">
                          <span className="label-text font-medium">
                            BCC{' '}
                            <span className="text-base-content/35 font-normal">optional</span>
                          </span>
                        </label>
                        <input
                          id="bcc"
                          type="email"
                          className={`input input-bordered w-full${field.state.meta.errors.length ? ' input-error' : ''}`}
                          placeholder="bcc@example.com"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        <FieldErrors field={field} />
                      </div>
                    )}
                  </form.Field>

                  {/* Reply-To */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <form.Field name="replyToEmail">
                      {(field) => (
                        <div className="form-control">
                          <label className="label pb-1" htmlFor="replyToEmail">
                            <span className="label-text font-medium">
                              Reply-To{' '}
                              <span className="text-base-content/35 font-normal">optional</span>
                            </span>
                          </label>
                          <input
                            id="replyToEmail"
                            type="email"
                            className={`input input-bordered w-full${field.state.meta.errors.length ? ' input-error' : ''}`}
                            placeholder="reply@example.com"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                          <FieldErrors field={field} />
                        </div>
                      )}
                    </form.Field>

                    <form.Field name="replyToName">
                      {(field) => (
                        <div className="form-control">
                          <label className="label pb-1" htmlFor="replyToName">
                            <span className="label-text font-medium">
                              Reply-To name{' '}
                              <span className="text-base-content/35 font-normal">optional</span>
                            </span>
                          </label>
                          <input
                            id="replyToName"
                            type="text"
                            className="input input-bordered w-full"
                            placeholder="Support Team"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </div>
                      )}
                    </form.Field>
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
                {([canSubmit, isSubmitting]) => (
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!canSubmit}
                  >
                    {isSubmitting && (
                      <span className="loading loading-spinner loading-sm" />
                    )}
                    Send email
                  </button>
                )}
              </form.Subscribe>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}
