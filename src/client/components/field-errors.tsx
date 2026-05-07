import type { AnyFieldApi } from '@tanstack/react-form'

export function FieldErrors({ field }: { field: AnyFieldApi }) {
  if (!field.state.meta.errors.length) return null
  return (
    <div className="label">
      <span className="label-text-alt text-error">
        {field.state.meta.errors
          .map((e) => (typeof e === 'string' ? e : (e as { message: string })?.message))
          .filter(Boolean)
          .join(', ')}
      </span>
    </div>
  )
}
