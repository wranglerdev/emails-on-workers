import type { ReactNode } from 'react'

export function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-base-200 rounded-lg p-4 text-sm font-mono overflow-x-auto text-base-content/80 leading-relaxed mt-3">
      {children.trim()}
    </pre>
  )
}

export function IC({ children }: { children: string }) {
  return (
    <code className="bg-base-200 px-1.5 py-0.5 rounded text-[13px] font-mono text-base-content/80">
      {children}
    </code>
  )
}

export function P({ children }: { children: ReactNode }) {
  return <p className="text-sm text-base-content/70 leading-relaxed">{children}</p>
}

export function Sub({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] text-base-content/30 uppercase tracking-widest font-medium mt-7 mb-2">
      {children}
    </p>
  )
}

export interface FieldRow {
  field: string
  type?: string
  required?: boolean
  desc: string
}

export function FieldTable({ rows }: { rows: FieldRow[] }) {
  const hasType = rows.some((r) => r.type)
  return (
    <table className="w-full mt-3">
      <thead>
        <tr>
          <th className="text-left pb-3 text-[11px] text-base-content/30 font-medium uppercase tracking-widest w-[170px]">
            Field
          </th>
          {hasType && (
            <th className="text-left pb-3 text-[11px] text-base-content/30 font-medium uppercase tracking-widest w-[130px]">
              Type
            </th>
          )}
          <th className="text-left pb-3 text-[11px] text-base-content/30 font-medium uppercase tracking-widest">
            Notes
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.field} className="border-t border-base-200">
            <td className="py-2.5 pr-4 align-top">
              <code className="bg-base-200 px-1.5 py-0.5 rounded text-[12px] font-mono text-base-content/80">
                {r.field}
              </code>
              {r.required && (
                <span className="ml-1.5 text-[10px] text-error/60 uppercase tracking-wider font-medium">
                  req
                </span>
              )}
            </td>
            {hasType && (
              <td className="py-2.5 pr-4 align-top">
                <span className="text-sm text-base-content/40 font-mono">{r.type ?? ''}</span>
              </td>
            )}
            <td className="py-2.5 align-top">
              <span className="text-sm text-base-content/60 leading-relaxed">{r.desc}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
