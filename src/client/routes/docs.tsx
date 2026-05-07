import { createFileRoute, redirect } from '@tanstack/react-router'
import type { ComponentType } from 'react'
import { AppHeader } from '../components/app-header'
import {
  OverviewSection,
  AuthSection,
  SendEmailSection,
  AddressesSection,
  AttachmentsSection,
  SchedulingSection,
  LifecycleSection,
  LogsApiSection,
} from '../components/docs/sections'

export const Route = createFileRoute('/docs')({
  beforeLoad: ({ context }) => {
    if (!context.session) throw redirect({ to: '/sign-in' })
  },
  component: DocsPage,
})

// ─── section registry ────────────────────────────────────────────
// To add a new section: create a component in components/docs/sections/,
// export it from sections/index.ts, then add one entry here.

interface DocSection {
  id: string
  label: string
  Content: ComponentType
}

const SECTIONS: DocSection[] = [
  { id: 'overview',       label: 'Overview',          Content: OverviewSection },
  { id: 'authentication', label: 'Authentication',    Content: AuthSection },
  { id: 'send-email',     label: 'Send an Email',     Content: SendEmailSection },
  { id: 'addresses',      label: 'Addresses',         Content: AddressesSection },
  { id: 'attachments',    label: 'Attachments',       Content: AttachmentsSection },
  { id: 'scheduling',     label: 'Scheduled Delivery',Content: SchedulingSection },
  { id: 'lifecycle',      label: 'Delivery & Retries',Content: LifecycleSection },
  { id: 'logs-api',       label: 'Logs API',          Content: LogsApiSection },
]

// ─── page ────────────────────────────────────────────────────────

function DocsPage() {
  const { session } = Route.useRouteContext()
  const { name, email } = session!.user

  return (
    <div className="min-h-screen bg-base-100">
      <AppHeader name={name} email={email} />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-[11px] text-base-content/40 uppercase tracking-widest font-medium mb-2">
            Documentation
          </p>
          <p className="text-sm text-base-content/50 leading-relaxed max-w-md">
            API reference and guides for sending transactional email with Cloudflare Emails.
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-[180px_1fr] lg:gap-16">
          {/* sticky TOC — desktop only */}
          <aside className="hidden lg:block">
            <div className="sticky top-8">
              <p className="text-[11px] text-base-content/30 uppercase tracking-widest font-medium mb-4">
                Contents
              </p>
              <nav className="flex flex-col gap-3">
                {SECTIONS.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="text-sm text-base-content/45 hover:text-base-content transition-colors"
                  >
                    {s.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* content */}
          <div className="flex flex-col min-w-0">
            {SECTIONS.map((s, i) => (
              <div key={s.id}>
                {i > 0 && <div className="border-t border-base-200 my-10" />}
                <section id={s.id} className="scroll-mt-6">
                  <p className="text-[11px] text-base-content/40 uppercase tracking-widest font-medium mb-5">
                    {s.label}
                  </p>
                  <s.Content />
                </section>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
