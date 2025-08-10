## Groovy UI Style Guide

This guide documents the minimal, modular, “lego for software” design language used across the homepage and the base `/app` experience.

### Design Principles
- **Minimal**: Fewer colors; mostly white/black/gray. Use accent sparingly.
- **Modular**: Everything is a block. Cards stack into grids with consistent spacing.
- **Legible**: Strong headings, generous spacing, supportive italic subtext.
- **Icon‑forward**: Every section and action has an icon.
- **Low‑fi by default**: Empty states show dashed placeholders and simple copy.

### Typography
- **Primary font**: Inter (already loaded in `app/layout.tsx`).
- **Headings**: weight 600; sizes: h1 `text-3xl`, section titles `text-xl`.
- **Subtext**: italic, muted: `text-gray-600 italic`.
- **Body**: `text-sm` to `text-base` depending on density.

### Colors
- Backgrounds: `bg-[#F7F8FB]` app canvas; cards `bg-white`.
- Borders: light and consistent: `border-black/10`. Strong dividers when needed: `border-black` (rare).
- Text: black for headings, `text-gray-600` for supporting copy.
- Brand dark gradient (hero/banners): `bg-gradient-to-r from-[#0b0b0b] via-[#15161a] to-black` with optional texture overlay.

### Spacing & Radius
- Card padding: `p-6` (compact) or `p-8` (hero/banners).
- Grid gaps: `gap-6` (desktop), `gap-4` (dense areas).
- Radius: `rounded-xl` for cards, `rounded-md` for internal placeholders.

### Icons
- Use `lucide-react` icons at 16–24px depending on hierarchy.
- Section headers: 20–24px (e.g., `h-6 w-6`). Inline meta: 14–16px.

### Core Patterns

#### Standard Card (section block)
```tsx
<div className="rounded-xl border border-black/10 bg-white shadow-sm">
  <div className="flex items-center justify-between p-5">
    <div className="flex items-center gap-3">
      <Icon className="h-6 w-6" />
      <h2 className="text-xl font-semibold">Section Title</h2>
    </div>
    {/* Optional */}
    <Button className="h-10 rounded-full border border-black bg-white px-5 text-black hover:bg-black hover:text-white">Configure</Button>
  </div>
  <div className="border-t border-black/10" />
  <div className="p-5">
    {/* Empty state placeholder */}
    <div className="h-10 rounded-md border border-dashed border-black/20 bg-gray-50" />
    <p className="mt-2 text-sm text-gray-600 italic">No data yet</p>
  </div>
  {/* Optional footer */}
</div>
```

#### Header Bar (page top)
```tsx
<div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between pb-6 border-b">
  <div className="space-y-2">
    <h1 className="text-3xl font-semibold tracking-tight">Your Operating System</h1>
    <p className="text-gray-600 italic">A blank canvas. Configure to begin.</p>
  </div>
  <div className="flex items-center gap-3">
    <Button className="h-10 rounded-full border border-black bg-white px-5 text-black hover:bg-black hover:text-white">Invite</Button>
    <Button className="h-10 rounded-full border border-black bg-white px-5 text-black hover:bg-black hover:text-white">New Workflow</Button>
  </div>
</div>
```

#### Pill Buttons
- Base: `h-10 rounded-full border border-black bg-white px-5 text-black hover:bg-black hover:text-white`
- Inverse: `bg-black text-white hover:bg-white hover:text-black`

#### Segmented Progress (5 steps)
```tsx
<div className="rounded-full border border-black/10 bg-gray-100 p-1">
  <div className="flex h-4 w-full gap-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className={`flex-1 rounded-full ${i < completed ? 'bg-black' : 'bg-gray-300'}`} />
    ))}
  </div>
</div>
```

#### Microstep Row
```tsx
<div className="flex items-center justify-between rounded-lg border border-black/10 bg-gray-50 p-4">
  <div className="flex items-center gap-4">
    <div className="grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white text-[14px] font-medium">1</div>
    <div className="flex items-center gap-3">
      <Icon className="h-6 w-6" />
      <div>
        <div className="text-lg font-semibold">Step title</div>
        <div className="text-sm text-gray-600 italic">Not configured • ~10 mins</div>
      </div>
    </div>
  </div>
  <Button className="h-11 rounded-full border border-black bg-white px-6 text-black hover:bg-black hover:text-white">Configure</Button>
  </div>
```

#### Welcome Banner (dark)
```tsx
<div className="relative overflow-hidden rounded-xl border border-black/10 bg-gradient-to-r from-[#0b0b0b] via-[#15161a] to-black p-8 text-white">
  <div aria-hidden className="pointer-events-none absolute inset-0" style={{
    backgroundImage: 'radial-gradient(120% 120% at 0% 50%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 55%), linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)',
    backgroundSize: 'auto, 18px 18px, 18px 18px',
  }} />
  <div className="flex items-center gap-6 relative">
    {/* Mascot */}
    <div className="relative h-20 w-20 md:h-28 md:w-28 lg:h-36 lg:w-36">
      <Image src="/groovy%20mascot.png" alt="Mascot" fill className="object-contain origin-center scale-[1.9]" />
    </div>
    <div>
      <h2 className="text-2xl md:text-3xl font-semibold leading-tight">
        <span className="relative -top-0.5 italic">Welcome to </span>
        <Image src="/groovy-logo.png" alt="Groovy" width={280} height={80} className="ml-2 inline h-12 md:h-14 w-auto align-[-8px] invert brightness-0" />
      </h2>
      <p className="mt-2 text-base md:text-lg text-white/80 italic">Brand promise text here…</p>
    </div>
  </div>
</div>
```

### Sidebar
- Background: `bg-[#F7F8FB]`, border right.
- Logo: 25% larger than default (`h-10`), white version on dark backgrounds.
- Section label badge: uppercase capsule with `bg-gray-100`.
- Items: `h-12`, icons `h-6 w-6`, text `text-base font-semibold`, active state with left border and subtle bg.

### Empty States
- Use dashed placeholders: `border border-dashed border-black/20 bg-gray-50 rounded-md`.
- Provide short italic helper text under placeholders.

### Motion
- Subtle; prefer content clarity over motion. Use scale/opacity transitions under 250ms.

### Do/Don’t
- Do: keep edges straight and spacing consistent. Use icons and italic subtext.
- Don’t: add heavy shadows, saturated colors, or multiple accent hues.

### Accessibility
- Maintain contrast ratios (4.5:1 for text). Icons should include `aria-hidden` or accessible labels as needed.

### Implementation Notes
- Prefer Tailwind utility recipes shown above.
- Use our shadcn-based UI primitives as the default building blocks (e.g., `Button`, `Dialog`, `Card`, `Sidebar`). They provide the right semantics and accessibility by default; apply the classes in this guide on top.
- Keep new components consistent with the Standard Card and Pill Buttons patterns before adding variations.


