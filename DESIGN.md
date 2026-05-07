# Design System

Minimalist, high-contrast aesthetic inspired by Polar.sh and Linear. Every surface earns its presence — no decorative borders, no gradients, no shadows unless they carry structural meaning.

## Themes

Two daisyUI themes are active: `lofi` (light) and `black` (dark). Both use fully desaturated palettes — no color except for semantic signals (success, error, warning).

```css
/* src/style.css */
@plugin "daisyui" {
  themes: lofi --default, black --prefersdark;
}
```

FOUC is prevented by a blocking inline script in `<head>` (see `index.html`) that reads `localStorage` and sets `data-theme` before React mounts.

### Theme token cheatsheet

| Token | Light (`lofi`) | Dark (`black`) |
|---|---|---|
| `base-100` | Pure white | True black |
| `base-200` | Off-white (97%) | Dark grey (19%) |
| `base-content` | Black | Light grey (87%) |
| `primary` | Very dark grey | Mid grey |
| `error` | Muted red | Vivid red |
| `success` | Muted green | Vivid green |

Both themes have `--depth: 0` and `--noise: 0` — no emboss effects, no texture. Radii are pill-shaped (`2rem` for fields/selectors) with a modest `0.5rem` for boxes/cards.

---

## Spacing & Layout

Pages use a single centered column:

```tsx
<div className="min-h-screen bg-base-100">
  <AppHeader />
  <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-10">
    {/* sections */}
  </main>
</div>
```

- `max-w-4xl` keeps line length readable without feeling cramped.
- `gap-10` between top-level sections. Dividers (`border-t border-base-200`) replace visual cards.
- Auth/modal pages center content with `min-h-screen bg-base-200 flex items-center justify-center p-4`.

---

## Typography

Text hierarchy uses opacity rather than size, keeping the visual weight quiet:

| Role | Classes |
|---|---|
| Section label | `text-[11px] text-base-content/40 uppercase tracking-widest font-medium` |
| Primary number / stat | `text-3xl font-semibold tabular-nums tracking-tight` |
| Body / table cell | `text-sm` |
| Secondary / muted | `text-sm text-base-content/50` — `text-base-content/35` for timestamps |
| De-emphasized | `text-base-content/30` |
| Page title (auth) | `text-2xl font-bold` |
| Subtitle (auth) | `text-base-content/60 text-sm mt-1` |

**Rules:**
- Use opacity variants (`/60`, `/40`, `/30`) instead of separate grey tokens.
- `tracking-widest` is reserved for section labels only.
- Numbers displayed alongside labels use `tabular-nums`.
- No `text-xl` or `text-lg` in body content — jump straight from `text-sm` to `text-3xl` for stats.

---

## Section Headers

All section headers follow a single pattern — no `<h2>`, just a tiny uppercase label:

```tsx
<p className="text-[11px] text-base-content/40 uppercase tracking-widest font-medium mb-5">
  Section Title
</p>
```

Pair with a secondary label on the right for metadata:

```tsx
<div className="flex items-baseline justify-between mb-5">
  <p className="text-[11px] text-base-content/40 uppercase tracking-widest font-medium">
    Activity
  </p>
  <span className="text-[11px] text-base-content/25">Last 28 days</span>
</div>
```

---

## Stat Block

Large number above a small label. Used in grid layouts for overview metrics.

```tsx
function StatBlock({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className={`text-3xl font-semibold tabular-nums tracking-tight${muted ? ' text-base-content/30' : ''}`}>
        {value}
      </span>
      <span className="text-[11px] text-base-content/40 uppercase tracking-widest font-medium">
        {label}
      </span>
    </div>
  )
}
```

Grid: `grid grid-cols-2 sm:grid-cols-4 gap-x-10 gap-y-7`

Use `muted` for values that are less actionable (e.g., "Pending" vs "Sent").

---

## Activity Chart

CSS-only flex bar chart. No chart library.

```tsx
<div className="flex items-end gap-[3px] h-14">
  {data.map((day) => {
    const barPct = Math.max((day.total / maxTotal) * 100, 3)
    const errPct = day.total > 0 ? (day.failed / day.total) * 100 : 0
    return (
      <div key={day.date} className="flex-1 relative" style={{ height: `${barPct}%` }}>
        <div className="absolute inset-0 rounded-[2px] bg-base-content/10" />
        {errPct > 0 && (
          <div
            className="absolute top-0 inset-x-0 rounded-t-[2px] bg-error/50"
            style={{ height: `${errPct}%` }}
          />
        )}
      </div>
    )
  })}
</div>
```

- Bars are `bg-base-content/10` — barely visible, intentionally quiet.
- Error overlay is `bg-error/50` at the top of the bar.
- Date range labels sit below with `text-[10px] text-base-content/30`.
- Minimum bar height of `3%` prevents zero-data bars from disappearing.

---

## Data Table

Borderless rows with a top border separator. No outer table border, no striping.

```tsx
<table className="w-full">
  <thead>
    <tr>
      <th className="text-left pb-3 text-[11px] text-base-content/30 font-medium uppercase tracking-widest">
        Column
      </th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-t border-base-200 group">
      <td className="py-3 pr-6">
        <span className="text-sm block truncate max-w-[280px] group-hover:text-base-content transition-colors">
          Value
        </span>
      </td>
    </tr>
  </tbody>
</table>
```

- Column headers match section label style: `text-[11px] text-base-content/30 uppercase tracking-widest`.
- Rows use `group` + `group-hover:text-base-content` to lift text color on hover without background change.
- Long text truncates with `truncate max-w-[Npx]`.
- Timestamps align right: `text-right` on the `<th>` and `<td>`.

---

## Status Badge

Inline dot + label. No pill background.

```tsx
const STATUS_COLOR = {
  sent: 'bg-success',
  failed: 'bg-error',
  pending: 'bg-base-content/25',
}

function StatusBadge({ status }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLOR[status]}`} />
      <span className="text-sm text-base-content/60">{label}</span>
    </span>
  )
}
```

---

## Navbar / App Header

daisyUI `navbar` with brand name left, controls right.

```tsx
<div className="navbar bg-base-100 shadow-sm">
  <div className="navbar-start">
    <span className="text-lg font-bold px-4">App Name</span>
  </div>
  <div className="navbar-end gap-1 pr-2">
    <ThemeToggle />
    {/* profile dropdown */}
  </div>
</div>
```

- `shadow-sm` is the only shadow in the entire design.
- Brand name is plain `font-bold` text — no logo component.

### Profile Dropdown

```tsx
<div className="dropdown dropdown-end">
  <button tabIndex={0} className="btn btn-ghost btn-circle">
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
      <button className="btn btn-ghost btn-sm w-full justify-start text-error">
        Sign out
      </button>
    </div>
  </div>
</div>
```

---

## Theme Toggle

Icon-only button that opens a dropdown with three choices. Active item gets daisyUI `active` class.

```tsx
<div className="dropdown dropdown-end">
  <button tabIndex={0} className="btn btn-ghost btn-circle">
    <Icon /> {/* current theme icon */}
  </button>
  <ul tabIndex={0} className="dropdown-content menu bg-base-100 border border-base-200 rounded-box shadow-xl w-36 p-1 mt-1 z-50">
    {(['light', 'dark', 'system'] as const).map((t) => (
      <li key={t}>
        <button className={theme === t ? 'active' : ''} onClick={() => setTheme(t)}>
          <Icon /> {labels[t]}
        </button>
      </li>
    ))}
  </ul>
</div>
```

Icons are inline SVGs (`w-4 h-4`, `stroke="currentColor"`, `strokeWidth="2"`). No icon library.

---

## Auth Pages

Centered card on `bg-base-200` background.

```tsx
<div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
  <div className="card w-full max-w-sm bg-base-100 shadow-xl">
    <div className="card-body gap-4">
      <div>
        <h1 className="text-2xl font-bold">Page Title</h1>
        <p className="text-base-content/60 text-sm mt-1">Subtitle</p>
      </div>
      {/* error alert, form, footer link */}
    </div>
  </div>
</div>
```

---

## Forms (TanStack Form + Zod)

Forms validate on **submit only** — never on change or blur.

### Zod schema

```ts
const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
```

### Form setup

```ts
const form = useForm({
  defaultValues: { email: '', password: '' },
  validators: { onSubmit: schema },
  onSubmit: async ({ value }) => { /* ... */ },
})
```

### Field

```tsx
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
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      <FieldErrors field={field} />
    </div>
  )}
</form.Field>
```

### FieldErrors component

```tsx
function FieldErrors({ field }: { field: AnyFieldApi }) {
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
```

### Submit button with loading state

```tsx
<form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
  {([canSubmit, isSubmitting]) => (
    <button type="submit" className="btn btn-primary w-full mt-2" disabled={!canSubmit}>
      {isSubmitting && <span className="loading loading-spinner loading-sm" />}
      Submit
    </button>
  )}
</form.Subscribe>
```

### Cross-field validation (e.g. confirm password)

Use a field-level `validators.onSubmit` and read sibling values via `fieldApi.form.state.values`:

```tsx
<form.Field
  name="confirmPassword"
  validators={{
    onSubmit: ({ value, fieldApi }) => {
      if (!value) return 'Please confirm your password'
      if (value !== fieldApi.form.state.values.password) return "Passwords don't match"
    },
  }}
>
```

Exclude the confirm field from the Zod schema — handle it only at field level to avoid double errors.

### Auth errors (server-side)

Use `useState` for errors returned by the auth client:

```tsx
const [authError, setAuthError] = useState<string | null>(null)

// in onSubmit:
await authClient.signIn.email(value, {
  onSuccess: () => { /* navigate */ },
  onError: ({ error }) => setAuthError(error.message ?? 'Sign in failed'),
})

// in JSX:
{authError && (
  <div role="alert" className="alert alert-error text-sm">
    <svg /* X circle icon */ />
    <span>{authError}</span>
  </div>
)}
```

---

## Loading States

| Context | Pattern |
|---|---|
| Full page | `<div className="min-h-screen bg-base-100 flex items-center justify-center"><span className="loading loading-spinner loading-md text-base-content/30" /></div>` |
| Button | `<span className="loading loading-spinner loading-sm" />` inline before label |
| Inline (small) | `loading-xs` |

---

## Empty States

Plain text, no illustrations:

```tsx
<p className="text-sm text-base-content/30 py-6">No emails sent yet.</p>
```

---

## Do / Don't

| Do | Don't |
|---|---|
| Use `base-content/{opacity}` for hierarchy | Add colored backgrounds to cards or rows |
| Use `border-base-200` for structural dividers | Use `border-base-300` or heavier borders |
| Let sections breathe with `gap-10` | Stack sections tightly |
| Use inline SVG icons (`w-4 h-4`) | Import an icon library |
| Show error state with `input-error` + `FieldErrors` | Show inline text without the red `input-error` border |
| Truncate long text with `truncate max-w-[Npx]` | Let text wrap in table cells |
| Use `tabular-nums` for any numeric display | Mix proportional and tabular numbers |
| Write section labels in `text-[11px] uppercase tracking-widest` | Use `<h2>`/`<h3>` tags for section headings |
